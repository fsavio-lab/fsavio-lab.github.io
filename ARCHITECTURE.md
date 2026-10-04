SAVIO/27 — Architecture
Layers

┌─────────────────────────────────────────────┐│ #bezel      monitor chassis + power LED     ││  #screen    theme context (data-theme="…")  ││   #app      mounted view (z:10)             ││   #overlays setup drawer + game modal       ││             (pointer-events:none base)      ││   .scan     scanline raster     (z:60)      ││   .fl       flicker overlay     (z:65)      ││   .glass    curvature vignette  (z:70)      │└─────────────────────────────────────────────┘

#screen[data-theme] sets ~18 CSS variables; every component stylesitself from var(--…). A theme swap is one attribute change.

Design laws (enforced throughout):

    Decorative overlays are static and unanimated — the scanline layeris one gradient, painted once, composited for free.
    Text effects mutate text nodes, never framework state.
    Animated things animate only transform/opacity.
    Every effect has an off switch (F1), persisted in s27cfg.
    Glow = one text-shadow (emission), applied on #app.

Boot pipeline (app.js → boot())

POST rows ──► module self-check (articles/data/games)         ──► detectSpecs()  (parallel, 2.5s timeout)         ──► spec rows (memory counts up)         ──► review gate  (phase='gate': any key → finish())         ──► finish(): route() → banner + welcome

    Skip (st.skipped=true) flushes all pending sleep() promises viaa shared pending Set — animation aborts mid-run.
    detectSpecs() is raced with a timeout so a stalled probe (hiddentab blocks rAF) can never hang boot.
    The gate phase reuses the same capture listeners with a phase flag —POST phase skips, gate phase resolves.

Router (hash-based)

#/                → Term.view (persistent singleton)#/article/:slug   → buildArticle(a) (fresh mount each time)

    mount(v) wipes #app and applies the beam-wipe (.crp).
    openArticle(a) sets S.pendingArticle, changes the hash, thenafter 300ms verifies the route actually changed — if hashchangewas lost (edge cases under file://), it remounts directly.
    route() is wrapped in try/catch; the terminal is the guaranteedfallback view. The unhandledrejection handler prints faultsinto the shell — nothing fails silently.

Shell

Term is a persistent singleton (history survives navigation).Input is a hidden <input> overlaid on a styled prompt line —native IME/mobile keyboards work, visuals stay custom.exec() is a flat switch; every command method is cmdXxx().
Arcade lifecycle

GameModal owns the modal; each game is a factorycreate(stage, api) → { destroy } receiving an api:
api method	purpose
hud(l, r)	HUD line above canvas
actions(list)	touch gamepad buttons ({label, fn} or {label, hold})
msg(t)	status strip ('' clears)
win(t, sub) / over(score)	end states
sfx	shared WebAudio blips

destroy() MUST cancel rAF loops and remove window listeners —enforced in review. stopGame() runs on menu return, ESC, androute change.
Physics notes (BOUNCE)

Fixed 120Hz sub-steps (STEP=1/120) inside a rAF frame → deterministicmovement regardless of display Hz. Landing uses previous-bottom vstile-top crossing (AABB); the spawn position rests R+0.5px above thefloor so it can never start intersecting. The ledge-kick (KICK=-330)rescues late edge-offs; sector geometry is hand-built against theseconstants (documented inline in games.js).
Board generation (PIPE FLOW)

Boards are carved, not random: a monotone left→right path is laidfirst (pieceFor() picks the exact elbow/straight per turn), pump anddrain are pinned, then rotations are scrambled. A solution alwaysexists; the player restores it. A 240-step loop guard preventsstalling on closed loops.
Persistence

localStorage keys: s27cfg (settings), s27cmd (history),s27hs (high scores). All access is try/catch-wrapped (Safariprivate mode throws).