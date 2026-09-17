/* ==========================================================================
   Hannah M. Claus — personal site
   main.js
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Mobile nav toggle
     --------------------------------------------------------------------- */
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------------------
     Scroll-spy: highlight the nav link for the section in view
     --------------------------------------------------------------------- */
  const sections = document.querySelectorAll("main section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a[href^='#']");

  if (sections.length && navAnchors.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navAnchors.forEach((a) => a.classList.remove("is-active"));
            const match = document.querySelector(
              `.nav-links a[href="#${entry.target.id}"]`
            );
            if (match) match.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------------------------------------------------------------------
     Theme toggle (light / dark), persisted to localStorage
     --------------------------------------------------------------------- */
  const themeToggle = document.querySelector(".theme-toggle");
  const root = document.documentElement;
  const STORAGE_KEY = "hmc-theme";

  function applyTheme(theme) {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }

  const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme("dark");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      const next = isDark ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }

  /* ---------------------------------------------------------------------
     Reveal-on-scroll
     --------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const revealer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------------------
     Back-to-top button
     --------------------------------------------------------------------- */
  const toTop = document.querySelector(".to-top");
  if (toTop) {
    window.addEventListener("scroll", () => {
      toTop.classList.toggle("is-visible", window.scrollY > 700);
    });
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------------------------------------------------------------
     Publications filter
     --------------------------------------------------------------------- */
  const filterButtons = document.querySelectorAll(".pub-filters button");
  const pubItems = document.querySelectorAll(".pub-item");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const filter = btn.dataset.filter;

      pubItems.forEach((item) => {
        const show = filter === "all" || item.dataset.type === filter;
        item.style.display = show ? "grid" : "none";
      });
    });
  });

  /* ---------------------------------------------------------------------
     Current year in footer
     --------------------------------------------------------------------- */
  const yearEl = document.querySelector("[data-current-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Signature graphic 1: woven triangle strip
     A textile-inspired pattern of alternating triangles, used as a
     section-divider "signature" motif throughout the site.
     --------------------------------------------------------------------- */
  function buildWeaveStrip(el) {
    const colors = ["#D98E2C", "#B5451D", "#6B7A34", "#F1E6D2"];
    const w = 40;
    const h = 14;
    const count = 46;
    let tris = "";
    for (let i = 0; i < count; i++) {
      const x = i * w;
      const color = colors[i % colors.length];
      if (i % 2 === 0) {
        tris += `<polygon points="${x},0 ${x + w},0 ${x + w / 2},${h}" fill="${color}" />`;
      } else {
        tris += `<polygon points="${x},${h} ${x + w},${h} ${x + w / 2},0" fill="${color}" />`;
      }
    }
    el.innerHTML = `<svg viewBox="0 0 ${count * w} ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${tris}</svg>`;
  }

  document.querySelectorAll(".weave-strip").forEach(buildWeaveStrip);

  /* ---------------------------------------------------------------------
     Signature graphic 2: node / network field
     A field of connected, gently pulsing nodes — evokes both
     community (people, connection) and AI (networks). Used as
     ambient hero background.
     --------------------------------------------------------------------- */
  function buildNetworkField(el) {
    const w = 1200;
    const h = 700;
    const count = 26;
    const points = [];
    for (let i = 0; i < count; i++) {
      points.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 2 + Math.random() * 2,
      });
    }

    let lines = "";
    points.forEach((p, i) => {
      points.forEach((q, j) => {
        if (j <= i) return;
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < 220) {
          lines += `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(
            1
          )}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" />`;
        }
      });
    });

    let circles = "";
    points.forEach((p, i) => {
      const delay = (i % 8) * 0.4;
      circles += `<circle class="node-pulse" cx="${p.x.toFixed(
        1
      )}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(
        1
      )}" style="animation-delay:${delay}s" />`;
    });

    el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${lines}${circles}</svg>`;
  }

  document.querySelectorAll(".network-field").forEach(buildNetworkField);

  /* ---------------------------------------------------------------------
     Signature graphic 3: Ubuntu glyph (interlocking circles)
     A simple, original glyph — not a copied symbol — of overlapping
     circles representing interdependence, used beside the community
     ethos statement.
     --------------------------------------------------------------------- */
  function buildUbuntuGlyph(el) {
    el.innerHTML = `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="24" cy="32" r="16" fill="none" stroke="#D98E2C" stroke-width="2.5"/>
        <circle cx="40" cy="32" r="16" fill="none" stroke="#B5451D" stroke-width="2.5"/>
        <circle cx="32" cy="20" r="16" fill="none" stroke="#6B7A34" stroke-width="2.5"/>
      </svg>`;
  }
  document.querySelectorAll(".ubuntu-glyph").forEach(buildUbuntuGlyph);

  /* ---------------------------------------------------------------------
     Blog post reshare buttons
     Static hosting has no backend, so "reshare" opens each platform's
     own share intent (or the device's native share sheet) pointed at
     the current post URL — no tracking, no accounts needed.
     --------------------------------------------------------------------- */
  const shareRow = document.querySelector(".share-row");
  if (shareRow) {
    const pageUrl = window.location.href;
    const pageTitle = document.title;

    shareRow.querySelectorAll("[data-share]").forEach((btn) => {
      const kind = btn.dataset.share;

      if (kind === "copy") {
        btn.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(pageUrl);
            const original = btn.querySelector(".share-label");
            if (original) {
              const prevText = original.textContent;
              original.textContent = "Copied!";
              btn.classList.add("is-copied");
              setTimeout(() => {
                original.textContent = prevText;
                btn.classList.remove("is-copied");
              }, 1800);
            }
          } catch (err) {
            window.prompt("Copy this link:", pageUrl);
          }
        });
        return;
      }

      if (kind === "native") {
        if (navigator.share) {
          btn.addEventListener("click", () => {
            navigator.share({ title: pageTitle, url: pageUrl }).catch(() => {});
          });
        } else {
          btn.style.display = "none";
        }
        return;
      }

      if (kind === "x") {
        const text = encodeURIComponent(pageTitle);
        const url = encodeURIComponent(pageUrl);
        btn.href = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        return;
      }

      if (kind === "linkedin") {
        const url = encodeURIComponent(pageUrl);
        btn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        return;
      }

      if (kind === "email") {
        const subject = encodeURIComponent(pageTitle);
        const body = encodeURIComponent(pageUrl);
        btn.href = `mailto:?subject=${subject}&body=${body}`;
        return;
      }
    });
  }

  /* ---------------------------------------------------------------------
     Contact form (static hosting: no backend).
     Prevents default submit and gives a clear next step instead of
     silently failing. Replace with a real form endpoint (e.g. Formspree,
     Netlify Forms, or a mailto link) when ready — see README.
     --------------------------------------------------------------------- */
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = contactForm.querySelector("#name")?.value || "";
      const email = contactForm.querySelector("#email")?.value || "";
      const message = contactForm.querySelector("#message")?.value || "";
      const subject = encodeURIComponent(`Website message from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:hmc78@cam.ac.uk?subject=${subject}&body=${body}`;
    });
  }
})();
