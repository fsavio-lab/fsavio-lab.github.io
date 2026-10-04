SAVIO/27 — Terminal Portfolio & Blog

┌──────────────────────────────────────────────────────────┐│  SAVIO/27 ................................... v4.1.0     ││  A CRT terminal portfolio, dynamic blog and arcade       ││  subsystem. Zero dependencies. Zero build step.          │└──────────────────────────────────────────────────────────┘

SAVIO/27 is a personal portfolio that behaves like a 1980s CRTworkstation: a BIOS boot POST, a working command shell, a blog whosearticles live on a simulated filesystem, a CRT setup utility, and ahidden arcade (FS27) with three playable retro games.

It is a single-page vanilla JavaScript application — no framework,no bundler, no npm. Open index.html and it runs.
✨ Features
Subsystem	Description
BIOS Boot	Live hardware POST that probes the actual client machine — real cores, GPU string, RAM, measured refresh rate, storage quota — with skip button and review gate
Phosphor Shell	Full CLI: tab completion, history, Ctrl+L, context-aware suggestions, keyclick audio (WebAudio, no assets)
8 Display Tubes	IBM BIOS, Phoenix, Green Phosphor, Amber, Cyber Matrix, Command Prompt, PowerShell, Apple Terminal
CRT Engine	Scanlines, phosphor glow, curvature, refresh flicker, beam-wipe transitions, RGB-split glitch on errors — every effect toggleable and persisted
Dynamic Blog	Markdown articles rendered in-terminal: syntax-highlighted code blocks, ASCII tables, TOC, reading-progress bar, dedicated reader route (#/article/:slug)
FS27 Arcade	PIPE FLOW (Pipe-Mania with guaranteed-solvable boards), BOUNCE (Nokia 3310 replica: rings, spikes, 3 sectors), MAHJONG SOLITAIRE (104 tiles, hint/auto-shuffle)
CRT Setup Utility	F1 drawer — BIOS-menu styled, live-adjusts every display effect
Banner Forge	banner.html renders the LinkedIn banner (1584×396) in 3 themes with PNG download
Mobile	Virtual key dock, 100svh layout, touch gamepads in every game
🚀 Quick Start

# no install, no build — it's just filesgit clone https://github.com/fsavio-lab/portfolio.gitcd portfolio# then open index.html in any modern browser

Or serve it (optional, identical behavior):

python -m http.server 8000# → http://localhost:8000

Works from file:// — no server required.
⌨️ Controls
Shell commands
Group	Commands
Profile	bio · work (jobs/cv/resume) · projects · contact (hire) · whoami
Content	blog · `read <id
System	specs/post · theme <name> · setup · `sound on
Arcade	fs27
Meta	help · exit

Slash forms work too: /bio, /blog, /fs27…
Keys
Key	Action
Tab	Autocomplete commands, themes, article IDs, filenames
↑ / ↓	Command history
Ctrl+L	Clear screen
F1 / F2 / F3	Setup drawer / cycle theme / arcade
ESC	Back — exit article reader, game, or setup drawer

Clicking anywhere in the terminal refocuses the input line.
📁 Repository Structure

index.html          App shell; loads scripts in strict orderbanner.html         LinkedIn banner generator (standalone)css/style.css       CRT design engine, 8 themes, all viewsjs/articles.js      Blog content (markdown strings)js/data.js          Identity, bio, work log, files, themes, projectsjs/games.js         FS27 arcade — three self-contained gamesjs/app.js           Boot, shell, router, reader, setup, arcade modal

Load order matters: articles.js → data.js → games.js → app.js.The boot POST self-checks all three data modules and reportsMISSING — CHECK xxx.js in red if one fails to load.
🎨 Themes

theme bios · theme phoenix · theme green · theme amber ·theme matrix · theme cmd · theme powershell · theme apple

Apple Terminal is an authentic light tube — if scanlines feel heavyon it, lower SCANLINE INTENSITY in the F1 setup utility.
💾 Persistence
Key	Contents
s27cfg	Theme + CRT effect settings
s27cmd	Last 30 shell commands
s27hs	Arcade high scores
🧪 Manual QA Checklist

Before publishing changes, run through:

     Boot POST completes; skip works mid-run; review gate holds
     POST shows all three MODULE … rows in green
     blog → click a row → article renders, console clean
     read 001 · read 999 (error) · PREV/NEXT · TOC jump · ESC
     fs27 → all three games launch, play, and exit via ESC
     theme apple then F1 → toggles persist across reload
     Mobile (≤760px): dock visible, no layout shift on keyboard open

📚 Further Documentation

    docs/ARCHITECTURE.md — boot pipeline, router, game lifecycle, CRT layers
    docs/CUSTOMIZING.md — write articles, add projects/themes/games
    docs/DEPLOYMENT.md — GitHub Pages, cache-busting, custom domain
    CHANGELOG.md — release history

📄 License

MIT © Savio Fernando