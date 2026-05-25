# Outpost Media Website — Deployment Guide

## Files in This Folder

| File | Purpose |
|---|---|
| `index.html` | Homepage — latest articles + stream previews |
| `outpost-reports.html` | Outpost Reports stream page |
| `press-check.html` | Press Check stream page |
| `honest-atheism.html` | Honest Atheism stream page |
| `outpost-briefs.html` | Outpost Briefs page (with Concept/Atlas/Flashpoint tabs) |
| `about.html` | About page |
| `style.css` | All visual design |
| `app.js` | Navigation, footer, RSS fetching logic |
| `logo.png` | ← **Add your logo here** |

---

## How to Add a Logo

1. Place your logo image file in this folder
2. Rename it to `logo.png`
3. It will appear automatically in the nav and footer

---

## How to Add New Content (Super Simple)

**You don't need to touch the website code at all.**

1. Publish your article on **Substack** as normal
2. **Tag the post** with the correct stream name (see below)
3. The website automatically shows new articles — no action needed

### Substack Tags to Use

| Stream | Tag to apply in Substack |
|---|---|
| Outpost Reports | `Outpost Reports` |
| Press Check | `Press Check` |
| Honest Atheism | `Honest Atheism` |
| Concept File (Briefs) | `Concept File` |
| Atlas File (Briefs) | `Atlas File` |
| Flashpoint File (Briefs) | `Flashpoint File` |

> **Where to tag in Substack:** When writing a post, scroll down to "Categories" or "Tags" in the post settings and add the tag before publishing.

---

## How to Deploy (Free Hosting)

### Option A — GitHub Pages (Recommended, Free)

1. Go to [github.com](https://github.com) and create a free account
2. Create a new **repository** named `outpost-website`
3. Upload all the files in this folder
4. Go to **Settings → Pages → Source → Deploy from branch → main**
5. Your site will be live at `yourusername.github.io/outpost-website`
6. To use your custom domain (`theoutpostmedia.com`):
   - Go to Settings → Pages → Custom Domain → enter `theoutpostmedia.com`
   - In your domain registrar (where you bought the domain), add these DNS records:
     ```
     A     @   185.199.108.153
     A     @   185.199.109.153
     A     @   185.199.110.153
     A     @   185.199.111.153
     CNAME www yourusername.github.io
     ```

### Option B — Netlify (Also Free, Slightly Easier)

1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag and drop this entire folder onto the Netlify dashboard
3. Your site is instantly live at a `.netlify.app` URL
4. To add your custom domain: Site Settings → Domain Management → Add custom domain → follow instructions

---

## How Articles Are Displayed

- The homepage shows the **4 most recent articles** at the top, then **3 articles per stream**
- Each stream page shows **all articles** tagged with that stream
- The **Outpost Briefs** page has tabs: All / Concept Files / Atlas Files / Flashpoint Files
- All articles link back to **Substack** for the full reading experience

---

## Updating the Site Design or Structure

To update any part of the design or layout, just ask Claude:
> "Update the Outpost Media website — change [X] to [Y]"

And share the relevant files. Claude can update styles, add new pages, or adjust layouts.
