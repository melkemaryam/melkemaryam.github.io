/* ==========================================================================
   Hannah M. Claus — personal site
   Comments, backed by Firebase Firestore.

   No login required to comment. New comments are written with
   approved:false and only become publicly visible once you flip that
   field to true in the Firebase console (Firestore Database > Data).
   A hidden honeypot field filters out simple bots.

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

  function renderComments(comments) {
    list.innerHTML = "";
    countEl.textContent = comments.length
      ? `${comments.length} comment${comments.length === 1 ? "" : "s"}`
      : "No comments yet — be the first to add one.";

    if (!comments.length) {
      const empty = document.createElement("p");
      empty.className = "comment-empty";
      empty.textContent = "Be the first to leave a comment.";
      list.appendChild(empty);
      return;
    }

    comments.forEach((data) => {
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
      date.textContent = data.createdAt?.toDate
        ? data.createdAt.toDate().toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "";

      head.append(avatar, name, date);

      const body = document.createElement("p");
      body.className = "comment-body";
      body.textContent = data.message;

      item.append(head, body);
      list.appendChild(item);
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
      renderComments(snap.docs.map((d) => d.data()));
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

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      statusEl.hidden = true;

      try {
        await withTimeout(
          addDoc(collection(db, "comments"), {
            pageId,
            name,
            message,
            approved: false,
            createdAt: serverTimestamp(),
          }),
          10000
        );
        form.reset();
        statusEl.textContent = "Thanks! Your comment has been submitted and will appear once approved.";
        statusEl.hidden = false;
      } catch (err) {
        statusEl.textContent = "Sorry, something went wrong submitting your comment. Please try again.";
        statusEl.hidden = false;
        console.error("Failed to submit comment:", err);
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  loadComments();
}

document.addEventListener("DOMContentLoaded", initComments);
