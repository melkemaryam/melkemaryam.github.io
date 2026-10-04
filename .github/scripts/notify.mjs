/* Comment moderation notifier.
 *
 * Looks in Firestore for comments waiting for approval and keeps ONE GitHub
 * issue in sync with them, so GitHub's own notifications (email/app) tell you
 * when something needs moderating:
 *   - new pending comment(s)  -> opens an issue, or comments on the open one
 *   - nothing pending any more -> closes the issue
 *   - nothing changed          -> does nothing (no repeat notifications)
 *
 * This repo is public, so the issue only ever contains counts per page — never
 * a commenter's name or message. Page and document ids come from visitors
 * (anyone can write to Firestore), so they are sanitised before being echoed.
 */

import { pathToFileURL } from "node:url";

const LABEL = "comment-moderation";
const LIMIT = 200;
const SAFE_PAGE_ID = /^[a-z0-9._-]{1,60}$/i;

const safeId = (id) => String(id).replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 40);

export function parseIds(body = "") {
  const match = body.match(/<!-- pending-ids: ([^>]*?) -->/);
  return match && match[1].trim() ? match[1].trim().split(",") : [];
}

export function plan(pendingIds, openIssue) {
  const known = openIssue ? parseIds(openIssue.body) : [];
  const fresh = pendingIds.filter((id) => !known.includes(id));
  const resolved = known.filter((id) => !pendingIds.includes(id));

  if (!openIssue) return { action: pendingIds.length ? "create" : "none", fresh: fresh.length };
  if (!pendingIds.length) return { action: "close" };
  if (fresh.length) return { action: "notify", fresh: fresh.length };
  if (resolved.length) return { action: "update" };
  return { action: "none" };
}

export function buildIssue(pending, { owner, consoleUrl, atLimit }) {
  const total = atLimit ? `${pending.length}+` : `${pending.length}`;

  const counts = {};
  for (const { pageId } of pending) {
    const page = SAFE_PAGE_ID.test(pageId) ? pageId : "(other)";
    counts[page] = (counts[page] || 0) + 1;
  }
  const rows = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([page, count]) => `| \`${page}\` | ${count} |`);

  return {
    title: `Comments awaiting approval (${total})`,
    body: [
      `@${owner} ${pending.length === 1 ? "there is 1 comment" : `there are ${total} comments`} waiting for approval on the website.`,
      "",
      "| Page | Pending |",
      "| --- | --- |",
      ...rows,
      "",
      `Review them in the [Firebase console](${consoleUrl}): set \`approved\` to \`true\` to publish a comment, or delete the document to reject it.`,
      "",
      "This issue updates itself and closes automatically once nothing is pending, so approve or delete the comments rather than closing the issue by hand. The comment text is deliberately not shown here because this repository is public.",
      "",
      `<!-- pending-ids: ${pending.map((p) => p.id).join(",")} -->`,
    ].join("\n"),
  };
}

export async function run({ fetchPending, github, owner, consoleUrl }) {
  const { pending, atLimit } = await fetchPending();
  const openIssue = (await github.listOpenIssues()).find((issue) => !issue.pull_request) ?? null;
  const decision = plan(pending.map((p) => p.id), openIssue);
  const issue = buildIssue(pending, { owner, consoleUrl, atLimit });

  switch (decision.action) {
    case "create":
      await github.ensureLabel();
      await github.createIssue({ ...issue, labels: [LABEL] });
      break;
    case "notify":
      // Comment first, then update the stored ids: if this run dies half-way,
      // the next run repeats the notification instead of silently missing it.
      await github.comment(
        openIssue.number,
        `@${owner} ${decision.fresh} new comment${decision.fresh === 1 ? "" : "s"} awaiting approval (${pending.length}${atLimit ? "+" : ""} pending in total).`
      );
      await github.updateIssue(openIssue.number, issue);
      break;
    case "update":
      await github.updateIssue(openIssue.number, issue);
      break;
    case "close":
      await github.comment(openIssue.number, "Nothing is pending any more, all caught up.");
      await github.updateIssue(openIssue.number, { state: "closed", state_reason: "completed" });
      break;
  }

  console.log(`pending=${pending.length} action=${decision.action}`);
  return decision;
}

function githubClient({ token, repo }) {
  const call = async (path, { method = "GET", body, tolerate = [] } = {}) => {
    const res = await fetch(`https://api.github.com/repos/${repo}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok && !tolerate.includes(res.status)) {
      throw new Error(`GitHub API ${method} ${path} failed: ${res.status} ${await res.text()}`);
    }
    return res.status === 204 ? null : res.json();
  };

  return {
    listOpenIssues: () => call(`/issues?labels=${LABEL}&state=open&per_page=20`),
    // 422 just means the label already exists
    ensureLabel: () =>
      call("/labels", {
        method: "POST",
        body: { name: LABEL, color: "5319e7", description: "Website comments waiting for approval" },
        tolerate: [422],
      }),
    createIssue: (body) => call("/issues", { method: "POST", body }),
    comment: (number, text) => call(`/issues/${number}/comments`, { method: "POST", body: { body: text } }),
    updateIssue: (number, body) => call(`/issues/${number}`, { method: "PATCH", body }),
  };
}

async function fetchPendingFromFirestore(serviceAccount) {
  const { Firestore } = await import("@google-cloud/firestore");
  const db = new Firestore({
    projectId: serviceAccount.project_id,
    credentials: { client_email: serviceAccount.client_email, private_key: serviceAccount.private_key },
  });
  try {
    const snap = await db.collection("comments").where("approved", "==", false).limit(LIMIT).get();
    return {
      pending: snap.docs.map((d) => ({ id: safeId(d.id), pageId: String(d.get("pageId") ?? "") })),
      atLimit: snap.size >= LIMIT,
    };
  } finally {
    await db.terminate();
  }
}

async function main() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    console.log("FIREBASE_SERVICE_ACCOUNT is not set, skipping.");
    return;
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not valid JSON (paste the whole downloaded key file).");
  }

  await run({
    fetchPending: () => fetchPendingFromFirestore(serviceAccount),
    github: githubClient({ token: process.env.GITHUB_TOKEN, repo: process.env.GITHUB_REPOSITORY }),
    owner: process.env.GITHUB_REPOSITORY_OWNER,
    consoleUrl: `https://console.firebase.google.com/project/${serviceAccount.project_id}/firestore/databases/-default-/data/~2Fcomments`,
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
