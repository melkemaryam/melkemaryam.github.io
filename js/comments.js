/* ==========================================================================
   Hannah M. Claus — personal site
   Comments, backed by Firebase Firestore.

   No login required to comment. New comments are written with
   approved:false and only become publicly visible once you flip that
   field to true in the Firebase console (Firestore Database > Data).
   A hidden honeypot field filters out simple bots.

   Replies are single-level: you can reply to a top-level comment, but
   a reply itself has no "Reply" button — replying to a reply attaches
   to the original top-level comment instead, so threads stay flat and
   readable rather than nesting indefinitely.

   Setup: see README.md "Comments" section for how to create a free
   Firebase project, apply the security rules, and get the config
   object below.
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDTpZggQSIN_Im6W4P-vquziV6V0tHlh10",
  authDomain: "website-comments-af007.firebaseapp.com",
  projectId: "website-comments-af007",
  storageBucket: "website-comments-af007.firebasestorage.app",
  messagingSenderId: "775151698464",
  appId: "1:775151698464:web:74bb6251808f06f8193245",
  measurementId: "G-3NPLZYPDQP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatDate(createdAt) {
  return createdAt?.toDate
    ? createdAt.toDate().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out — check the Firebase config in js/comments.js")), ms)
    ),
  ]);
}

function initComments() {
  const section = document.querySelector(".comments-section[data-page-id]");
  if (!section) return;

  const pageId = section.dataset.pageId;
  const list = section.querySelector(".comment-list");
  const countEl = section.querySelector(".comments-count");
  const form = section.querySelector(".comment-form");
  const statusEl = section.querySelector(".comment-status");

  let openReplyForm = null; // tracks the single currently-open reply form, if any

  async function submitComment({ name, message, parentId, submitBtn, localStatusEl }) {
    submitBtn.disabled = true;
    localStatusEl.hidden = true;
    try {
      await withTimeout(
        addDoc(collection(db, "comments"), {
          pageId,
          name,
          message,
          ...(parentId ? { parentId } : {}),
          approved: false,
          createdAt: serverTimestamp(),
        }),
        10000
      );
      localStatusEl.textContent = "Thanks! Your comment has been submitted and will appear once approved.";
      localStatusEl.hidden = false;
      return true;
    } catch (err) {
      localStatusEl.textContent = "Sorry, something went wrong submitting your comment. Please try again.";
      localStatusEl.hidden = false;
      console.error("Failed to submit comment:", err);
      return false;
    } finally {
      submitBtn.disabled = false;
    }
  }

  function buildReplyForm(parentId) {
    const wrap = document.createElement("form");
    wrap.className = "comment-form comment-reply-form";
    wrap.noValidate = true;
    wrap.innerHTML = `
      <div>
        <label>Name</label>
        <input type="text" class="reply-name" placeholder="Your name" required />
      </div>
      <div class="hp-field" aria-hidden="true">
        <label>Website</label>
        <input type="text" class="reply-website" tabindex="-1" autocomplete="off" />
      </div>
      <div>
        <label>Reply</label>
        <textarea class="reply-message" rows="2" placeholder="Write a reply…" required></textarea>
      </div>
      <div class="form-foot">
        <p class="form-note reply-status" hidden></p>
        <div style="display:flex; gap:.6rem;">
          <button type="button" class="btn btn--ghost reply-cancel">Cancel</button>
          <button type="submit" class="btn btn--primary">Post reply</button>
        </div>
      </div>
    `;

    wrap.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = wrap.querySelector(".reply-name").value.trim();
      const message = wrap.querySelector(".reply-message").value.trim();
      const honeypot = wrap.querySelector(".reply-website").value.trim();
      if (honeypot) return;
      if (!name || !message) return;

      const ok = await submitComment({
        name,
        message,
        parentId,
        submitBtn: wrap.querySelector('button[type="submit"]'),
        localStatusEl: wrap.querySelector(".reply-status"),
      });
      if (ok) wrap.reset();
    });

    wrap.querySelector(".reply-cancel").addEventListener("click", () => {
      wrap.remove();
      openReplyForm = null;
    });

    return wrap;
  }

  function toggleReplyForm(commentEl, parentId) {
    if (openReplyForm) {
      openReplyForm.remove();
      openReplyForm = null;
    }
    // If the click was on the comment whose form was just closed, stop here (acts as a toggle).
    if (commentEl.dataset.openReply === "true") {
      commentEl.dataset.openReply = "";
      return;
    }
    document.querySelectorAll(".comment[data-open-reply]").forEach((el) => (el.dataset.openReply = ""));

    const replyForm = buildReplyForm(parentId);
    commentEl.querySelector(".comment-reply-btn").insertAdjacentElement("afterend", replyForm);
    replyForm.querySelector(".reply-name").focus();
    openReplyForm = replyForm;
    commentEl.dataset.openReply = "true";
  }

  function buildCommentEl(data, replies, allowReply) {
    const item = document.createElement("article");
    item.className = "comment";

    const head = document.createElement("div");
    head.className = "comment-head";

    const avatar = document.createElement("span");
    avatar.className = "comment-avatar";
    avatar.textContent = initials(data.name) || "?";

    const name = document.createElement("span");
    name.className = "comment-name";
    name.textContent = data.name;

    const date = document.createElement("span");
    date.className = "comment-date";
    date.textContent = formatDate(data.createdAt);

    head.append(avatar, name, date);

    const body = document.createElement("p");
    body.className = "comment-body";
    body.textContent = data.message;

    item.append(head, body);

    if (allowReply) {
      const replyBtn = document.createElement("button");
      replyBtn.type = "button";
      replyBtn.className = "comment-reply-btn";
      replyBtn.textContent = "Reply";
      replyBtn.addEventListener("click", () => toggleReplyForm(item, data.id));
      item.appendChild(replyBtn);
    }

    if (replies && replies.length) {
      const repliesEl = document.createElement("div");
      repliesEl.className = "comment-replies";
      replies
        .slice()
        .sort((a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0))
        .forEach((r) => repliesEl.appendChild(buildCommentEl(r, null, false)));
      item.appendChild(repliesEl);
    }

    return item;
  }

  function renderComments(comments) {
    list.innerHTML = "";
    openReplyForm = null;

    countEl.textContent = comments.length
      ? `${comments.length} comment${comments.length === 1 ? "" : "s"}`
      : "No comments yet — be the first to add one.";

    const topLevel = comments.filter((c) => !c.parentId);
    const repliesByParent = {};
    comments.forEach((c) => {
      if (c.parentId) {
        (repliesByParent[c.parentId] = repliesByParent[c.parentId] || []).push(c);
      }
    });

    if (!topLevel.length) {
      const empty = document.createElement("p");
      empty.className = "comment-empty";
      empty.textContent = "Be the first to leave a comment.";
      list.appendChild(empty);
      return;
    }

    topLevel.forEach((data) => {
      list.appendChild(buildCommentEl(data, repliesByParent[data.id], true));
    });
  }

  async function loadComments() {
    try {
      const q = query(
        collection(db, "comments"),
        where("pageId", "==", pageId),
        where("approved", "==", true),
        orderBy("createdAt", "asc")
      );
      const snap = await withTimeout(getDocs(q), 10000);
      renderComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      countEl.textContent = "Comments are temporarily unavailable.";
      console.error("Failed to load comments:", err);
    }
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = form.querySelector("#comment-name").value.trim();
      const message = form.querySelector("#comment-message").value.trim();
      const honeypot = form.querySelector("#comment-website").value.trim();

      if (honeypot) return; // silently drop — almost certainly a bot
      if (!name || !message) return;

      const ok = await submitComment({
        name,
        message,
        parentId: null,
        submitBtn: form.querySelector('button[type="submit"]'),
        localStatusEl: statusEl,
      });
      if (ok) form.reset();
    });
  }

  loadComments();
}

document.addEventListener("DOMContentLoaded", initComments);
