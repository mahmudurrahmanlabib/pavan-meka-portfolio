# Pavan Meka — portfolio

A single-page portfolio built with [Astro](https://astro.build). Static output, no client framework.

## Run it

Requires Node 22.23.4 or newer.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs static files to dist/
npm run check:links
```

`check:links` scans `dist/` and fails on any empty link, missing `#anchor`, missing file or dead external URL. Run it after every build, before deploying.

## Edit content

Everything the page says is in `src/data/site.ts`: name, email, links, experience, projects, education and personal notes.

Optional links (`resume`, `calendar`) stay hidden until you fill them in, so the site never shows a button that goes nowhere. To add the résumé, put the PDF in `public/` and set `resume: '/Pavan-Meka-Resume.pdf'`.

Once you have a domain, set `site` in `astro.config.mjs` to turn on canonical and `og:url` tags.

## Deploy

Any static host works. Build command `npm run build`, output directory `dist`.

- **Vercel / Netlify / Cloudflare Pages:** import the repo; the Astro preset is detected automatically.
- **GitHub Pages:** use the official `withastro/action` workflow. If the site lives at `username.github.io/repo`, also set `base: '/repo'` in `astro.config.mjs`.

## Structure

```
src/
  data/site.ts         all page content
  pages/index.astro    the page
  pages/404.astro      not-found page
  layouts/Base.astro   <head>, fonts, theme bootstrap
  components/          Header, Section, Row, OrgMark, Contact, Footer, Icon
  scripts/main.ts      copy-email, clock, theme switch, scroll reveal, count-up, chat
  styles/global.css    all styles (light + dark)
scripts/check-links.mjs
```
