Changelog

All notable changes to SAVIO/27 are documented here.Format based on Keep a Changelog.
[4.1.0] — 2026
Fixed

    Articles completely broken — two independent root causes:
        mdRender passed raw string primitives to appendChild(TypeError: Argument 1 is not an object) on every paragraph;the router's catch swallowed it and silently bounced back to theterminal. Fixed with text nodes + asNode() guard.
        #overlays div had no pointer-events:none — an invisible layerswallowed every click in the terminal (blog rows, chips, F1–F3 bar).

Added

    Module self-check in POST (reports missing articles.js/data.js/games.js at boot)
    Markdown upgrades: CRLF normalization, YAML frontmatter stripping,| tables | as ASCII box grids, images as terminal chips, ``` fences
    Router failsafe: openArticle() remounts the reader if hashchange stalls
    LinkedIn Banner Forge (banner.html) — 1584×396, 3 phosphor themes, PNG export

[4.0.x] — 2026
Added

    Real resume content: work log (work), GenAI bio, skills files
    Recruitment card (contact/hire) with clickable mailto/tel/links
    Empty-projects "storage bay" with diagnostic scan
    Themes: cmd, powershell, apple

Fixed

    Boot could never exit: route() called undefined closeOverlay()→ ReferenceError at the finish line, silent freeze. Now defined,router wrapped in try/catch, unhandledrejection reporter added.
    POST rows scrolled out of view → auto-scroll + review gate + specs command
    Skip button added (event-only skip failed on unfocused windows/iframes)

[3.x] — 2026
Added

    Live hardware probe in POST (real cores/GPU/RAM/Hz/quota — no fake 486)
    Review gate: POST holds on screen until keypress

[2.x] — 2026
Changed

    Games rebuilt: PIPE FLOW with guaranteed-solvable carved boards;BOUNCE with Nokia-authentic physics (fixed-timestep, spawn-on-floorfix, ledge-kick, single-tile spikes); Mahjong rewritten with correctfree-tile logic

[1.0.0] — 2026
Added

    Initial release: BIOS boot, phosphor shell, 5 themes, CRT engine,blog + reader, FS27 arcade, mobile dock, setup utility