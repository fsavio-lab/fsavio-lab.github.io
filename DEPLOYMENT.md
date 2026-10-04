Deployment
GitHub Pages (primary target)

The site is hash-routed (#/article/…), so deep links never 404 —no Jekyll config, no 404.html, no redirects needed.

    Push everything to main (repo root = site root; index.html mustsit at the top level).
    Settings → Pages → Source: Deploy from a branch → main / (root).
    Live at https://fsavio-lab.github.io in ~1 minute.

That's it. There is nothing to build.
Custom domain (optional)

Settings → Pages → Custom domain → yourdomain.dev, then a CNAMErecord → fsavio-lab.github.io. Enforce HTTPS once the cert issues.No code changes required — the app is path-independent.
The cache gotcha (read this before "it's broken")

Browsers aggressively cache the four JS files. After any deploy:

    You (dev): hard-refresh — Ctrl+Shift+R (Win) / Cmd+Shift+R (Mac)
    Visitors: may see one stale version until normal cache expiry.For instant propagation, bump a version query in index.html:

<script src="js/app.js?v=4.1.1"></script>

The boot POST is your canary: if MODULE ARTICLES ever reportsMISSING in production, it's a path/case error or a half-uploadedfile — check F12 → Network for red 404s.
Any other static host

Netlify / Vercel / Cloudflare Pages: point at the repo root, zerobuild command, zero publish-dir overrides. file:// also works forUSB-stick / offline demo use.
Performance profile

    No network requests beyond two Google Fonts (system monospacefallback is seamless offline)
    Static scanline/glow layers: zero per-frame cost
    All animation via rAF; games use fixed-timestep sub-steps
    Whole app < 120KB unminified

Pre-deploy QA

Run the checklist in README.md → 🧪 Manual QA Checklist, plus:

     POST module rows all green on the deployed URL
     Open one article from a fresh tab via direct deep link(…/#/article/sixty-fps-commandment)
     theme apple → reload → settings persisted