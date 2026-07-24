# Charnwood Intimacy website

A static Astro site for charnwoodintimacy.co.uk, built to sit alongside
charnwoodcounselling.co.uk: same colour palette (teal, orange, green, cream),
same fonts (Cabin for headings, Onest for body text), with a touch of the
coral red from the Charnwood Intimacy logo used for small accents.

All copy comes from `Charnwood_Intimacy_Website_Plan.docx` in the parent
"Intimacy Website" folder. Anything the plan flagged as unconfirmed (exact
session fees, Jo's exact COSRT/CICS registration wording, the cancellation
policy) has been left general on the site rather than guessed, and is called
out below so nothing inaccurate goes live.

## Before this goes live

1. **Get a Web3Forms access key** so the contact form actually delivers
   emails. This is free and takes about a minute:
   - Go to https://web3forms.com and enter the email address you want
     enquiries sent to (e.g. Jo's inbox).
   - You'll receive an access key by email. Copy it.
   - Open `src/consts.ts` and replace `REPLACE_WITH_YOUR_WEB3FORMS_ACCESS_KEY`
     with that key.
   - That's it, no other backend setup is needed. The form works from a
     plain static site with no server.

2. **Confirm with Jo before publishing:**
   - Exact session fees (`src/pages/pricing-and-booking.astro` and the
     homepage currently describe "introductory rates" without a number)
   - Her exact current COSRT/CICS registration wording
     (`src/pages/your-therapist.astro`)
   - The cancellation policy wording (`src/pages/pricing-and-booking.astro`)
   - The contact email address used in `src/consts.ts`
     (currently `hello@charnwoodintimacy.co.uk`, update if different)
   - Have the Privacy Policy and Cookie Policy checked, they're adapted from
     Charnwood Counselling's existing policies but should be reviewed
     before launch, same as the parent site's policies were.
   - Have a solicitor/COSRT-aware review of the clinical accuracy of the
     condition pages, as the source plan document itself recommends.

3. Testimonials, blog posts, and phased condition-page rollout are left as
   described in the plan document, easy to add later since every page is
   just an Astro file in `src/pages/`.

## Running it locally

```bash
npm install
npm run dev
```

Then open the local address it prints (usually http://localhost:4321).

## Building

```bash
npm run build
```

Outputs a fully static site to `dist/`. Nothing server-side is required, it's
plain HTML/CSS/JS and can be hosted anywhere, including Cloudflare Pages.

## Deploying to Cloudflare Pages

1. Push this folder to a GitHub or GitLab repository (or use Cloudflare's
   "Deploy without Git" upload option if you'd rather not use Git).
2. In the Cloudflare dashboard, go to **Workers & Pages > Create > Pages**
   and connect the repository.
3. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy. Cloudflare will give you a `*.pages.dev` address immediately.
5. Once you're happy, add `charnwoodintimacy.co.uk` as a custom domain in
   the Pages project's settings and update the domain's DNS (Cloudflare will
   walk you through this if the domain is on Cloudflare, otherwise it gives
   you the CNAME/records to add wherever the domain is registered).
6. No environment variables or server functions are needed for this site.
   The only thing that must be set before launch is the Web3Forms key
   above.

## Deploying to an existing Cloudflare Worker

If you already have a Worker set up and would rather deploy there than create
a new Pages project, this repo includes a `wrangler.jsonc` for exactly that.
Cloudflare Workers now serve static sites directly (this replaces the older
"Workers Sites" approach, which is deprecated), so no adapter or extra
framework code is needed for a static Astro site like this one.

1. Open `wrangler.jsonc` and change `"name"` to match your existing Worker's
   name exactly (find it in the Cloudflare dashboard under **Workers &
   Pages**). Deploying with the same name updates that Worker rather than
   creating a new one.
2. From the project folder:
   ```bash
   npm install
   npm install -D wrangler
   npm run build
   npx wrangler login
   npx wrangler deploy
   ```
3. `wrangler login` opens a browser to sign in to your Cloudflare account,
   this is Cloudflare's own login, not something to hand credentials to
   anyone else for. Once deployed, the Worker serves the contents of `dist/`
   directly.
4. Custom domain and DNS are set up the same way as with Pages, from the
   Worker's **Settings > Domains & Routes** in the dashboard.

## Uploading to GitHub manually, without Git or a terminal

If you'd rather not use `git` commands at all:

1. Go to [github.com/new](https://github.com/new) and create a new empty
   repository (don't tick any of the "add a README/.gitignore" options).
2. On the empty repo's page, click **uploading an existing file**.
3. Open this project folder on your Mac, select everything **except**
   `node_modules` and `dist`, if present (they're excluded from Git on
   purpose, they're rebuilt automatically and would make the upload huge),
   and drag the rest into the browser window. Modern browsers preserve the
   folder structure when you drag whole folders in, but it's worth checking
   afterwards that `src/pages/` and `src/components/` came through as folders
   and not as one long flat list.
4. Scroll down and click **Commit changes**.

For anything beyond a one-off upload, GitHub's own desktop app
(desktop.github.com) is a much easier way to keep pushing updates without
touching the command line, it shows you a list of changed files and a single
button to publish them.

## Project structure

- `src/pages/` – one file per page, matches the sitemap in the plan document
- `src/components/` – shared building blocks (hero, forms, cards, nav, etc.)
- `src/data/conditions.ts` – the six "what we help with" condition pages,
  used to build the nav dropdown and the grids on the home/pillar pages
- `src/consts.ts` – site-wide settings: contact details, booking link,
  Web3Forms key
- `src/styles/global.css` – colour and font variables, shared across every
  page
- `public/images/` – logo, favicon, therapist photo and space photo, pulled
  from the Charnwood Counselling brand assets
