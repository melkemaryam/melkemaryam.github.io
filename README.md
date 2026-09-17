# Hannah M. Claus — personal site

A static site (HTML/CSS/JS, no build step) ready to publish with GitHub Pages.

## What's here

```
index.html                       Home page — hero, about, research, publications,
                                  media, blog preview, community, CV, contact
blog.html                        Blog listing page
media.html                       Full, filterable list of all talks/podcasts/press
templates/
  blog-post-template.html          Copy into blog/ for every new blog post
  research-project-template.html   Copy into research/ for every research project
blog/                             One file per real blog post (copied from the template)
research/                         One file per real research project (copied from the template)
css/style.css                    All styles and design tokens (colors, type, spacing)
js/main.js                       Nav, dark-mode toggle, filters, animations
assets/                          Put your portrait, CV PDF, and images here
  favicon.svg                      The green sun browser-tab icon, linked from every page
sitemap.xml                      Lists your pages for search engines
robots.txt                       Allows search engine crawling, points to sitemap.xml
```

Files inside `blog/`, `research/`, and `templates/` are one folder deep, so
their internal links back to the site use `../` (e.g. `../css/style.css`,
`../index.html#about`, `../blog.html`) — keep that in mind if you copy a
template to start a new entry.

Design notes: the palette and type pairing were chosen to match a
community-centred, African-rooted AI aesthetic (inspired by Lelapa AI's
Ubuntu-informed identity) — warm sand paired with a green-forward accent
palette (a bright moss/lime green and a deep forest green, alongside the
original olive), with Fraunces for display type and a hand-built "woven
triangle" pattern used as a signature motif throughout (see `.weave-strip`
and `.network-field` in `css/style.css` / `js/main.js`). The accent
variables are still named `--ochre` and `--terracotta` in the CSS (their
original colors), even though their values are now greens — rename them in
`css/style.css` if you'd like the variable names to match.

## 1. Publish it on GitHub Pages

This site is set up to publish at **https://melkemaryam.github.io/** via
the repo `melkemaryam/melkemaryam.github.io` (already created).

1. Push these files to the repository root:
   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/melkemaryam/melkemaryam.github.io.git
   git push -u origin main
   ```
2. In the repo on GitHub: **Settings → Pages → Build and deployment →
   Source: Deploy from a branch → Branch: `main` / `root`** → Save.
3. Your site will be live at `https://melkemaryam.github.io/`.

No build tools, frameworks, or dependencies are required — it's plain
HTML/CSS/JS plus Google Fonts loaded via CDN link tags.

## 2. Fill in your content

Every placeholder is marked with an HTML comment like
`<!-- PLACEHOLDER: ... -->` and bracketed text like `[Your title]`.
Search each file for `PLACEHOLDER` and replace it with your real content:

- **Hero** — your title/affiliation, one-line summary, quick facts
- **About** — bio paragraphs and the three "pillar" statements
- **Research** — project cards (title + 1–2 sentence description).
  Each card links out to a project detail page — copy
  `templates/research-project-template.html` into `research/` per
  project (see `research/` for the projects already started) and
  update the card's `href` to point at the new file.
- **Publications** — each `<article class="pub-item" data-type="...">`
  is one entry; `data-type` must be one of `journal`, `conference`,
  `preprint`, `report` for the filter buttons to work. Duplicate the
  block for each new publication and keep entries roughly newest-first.
  Each title is wrapped in an `<a>` — fill in its `href` with a link to
  the actual paper/report.
- **Media & Speaking** — the homepage shows your three most recent
  items; the "Show more" button links to `media.html`, which lists
  everything, filterable by category the same way Publications is.
  Duplicate an `<article class="pub-item" data-type="...">` block in
  `media.html` for each talk/podcast/press item (`data-type` must
  match one of that page's filter buttons: `keynote`, `panel`,
  `podcast`, `press`, `misc`), and fill in each title's `href`
  with a link to the recording/episode/article.
- **Blog** — edit `blog.html` and copy `templates/blog-post-template.html`
  into `blog/` for each real post (see `blog/` for the posts already
  started); update the teaser cards on both `blog.html` and the
  homepage `#blog` section to link to the new file
- **Community** — workshops, teaching, consultancies
- **CV / Background** — three columns of short timeline entries
  (Education, Research Experience, Advisor/Consultancy)
- **Contact** — your real email, LinkedIn, GitHub, and Google Scholar
  URLs (used in the Contact section, the nav quick-links, and the
  footer — see "Social links" below)

## 3. Add your images

Put files in `assets/` (e.g. `assets/portrait.jpg`).
In `index.html`, replace the hero placeholder:

```html
<div class="hero-portrait">
  <img src="assets/portrait.jpg" alt="Portrait of Hannah M. Claus" />
</div>
```

Blog and media thumbnails (`.blog-thumb`, `.media-thumb`) are currently
empty/gradient placeholders — add an `<img>` inside them the same way,
or a background-image in CSS if you prefer.

Every blog post and research project page also has a header image
placeholder (`.post-hero-img`, showing "[ Header image ]" on a gradient
background) right below the title/date. Replace it with a real photo:

```html
<div class="post-hero-img">
  <img src="../assets/your-image.jpg" alt="Describe the image" />
</div>
```

## 4. Contact form

The form on the Contact section has no backend (GitHub Pages only
serves static files), so it currently opens the visitor's email client
via a `mailto:` link pre-filled with their message (see the bottom of
`js/main.js` — update the placeholder address `hello@example.com`
there to your real email).

If you'd rather have real form submissions land somewhere, swap this
for a free static-form service such as:
- [Formspree](https://formspree.io/) — point the `<form>`'s `action`
  at your Formspree endpoint and remove the JS `preventDefault` logic
- [Netlify Forms](https://docs.netlify.com/forms/setup/) — if you move
  hosting to Netlify instead of GitHub Pages

## 5. Dark mode

A dark/light toggle lives in the nav (top right). It respects the
visitor's system preference on first visit and remembers their choice
in `localStorage` afterwards. All colors are defined once as CSS
variables in `css/style.css` under `:root` and `[data-theme="dark"]` —
adjust them there if you want to retune the palette.

## 6. Customizing the design tokens

Open `css/style.css` and edit the `:root` block at the top:

```css
--sand:       #F0EEDB;  /* main background */
--ink:        #1D2116;  /* main text / dark sections */
--ochre:      #9CB255;  /* primary accent — bright moss/lime green */
--terracotta: #4B6B23;  /* secondary accent, links, hovers — deep forest green */
--olive:      #6B7A34;  /* tertiary accent, sprinkled into tags,
                            pub types, the role line, and the media
                            thumbnail gradient */
```

Fonts are loaded from Google Fonts in the `<head>` of each HTML file
(Fraunces for headings, Inter for body text, Space Mono for
labels/eyebrows/dates). Swap the `<link>` tag and the `--font-*`
variables together if you want a different pairing.

## 7. Social links

Quick-link icons for LinkedIn, GitHub, Google Scholar, and Email
appear in three places: the nav bar (desktop and mobile menu), the
footer, and the Contact section. All are marked `<!-- PLACEHOLDER -->`
in `index.html`, `blog.html`, and `templates/blog-post-template.html` — search
for `data-social` to find every instance, and replace the `href="#"`
values with your real profile URLs (and `mailto:hello@example.com`
with your real address). The icons are hand-drawn inline SVGs, so no
external icon library is needed.

## 8. Blog post comments & reshare

Every page built from `templates/blog-post-template.html` includes:

- **Reshare buttons** — Share (native share sheet on supported
  devices/browsers), X, LinkedIn, Email, and Copy link. These just
  build a share-intent URL or copy the current page's link; nothing
  to configure.
- **Comments** — real, shared, public comments, self-built on
  [Firebase Firestore](https://firebase.google.com) (free tier, no
  credit card). No account needed to comment — just a name. New
  comments are held for your approval before anyone else sees them
  (`js/comments.js` writes them with `approved: false`), which is how
  a login-free comment box stays spam-free.

  **One-time setup:**
  1. Go to [console.firebase.google.com](https://console.firebase.google.com/),
     sign in, and click **Add project** (the free "Spark" plan is
     enough — no credit card required). Name it anything.
  2. In the project, go to **Build → Firestore Database → Create
     database**. Pick a region close to your readers, and start in
     production mode.
  3. Open the **Rules** tab of Firestore Database and replace the
     contents with:
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /comments/{commentId} {
           allow read: if resource.data.approved == true;
           allow create: if request.resource.data.approved == false
                         && request.resource.data.pageId is string
                         && request.resource.data.name is string
                         && request.resource.data.name.size() > 0
                         && request.resource.data.name.size() < 100
                         && request.resource.data.message is string
                         && request.resource.data.message.size() > 0
                         && request.resource.data.message.size() < 2000;
           allow update, delete: if false;
         }
       }
     }
     ```
     then click **Publish**. This lets anyone submit a comment
     (unapproved) and read only approved ones — nobody can edit or
     delete via the site itself; that's admin-only, from the console.
  4. Go to **Project settings** (gear icon, top left) → **General**
     tab → under "Your apps," click the web icon (`</>`) → register
     an app (any nickname, no need for Firebase Hosting) → copy the
     `firebaseConfig` object it shows you.
  5. Open `js/comments.js` and paste your values over the
     `firebaseConfig` placeholder near the top of the file. This one
     file covers every post — no per-page setup needed.
  - **To moderate:** in the Firebase console, go to **Firestore
    Database → Data → comments**. Each new comment appears there with
    `approved: false`. Click a document, change `approved` to `true`,
    and it becomes publicly visible on the site. Delete the document
    instead to reject a comment (e.g. spam).
  - Each post needs a unique `data-page-id` on its
    `<section class="comments-section" data-page-id="...">` (already
    set per file) — if you rename a post file, keep its `data-page-id`
    the same so existing comments stay attached to it.

## 9. Decorative doodles

Small, original hand-drawn-style marks — a spiral, a sunburst, a
zigzag, a scatter of dots, stacked triangles, a wave, a diamond
outline, concentric rings — are tucked into the margins of each
section. They're loosely inspired by geometric motifs common across
many indigenous and African textile and art traditions (spirals,
radiating suns, chevrons, dot clusters), kept intentionally abstract
rather than reproducing any specific cultural symbol.

Each one is a small inline `<svg class="doodle">` sitting right after
its section's opening tag in the HTML, positioned with a `style="top:
…; right: …;"` (or `bottom`/`left`) attribute as a percentage of that
section. To adjust one: search the HTML files for `class="doodle"`,
tweak the position percentages, or delete the line to remove it. They
automatically hide below 960px width, since there's no spare margin
for them on tablet/mobile layouts. The shared styling (`opacity`,
`pointer-events: none` so they never block clicks) lives in
`css/style.css` under the "Doodles" section — change the opacity
there to make all of them lighter or bolder at once.

## 10. SEO — helping people find this by searching your name

A few things are already wired up so search engines can understand
and index the site properly:

- **`sitemap.xml`** and **`robots.txt`** at the project root list your
  pages for search engines and explicitly allow crawling.
- **Structured data** (the `<script type="application/ld+json">` block
  in `index.html`'s `<head>`) tells Google this page is about a
  specific *person* — this is what can earn you a knowledge panel
  when people search your name directly.
- **Open Graph tags** (`og:title`, `og:description`, `og:image`,
  `og:url`) on every page control how the site looks when shared on
  LinkedIn, X, or Slack.
- **Canonical URLs** on every page avoid duplicate-content confusion.

All of these already point at `https://melkemaryam.github.io/`. If you
ever change the site's URL (new repo, custom domain), search every HTML
file for the old URL and update it there and in `sitemap.xml` /
`robots.txt`. The `sameAs` links in the structured data are already
filled in with the real LinkedIn/GitHub/Scholar URLs.

To actually get indexed:

1. **Publish first** (step 1 above) so the site has a real URL.
2. **Google Search Console** ([search.google.com/search-console](https://search.google.com/search-console)) —
   add your site as a property, verify ownership (Search Console
   gives you a choice of methods — a DNS record or an HTML file to
   upload are usually easiest for a GitHub Pages site), then submit
   `sitemap.xml` from the sidebar. This is the fastest route to
   getting indexed, rather than waiting for Google to find it on its
   own.
3. **Link to it from places Google already trusts** — your
   institution's staff page, LinkedIn, GitHub bio, Google Scholar
   profile. Backlinks from established pages do more for how well you
   rank than almost anything on the page itself.
4. **Be patient** — even with Search Console, initial indexing
   typically takes anywhere from a few days to a couple of weeks.
5. Every time you publish a new blog post, add a `<url>` entry for it
   in `sitemap.xml` (there's a commented-out example at the bottom of
   the file) and fill in that post's own title/description/canonical
   tags (see `templates/blog-post-template.html`'s `<head>`) so it can
   be found and shared properly on its own.

## 11. A couple of things to double check before publishing

- Update the page `<title>` and `<meta name="description">` tags in
  each HTML file with your final copy (search engines and link
  previews use these).
- Replace the `mailto:hello@example.com` address in `js/main.js`.
- Add real `href` values for LinkedIn, X/Twitter, and Google Scholar
  in the Contact section of `index.html`.
- When you name a new post file in `blog/` (e.g.
  `blog/2026-01-community-ai.html`), remember to update the links that
  point to it from `blog.html` and the homepage blog preview.
