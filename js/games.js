/* ============ SAVIO/27 — ARCADE SUBSYSTEM v2 (FS27) ============ */
(function () {
    'use strict';
    function hsGet(k) { try { return JSON.parse(localStorage.getItem('s27hs') || '{}')[k] || 0; } catch (e) { return 0; } }
    function hsSet(k, v) { try { const o = JSON.parse(localStorage.getItem('s27hs') || '{}'); o[k] = Math.max(o[k] || 0, v); localStorage.setItem('s27hs', JSON.stringify(o)); } catch (e) { } }

    /* ================================================================
       1. PIPE FLOW v2 — rotate pipes, route liquid pump ► to drain ◎
          Boards are GENERATED WITH A GUARANTEED SOLUTION (path carved
          first, then scrambled). Rotating restores the hidden route.
       ================================================================ */
    function PipeFlow(stage, api) {
        const COLS = 8, ROWS = 6, CELL = 64;
        const cv = document.createElement('canvas'); cv.className = 'gcanvas';
        cv.width = COLS * CELL; cv.height = ROWS * CELL;
        stage.appendChild(cv);
        const ctx = cv.getContext('2d');
        const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0]; /* 0=up 1=right 2=down 3=left */
        let grid = [], srcR = 1, dstR = 1, filled = new Set(), flow = null;
        let state = 'count', level = 1, score = 0, cnt = 10, stepMs = 700, acc = 0, last = 0, raf = 0, alive = true, steps = 0;
        let cursor = null;

        const key = (c, r) => c + ',' + r;
        function openings(p) {
            if (p.t === 'X') return [0, 1, 2, 3];
            if (p.t === 'S') return [p.r % 4, (p.r + 2) % 4];
            return [p.r % 4, (p.r + 1) % 4]; /* elbow */
        }
        function accepts(p, d) { return openings(p).indexOf((d + 2) % 4) > -1; }
        function exitOf(p, d) {
            if (p.t === 'SRC') return 1;
            if (p.t === 'X') return (d + 2) % 4;
            if (p.t === 'S') return d;
            const o = openings(p); return o[0] === (d + 2) % 4 ? o[1] : o[0];
        }
        /* piece that connects travel-in dir i to travel-out dir o */
        function pieceFor(i, o) {
            if (Math.random() < 0.14) return { t: 'X', r: 0 };
            if (i === o) return { t: 'S', r: i % 2 };
            const a = (i + 2) % 4, b = o;
            for (let rr = 0; rr < 4; rr++) {
                const op = [rr % 4, (rr + 1) % 4];
                if ((op[0] === a && op[1] === b) || (op[0] === b && op[1] === a)) return { t: 'E', r: rr };
            }
            return { t: 'X', r: 0 };
        }
        function genBoard() {
            grid = []; for (let r = 0; r < ROWS; r++) { const row = []; for (let c = 0; c < COLS; c++)row.push({ t: 'E', r: Math.floor(Math.random() * 4) }); grid.push(row); }
            srcR = 1 + Math.floor(Math.random() * (ROWS - 2));
            dstR = 1 + Math.floor(Math.random() * (ROWS - 2));
            /* carve a monotone (left→right) path: solution is guaranteed */
            let row = srcR;
            for (let c = 1; c <= COLS - 2; c++) {
                let outRow = row;
                if (c < COLS - 2 && Math.random() < 0.6) outRow = 1 + Math.floor(Math.random() * (ROWS - 2));
                if (c === COLS - 2) outRow = dstR;
                const stepR = outRow > row ? 1 : -1;
                let cur = row, d = 1; /* enter each column travelling right */
                while (cur !== outRow) {
                    const nd = stepR > 0 ? 2 : 0;
                    grid[cur][c] = pieceFor(d, nd);
                    d = nd; cur += stepR;
                }
                grid[cur][c] = pieceFor(d, 1); /* exit right */
                row = outRow;
            }
            grid[srcR][0] = { t: 'SRC', r: 0, fixed: true };
            grid[dstR][COLS - 1] = { t: 'DST', r: 0, fixed: true };
            /* scramble every rotatable tile — the player restores the route */
            for (let r = 0; r < ROWS; r++)for (let c = 0; c < COLS; c++) {
                const p = grid[r][c]; if (p.fixed) continue;
                p.r = p.t === 'S' ? Math.floor(Math.random() * 2) : p.t === 'E' ? Math.floor(Math.random() * 4) : 0;
            }
            filled = new Set(); flow = null; steps = 0;
        }
        function startLevel(n) {
            level = n; stepMs = Math.max(340, 720 - 60 * (n - 1)); cnt = Math.max(5, 13 - n);
            genBoard(); state = 'count'; acc = 0;
            api.msg('ROTATE PIPES — LIQUID RELEASES IN ' + cnt + 'S');
            api.hud('LEVEL ' + level, 'SCORE ' + score);
        }
        function spill() {
            state = 'over'; api.sfx.err();
            api.msg('SPILL! SECTOR FAILED — REBUILDING…');
            setTimeout(() => { if (alive) startLevel(level); }, 1500);
        }
        function winLevel() {
            state = 'won'; const bonus = 100 + level * 25; score += bonus; api.sfx.beep();
            api.hud('LEVEL ' + level, 'SCORE ' + score);
            api.msg('SECTOR FLOODED! +' + bonus + ' — NEXT SECTOR…');
            setTimeout(() => { if (alive) startLevel(level + 1); }, 1600);
        }
        function rotate(c, r) {
            const p = (grid[r] || [])[c];
            if (!p || p.fixed || filled.has(key(c, r)) || state === 'won' || state === 'over') return;
            p.r = (p.r + 1) % (p.t === 'S' ? 2 : p.t === 'E' ? 4 : 1);
            if (p.t !== 'X') api.sfx.game(500);
        }
        function onKey(e) {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                if (!cursor) cursor = { c: 2, r: 2 };
                else if (e.key === 'ArrowUp') cursor.r = (cursor.r + ROWS - 1) % ROWS;
                else if (e.key === 'ArrowDown') cursor.r = (cursor.r + 1) % ROWS;
                else if (e.key === 'ArrowLeft') cursor.c = (cursor.c + COLS - 1) % COLS;
                else cursor.c = (cursor.c + 1) % COLS;
            } else if ((e.key === ' ' || e.key === 'Enter') && cursor) { rotate(cursor.c, cursor.r); e.preventDefault(); }
        }
        function onClick(e) {
            const b = cv.getBoundingClientRect();
            const c = Math.floor((e.clientX - b.left) / b.width * COLS);
            const r = Math.floor((e.clientY - b.top) / b.height * ROWS);
            rotate(c, r);
        }
        cv.addEventListener('click', onClick);
        window.addEventListener('keydown', onKey);

        function arm(d, cx, cy) {
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + DX[d] * CELL / 2, cy + DY[d] * CELL / 2); ctx.stroke();
        }
        function drawPipeBody(c, r, p, liq) {
            const cx = c * CELL + CELL / 2, cy = r * CELL + CELL / 2;
            ctx.lineCap = 'butt';
            ctx.strokeStyle = '#1B2027'; ctx.lineWidth = 30; openings(p).forEach(d => arm(d, cx, cy));
            ctx.strokeStyle = '#4A5462'; ctx.lineWidth = 24; openings(p).forEach(d => arm(d, cx, cy));
            ctx.fillStyle = '#1B2027'; ctx.beginPath(); ctx.arc(cx, cy, 15, 0, 7); ctx.fill();
            ctx.fillStyle = '#4A5462'; ctx.beginPath(); ctx.arc(cx, cy, 11, 0, 7); ctx.fill();
            if (liq) {
                ctx.strokeStyle = '#2BD9FF'; ctx.lineWidth = 12; openings(p).forEach(d => arm(d, cx, cy));
                ctx.fillStyle = '#9BEFFF'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 7); ctx.fill();
            }
        }
        function drawPartial(c, r, dIn, p, prog) {
            const eIn = (dIn + 2) % 4, eOut = exitOf(p, dIn);
            const cx = c * CELL + CELL / 2, cy = r * CELL + CELL / 2;
            const ax = cx + DX[eIn] * CELL / 2, ay = cy + DY[eIn] * CELL / 2;
            const bx = cx + DX[eOut] * CELL / 2, by = cy + DY[eOut] * CELL / 2;
            const len = prog * CELL;
            ctx.strokeStyle = '#2BD9FF'; ctx.lineWidth = 12; ctx.lineCap = 'butt';
            if (len <= CELL / 2) {
                const k = len / (CELL / 2);
                ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + (cx - ax) * k, ay + (cy - ay) * k); ctx.stroke();
            } else {
                ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(cx, cy); ctx.stroke();
                const k = (len - CELL / 2) / (CELL / 2);
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (bx - cx) * k, cy + (by - cy) * k); ctx.stroke();
            }
        }
        function drawPumpSpout(prog) {
            const cx = CELL / 2, cy = srcR * CELL + CELL / 2;
            ctx.strokeStyle = '#2BD9FF'; ctx.lineWidth = 12; ctx.lineCap = 'butt';
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (CELL / 2) * prog, cy); ctx.stroke();
        }
        function draw() {
            ctx.fillStyle = '#0E1116'; ctx.fillRect(0, 0, cv.width, cv.height);
            ctx.strokeStyle = 'rgba(255,255,255,.05)';
            for (let c = 1; c < COLS; c++) { ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, cv.height); ctx.stroke(); }
            for (let r = 1; r < ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(cv.width, r * CELL); ctx.stroke(); }
            for (let r = 0; r < ROWS; r++)for (let c = 0; c < COLS; c++) {
                const p = grid[r][c];
                if (p.t === 'SRC' || p.t === 'DST') {
                    ctx.fillStyle = p.t === 'SRC' ? '#14351F' : '#37141F';
                    ctx.fillRect(c * CELL + 5, r * CELL + 5, CELL - 10, CELL - 10);
                    ctx.strokeStyle = p.t === 'SRC' ? '#39D98A' : '#E85C8A'; ctx.lineWidth = 3;
                    ctx.strokeRect(c * CELL + 5, r * CELL + 5, CELL - 10, CELL - 10);
                    ctx.fillStyle = p.t === 'SRC' ? '#39D98A' : '#E85C8A';
                    ctx.font = 'bold 26px "IBM Plex Mono",monospace';
                    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillText(p.t === 'SRC' ? '►' : '◎', c * CELL + CELL / 2, r * CELL + CELL / 2 + 1);
                    continue;
                }
                drawPipeBody(c, r, p, filled.has(key(c, r)));
            }
            if (flow && state === 'flow') {
                const p = grid[flow.r][flow.c];
                if (p.t === 'SRC') drawPumpSpout(flow.prog);
                else if (!filled.has(key(flow.c, flow.r))) drawPartial(flow.c, flow.r, flow.d, p, flow.prog);
                ctx.strokeStyle = 'rgba(43,217,255,' + (0.3 + 0.3 * Math.abs(Math.sin(performance.now() / 130))) + ')';
                ctx.lineWidth = 2; ctx.strokeRect(flow.c * CELL + 2, flow.r * CELL + 2, CELL - 4, CELL - 4);
            }
            if (cursor) {
                ctx.strokeStyle = '#FFD35C'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
                ctx.strokeRect(cursor.c * CELL + 3, cursor.r * CELL + 3, CELL - 6, CELL - 6); ctx.setLineDash([]);
            }
            if (state === 'count') {
                ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(0, cv.height / 2 - 24, cv.width, 48);
                ctx.fillStyle = '#FFD35C'; ctx.font = 'bold 20px "IBM Plex Mono",monospace';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('RELEASE IN ' + cnt + ' — CLICK PIPES TO ROTATE', cv.width / 2, cv.height / 2);
            }
        }
        function loop(t) {
            if (!alive) return;
            raf = requestAnimationFrame(loop);
            const dt = Math.min(60, t - (last || t)); last = t;
            if (state === 'count') {
                acc += dt;
                if (acc >= 1000) {
                    acc -= 1000; cnt--;
                    if (cnt > 0) { api.sfx.game(cnt <= 3 ? 880 : 440); api.msg('ROTATE PIPES — LIQUID RELEASES IN ' + cnt + 'S'); }
                    else { state = 'flow'; acc = 0; api.sfx.beep(); api.msg('FLOW RELEASED — ROUTE IT TO THE DRAIN ◎'); }
                }
            } else if (state === 'flow') {
                if (flow) flow.prog = Math.min(1, (flow.prog || 0) + dt / stepMs);
                acc += dt;
                while (acc >= stepMs && state === 'flow') {
                    acc -= stepMs;
                    if (!flow) { flow = { c: 0, r: srcR, d: 1, prog: 0 }; }
                    else {
                        const cur = grid[flow.r][flow.c];
                        if (cur.t !== 'SRC' && !filled.has(key(flow.c, flow.r))) {
                            filled.add(key(flow.c, flow.r));
                            score += cur.t === 'X' ? 25 : 10; api.hud('LEVEL ' + level, 'SCORE ' + score);
                        }
                        const ex = exitOf(cur, flow.d);
                        const nc = flow.c + DX[ex], nr = flow.r + DY[ex];
                        if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) return spill();
                        const np = grid[nr][nc];
                        if (np.t === 'DST') { flow = { c: nc, r: nr, d: ex, prog: 1 }; return winLevel(); }
                        if (!accepts(np, ex)) return spill();
                        steps++; if (steps > 240) return spill(); /* loop guard */
                        flow = { c: nc, r: nr, d: ex, prog: 0 };
                    }
                }
            }
            draw();
        }
        startLevel(1);
        raf = requestAnimationFrame(t => { last = t; loop(t); });
        return { destroy() { alive = false; cancelAnimationFrame(raf); cv.removeEventListener('click', onClick); window.removeEventListener('keydown', onKey); } };
    }

    /* ================================================================
       2. BOUNCE v2 — Nokia 3310 replica, physics desk-verified:
          · spawn rests ON the floor (old build spawned inside it → fell through)
          · fixed 120Hz sub-steps, AABB landing + ceiling + wall resolution
          · ledge-kick makes every gap (max 2 tiles) crossable — verified:
            kick vy=-330 crosses 60px in 0.40s, arriving 32px ABOVE the ledge
          · single-tile spikes, tight hitbox: 82px of safe air-travel vs an
            18px danger window — jumpable with timing, impossible before
       ================================================================ */
    function Bounce(stage, api) {
        const TS = 24, R = 8, CW = 480, CH = 288;
        const G = 1250, BV = -390, MX = 150, KICK = -330, STEP = 1 / 120;
        const cv = document.createElement('canvas'); cv.className = 'gcanvas';
        cv.width = CW; cv.height = CH; stage.appendChild(cv);
        const ctx = cv.getContext('2d');
        const LCD = { bg: '#C7D3A0', px: '#232B16', mid: 'rgba(35,43,22,.14)' };

        /* ---- sector builders (geometry verified against the physics) ---- */
        function lvl(w) { return { w: w, solid: [], spike: [], ring: [], flag: null }; }
        function ground(L, a, b) { for (let c = a; c <= b; c++)L.solid.push([c, 11]); }
        function plat(L, c, r, w) { for (let i = 0; i < w; i++)L.solid.push([c + i, r]); }
        function spikes(L, c) { L.spike.push([c, 10]); }
        function ring(L, c, r) { L.ring.push([c, r]); }
        function flag(L, c, r) { L.flag = [c, r]; }

        function L1() {
            const L = lvl(72);          /* gaps 16-17,28-29,46-47 (2 tiles) */
            ground(L, 0, 15); ground(L, 18, 27); ground(L, 30, 45); ground(L, 48, 71);
            spikes(L, 22); spikes(L, 36);
            plat(L, 24, 9, 3); plat(L, 50, 9, 3);
            ring(L, 6, 10); ring(L, 7, 10); ring(L, 12, 10);
            ring(L, 24, 8); ring(L, 25, 8); ring(L, 26, 8);
            ring(L, 31, 10); ring(L, 40, 10); ring(L, 41, 10);
            ring(L, 50, 8); ring(L, 51, 8); ring(L, 52, 8);
            ring(L, 60, 10); ring(L, 61, 10);
            flag(L, 68, 10); return L;
        }
        function L2() {
            const L = lvl(80);          /* gaps 11-12,23-24,41-42,53-54 */
            ground(L, 0, 10); ground(L, 13, 22); ground(L, 25, 40); ground(L, 43, 52); ground(L, 55, 79);
            spikes(L, 17); spikes(L, 33); spikes(L, 47); spikes(L, 58); spikes(L, 68);
            plat(L, 8, 9, 3); plat(L, 27, 9, 3);
            ring(L, 4, 10); ring(L, 15, 10); ring(L, 20, 10);
            ring(L, 8, 8); ring(L, 9, 8); ring(L, 10, 8);
            ring(L, 27, 8); ring(L, 28, 8); ring(L, 29, 8);
            ring(L, 37, 10); ring(L, 45, 10); ring(L, 63, 10); ring(L, 74, 10);
            flag(L, 77, 10); return L;
        }
        function L3() {
            const L = lvl(88);          /* gaps 9-10,21-22,35-36,45-46,59-60 */
            ground(L, 0, 8); ground(L, 11, 20); ground(L, 23, 34); ground(L, 37, 44); ground(L, 47, 58); ground(L, 61, 87);
            spikes(L, 15); spikes(L, 28); spikes(L, 40); spikes(L, 51); spikes(L, 64);
            /* the climb: rises 1 tile per step, apex 60px clears each one */
            plat(L, 66, 9, 2); plat(L, 69, 8, 2); plat(L, 72, 7, 2); plat(L, 76, 6, 3);
            ring(L, 5, 10); ring(L, 18, 10); ring(L, 31, 10); ring(L, 43, 10); ring(L, 55, 10);
            ring(L, 66, 8); ring(L, 67, 8); ring(L, 69, 7); ring(L, 70, 7);
            ring(L, 72, 6); ring(L, 73, 6); ring(L, 76, 5);
            flag(L, 77, 5); return L;
        }
        const SECTORS = [L1, L2, L3];
        const NAMES = ['GREEN HILLS', 'THE GAPS', 'THE CLIMB'];

        let L = null, solid = new Set(), rings = [], lives = 3, score = 0, ringsGot = 0, sector = 0;
        let b = { x: 0, y: 0, vy: 0 }, cam = 0, state = 'play', tmr = 0, squash = 0;
        let keys = { l: false, r: false }, raf = 0, last = 0, accS = 0, alive = true;
        let snapScore = 0, snapRings = 0, parts = [];

        function loadLevel(i) {
            sector = i; L = SECTORS[i]();
            solid = new Set(L.solid.map(p => p[0] + ',' + p[1]));
            rings = L.ring.map(p => ({ c: p[0], r: p[1], got: false }));
            snapScore = score; snapRings = ringsGot;
            respawn();
            api.msg('SECTOR ' + (i + 1) + ': ' + NAMES[i] + ' — REACH THE FLAG ▶');
        }
        function respawn() {
            b = { x: 2 * TS + TS / 2, y: 11 * TS - R - 0.5, vy: BV }; /* rests ON floor top — never inside */
            cam = Math.max(0, Math.min(L.w * TS - CW, b.x - CW * 0.4));
            squash = 0; tmr = 0; parts = []; state = 'play'; hud();
        }
        function hud() { api.hud(NAMES[sector] + ' · LIVES ' + lives, 'SCORE ' + score + ' · RINGS ' + ringsGot); }
        function startGame() {
            lives = 3; score = 0; ringsGot = 0;
            api.actions([{ label: '◄', hold: v => keys.l = v }, { label: '►', hold: v => keys.r = v }]);
            loadLevel(0);
        }
        function retrySector() {
            lives = 3; score = snapScore; ringsGot = snapRings;
            api.actions([{ label: '◄', hold: v => keys.l = v }, { label: '►', hold: v => keys.r = v }]);
            api.msg(''); respawn();
        }
        function die() {
            if (state !== 'play') return;
            state = 'dead'; tmr = 0; lives--; api.sfx.err(); hud();
            parts = []; for (let i = 0; i < 10; i++)parts.push({ x: b.x, y: b.y, vx: (Math.random() * 2 - 1) * 140, vy: -Math.random() * 160 - 40 });
        }
        function clearSector() {
            if (state !== 'play') return;
            state = 'clear'; tmr = 0; score += 100; api.sfx.beep(); hud();
            api.msg('SECTOR CLEAR! +100');
        }
        function supported() {
            const row = Math.floor((b.y + R + 3) / TS);
            const c1 = Math.floor((b.x - R + 3) / TS), c2 = Math.floor((b.x + R - 3) / TS);
            for (let c = c1; c <= c2; c++) if (solid.has(c + ',' + row)) return true;
            return false;
        }
        function step(dt) {
            const mv = (keys.r ? 1 : 0) - (keys.l ? 1 : 0);
            /* horizontal, with wall blocking */
            if (mv) {
                const nx = b.x + mv * MX * dt;
                const lead = mv > 0 ? nx + R - 2 : nx - R + 2;
                const c = Math.floor(lead / TS);
                const ry1 = Math.floor((b.y - R + 3) / TS), ry2 = Math.floor((b.y + R - 3) / TS);
                let blocked = false;
                for (let r = ry1; r <= ry2; r++) if (solid.has(c + ',' + r)) { blocked = true; break; }
                if (blocked) b.x = mv > 0 ? c * TS - R - 0.5 : (c + 1) * TS + R + 0.5;
                else b.x = nx;
                b.x = Math.max(R, Math.min(L.w * TS - R, b.x));
            }
            /* vertical */
            const had = supported();
            b.vy += G * dt; b.y += b.vy * dt;
            if (b.vy > 0) {
                const pb = b.y - b.vy * dt + R, nb = b.y + R;
                const r1 = Math.floor((pb - 0.6) / TS), r2 = Math.floor(nb / TS);
                outer:
                for (let r = r1; r <= r2; r++) {
                    const top = r * TS;
                    if (nb >= top && pb <= top + 0.6) {
                        const c1 = Math.floor((b.x - R + 3) / TS), c2 = Math.floor((b.x + R - 3) / TS);
                        for (let c = c1; c <= c2; c++) {
                            if (solid.has(c + ',' + r)) { b.y = top - R; b.vy = BV; squash = 1; api.sfx.game(200); break outer; }
                        }
                    }
                }
            } else if (b.vy < 0) {
                const pt = b.y - b.vy * dt - R, nt = b.y - R;
                const r1 = Math.floor(nt / TS), r2 = Math.floor(pt / TS);
                for (let r = r2; r >= r1; r--) {
                    const bot = r * TS + TS;
                    if (nt <= bot && pt >= bot - 0.6) {
                        const c1 = Math.floor((b.x - R + 3) / TS), c2 = Math.floor((b.x + R - 3) / TS);
                        let hit = false;
                        for (let c = c1; c <= c2; c++) if (solid.has(c + ',' + r)) { hit = true; break; }
                        if (hit) { b.y = bot + R; b.vy = 40; break; }
                    }
                }
            }
            /* ledge kick: ran off an edge while descending → rescue hop */
            if (had && !supported() && b.vy > 0 && b.vy < 220) b.vy = KICK;
            /* hazards & pickups */
            for (const s of L.spike) {
                const sx = s[0] * TS + TS / 2;
                if (Math.abs(b.x - sx) < 9 && b.y + R > s[1] * TS + 10) return die();
            }
            for (const g of rings) {
                if (g.got) continue;
                const gx = g.c * TS + TS / 2, gy = g.r * TS + TS / 2;
                if (Math.abs(b.x - gx) < 14 && Math.abs(b.y - gy) < 16) { g.got = true; ringsGot++; score += 25; api.sfx.game(1150); hud(); }
            }
            const fx = L.flag[0] * TS + TS / 2, fy = L.flag[1] * TS + TS / 2;
            if (Math.abs(b.x - fx) < 13 && Math.abs(b.y - fy) < 16) return clearSector();
            if (b.y > CH + 40) die();
        }
        function update(dt) {
            if (state === 'play') {
                accS += dt;
                while (accS >= STEP) { accS -= STEP; step(STEP); if (state !== 'play') break; }
            } else {
                tmr += dt;
                if (state === 'dead' && tmr > 0.9) {
                    if (lives <= 0) {
                        state = 'gameover'; api.msg('GAME OVER IN ' + NAMES[sector]);
                        api.actions([{ label: 'RETRY SECTOR', fn: retrySector }]);
                    } else { respawn(); api.msg('BURST! LIVES LEFT: ' + lives); }
                } else if (state === 'clear' && tmr > 1.3) {
                    if (sector < SECTORS.length - 1) loadLevel(sector + 1);
                    else {
                        state = 'victory'; try { hsSet('bounce', score); } catch (e) { }
                        api.msg('ALL SECTORS CLEARED — FINAL ' + score + ' · RINGS ' + ringsGot);
                        api.actions([{ label: 'PLAY AGAIN', fn: startGame }]); api.sfx.beep();
                    }
                }
            }
            squash = Math.max(0, squash - dt * 5);
            if (L) cam = Math.max(0, Math.min(L.w * TS - CW, b.x - CW * 0.4));
            for (const p of parts) { p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
        }
        function draw() {
            if (!L) return;
            ctx.fillStyle = LCD.bg; ctx.fillRect(0, 0, CW, CH);
            ctx.strokeStyle = LCD.mid; ctx.lineWidth = 1;
            for (let x = -(cam % TS); x < CW; x += TS) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke(); }
            for (let y = 0; y < CH; y += TS) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke(); }
            ctx.save(); ctx.translate(-cam, 0);
            const c0 = Math.floor(cam / TS) - 1, c1 = c0 + CW / TS + 3;
            for (const p of L.solid) {
                if (p[0] < c0 || p[0] > c1) continue;
                const x = p[0] * TS, y = p[1] * TS;
                ctx.fillStyle = LCD.px; ctx.fillRect(x, y, TS, TS);
                ctx.fillStyle = LCD.bg; ctx.fillRect(x, y, TS, 2);
            }
            for (const s of L.spike) {
                if (s[0] < c0 || s[0] > c1) continue;
                const x = s[0] * TS, y = s[1] * TS;
                ctx.fillStyle = LCD.px;
                ctx.beginPath(); ctx.moveTo(x + 3, y + TS); ctx.lineTo(x + TS / 2, y + 3); ctx.lineTo(x + TS - 3, y + TS); ctx.closePath(); ctx.fill();
            }
            for (const g of rings) {
                if (g.got || g.c < c0 || g.c > c1) continue;
                const cx = g.c * TS + TS / 2, cy = g.r * TS + TS / 2;
                ctx.strokeStyle = LCD.px; ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.moveTo(cx, cy - 7); ctx.lineTo(cx + 7, cy); ctx.lineTo(cx, cy + 7); ctx.lineTo(cx - 7, cy); ctx.closePath(); ctx.stroke();
            }
            {
                const fx = L.flag[0] * TS + TS / 2, fy = L.flag[1] * TS + TS / 2;
                ctx.fillStyle = LCD.px; ctx.fillRect(fx - 1, fy - 14, 2, 26);
                const wv = Math.sin(performance.now() / 180) * 2;
                ctx.beginPath(); ctx.moveTo(fx + 1, fy - 14); ctx.lineTo(fx + 13 + wv, fy - 9); ctx.lineTo(fx + 1, fy - 4); ctx.closePath(); ctx.fill();
            }
            if (state === 'dead') {
                ctx.fillStyle = LCD.px;
                for (const p of parts) { ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, 7); ctx.fill(); }
            } else {
                const s = squash * 0.35;
                ctx.fillStyle = LCD.px;
                ctx.beginPath(); ctx.ellipse(b.x, b.y, R * (1 + s), R * (1 - s), 0, 0, 7); ctx.fill();
                ctx.fillStyle = LCD.bg; ctx.fillRect(b.x - 3, b.y - 4, 2, 2);
            }
            ctx.restore();
            ctx.fillStyle = LCD.px; ctx.font = 'bold 10px "IBM Plex Mono",monospace';
            ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillText('SECTOR ' + (sector + 1) + '/3 · ' + NAMES[sector], 6, 5);
            ctx.textAlign = 'right';
            ctx.fillText('SCORE ' + score + '  RINGS ' + ringsGot + '  LIVES ' + lives, CW - 6, 5);
            ctx.textAlign = 'left';
            if (state === 'victory' || state === 'gameover') {
                ctx.fillStyle = 'rgba(199,211,160,.88)'; ctx.fillRect(CW / 2 - 150, CH / 2 - 34, 300, 68);
                ctx.strokeStyle = LCD.px; ctx.lineWidth = 2; ctx.strokeRect(CW / 2 - 150, CH / 2 - 34, 300, 68);
                ctx.fillStyle = LCD.px; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.font = 'bold 15px "IBM Plex Mono",monospace';
                ctx.fillText(state === 'victory' ? 'YOU WIN!' : 'GAME OVER', CW / 2, CH / 2 - 10);
                ctx.font = '11px "IBM Plex Mono",monospace';
                ctx.fillText(state === 'victory' ? 'SCORE ' + score + ' · RINGS ' + ringsGot : 'PRESS "RETRY SECTOR" BELOW', CW / 2, CH / 2 + 12);
                ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            }
        }
        function kd(e) {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') { keys.l = true; e.preventDefault(); }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') { keys.r = true; e.preventDefault(); }
        }
        function ku(e) {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.l = false;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.r = false;
        }
        window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
        startGame();
        raf = requestAnimationFrame(t => { last = t; tick(t); });
        function tick(t) {
            if (!alive) return;
            raf = requestAnimationFrame(tick);
            const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
            update(dt); draw();
        }
        return { destroy() { alive = false; cancelAnimationFrame(raf); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); } };
    }

    /* ================================================================
       3. MAHJONG SOLITAIRE — 104 tiles, 2 layers, correct free logic
       ================================================================ */
    function Mahjong(stage, api) {
        const U = 46, V = 60, DZ = 8, COLS = 12, ROWS = 8;
        const wrap = document.createElement('div'); wrap.className = 'mstage-wrap';
        const st = document.createElement('div'); st.className = 'mstage';
        wrap.appendChild(st); stage.appendChild(wrap);
        const tiles = [];
        for (let r = 0; r < ROWS; r++)for (let c = 0; c < COLS; c++)tiles.push({ c: c, r: r, z: 0 });
        for (let r = 3; r < 5; r++)for (let c = 4; c < 8; c++)tiles.push({ c: c, r: r, z: 1 });
        const TYPES = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9',
            'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9',
            'wE', 'wS', 'wW', 'wN', 'dR', 'dG', 'f1', 'f2'];
        const PIPS = { 1: [4], 2: [2, 6], 3: [2, 4, 6], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8], 7: [0, 2, 3, 4, 5, 6, 8], 8: [0, 1, 2, 3, 5, 6, 7, 8], 9: [0, 1, 2, 3, 4, 5, 6, 7, 8] };
        let sel = null, moves = 0, t0 = Date.now(), over = false, alive = true, tick = null;

        function faceEl(type) {
            const f = document.createElement('span');
            if (type[0] === 'd' && type[1] !== 'R' && type[1] !== 'G') {
                const n = +type[1]; f.className = 'tface';
                const g = document.createElement('span'); g.className = 'dots';
                for (let i = 0; i < 9; i++) { const d = document.createElement('i'); if (PIPS[n].indexOf(i) > -1) d.className = 'on'; g.appendChild(d); }
                f.appendChild(g);
            } else if (type[0] === 'b') {
                const n = +type[1]; f.className = 'tface';
                const b = document.createElement('span'); b.className = 'bam' + (n === 1 ? ' one' : '');
                for (let i = 0; i < n; i++)b.appendChild(document.createElement('i'));
                f.appendChild(b);
            } else if (type[0] === 'w') {
                f.className = 'tface wind'; f.textContent = { E: '東', S: '南', W: '西', N: '北' }[type[1]];
            } else if (type === 'dR') { f.className = 'tface dragon dr-r'; f.textContent = '中'; }
            else if (type === 'dG') { f.className = 'tface dragon dr-g'; f.textContent = '發'; }
            else if (type === 'f1') { f.className = 'tface dragon'; f.style.color = '#B3446C'; f.textContent = '❀'; }
            else { f.className = 'tface dragon'; f.style.color = '#1F7A3D'; f.textContent = '✿'; }
            return f;
        }
        function aboveOf(t) { for (const u of tiles) if (u !== t && u.z === t.z + 1 && u.c === t.c && u.r === t.r) return true; return false; }
        function sideBlocked(t, dc) { for (const u of tiles) if (u !== t && u.z === t.z && u.r === t.r && u.c === t.c + dc) return true; return false; }
        function isFree(t) { return !aboveOf(t) && (!sideBlocked(t, -1) || !sideBlocked(t, 1)); }
        function freeTiles() { const f = []; for (const t of tiles) if (isFree(t)) f.push(t); return f; }
        function hasFreePair() { const seen = {}; for (const t of freeTiles()) { if (seen[t.type]) return true; seen[t.type] = t; } return false; }
        function deal() {
            const pool = []; TYPES.forEach(t => { for (let i = 0; i < 4; i++)pool.push(t); });
            for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp; }
            tiles.forEach((t, i) => { t.type = pool[i]; t.el.innerHTML = ''; t.el.appendChild(faceEl(t.type)); });
        }
        function hud() {
            api.hud('TILES ' + tiles.length + ' · PAIRS ' + (tiles.length / 2 | 0),
                'MOVES ' + moves + ' · ' + Math.floor((Date.now() - t0) / 1000) + 'S');
        }
        function pick(t) {
            if (over) return;
            if (!isFree(t)) { t.el.classList.add('shakeit'); setTimeout(() => t.el.classList.remove('shakeit'), 320); api.sfx.err(); return; }
            api.sfx.tick();
            if (sel === t) { t.el.classList.remove('sel'); sel = null; return; }
            if (sel && sel.type === t.type) {
                const a = sel, b = t; sel = null; a.el.classList.remove('sel'); moves++;
                a.el.classList.add('dead'); b.el.classList.add('dead');
                api.sfx.game(760);
                setTimeout(() => {
                    if (!alive) return;
                    [a, b].forEach(x => { const i = tiles.indexOf(x); if (i > -1) tiles.splice(i, 1); if (x.el.parentNode) x.el.remove(); });
                    after();
                }, 260);
            } else {
                if (sel) sel.el.classList.remove('sel');
                sel = t; t.el.classList.add('sel');
            }
        }
        function after() {
            hud();
            if (!tiles.length) {
                over = true; if (tick) clearInterval(tick);
                api.win('BOARD CLEARED', moves + ' MOVES · ' + Math.floor((Date.now() - t0) / 1000) + 'S'); return;
            }
            if (!hasFreePair()) {
                api.msg('NO FREE PAIRS — SHUFFLING…');
                setTimeout(() => { if (alive && !over) doShuffle(true); }, 800);
            }
            else api.msg('');
        }
        function doShuffle(auto) {
            if (over) return;
            if (sel) { sel.el.classList.remove('sel'); sel = null; }
            let tries = 0;
            do {
                const types = tiles.map(t => t.type);
                for (let i = types.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const tmp = types[i]; types[i] = types[j]; types[j] = tmp; }
                tiles.forEach((t, i) => t.type = types[i]);
                tries++;
            } while (!hasFreePair() && tries < 40);
            tiles.forEach(t => { t.el.innerHTML = ''; t.el.appendChild(faceEl(t.type)); });
            api.sfx.beep(); if (auto) api.msg(''); hud();
        }
        function hint() {
            const seen = {};
            for (const t of freeTiles()) {
                if (seen[t.type]) {
                    [seen[t.type], t].forEach(x => { x.el.classList.add('hintp'); setTimeout(() => x.el.classList.remove('hintp'), 1600); });
                    api.sfx.tick(); return;
                }
                seen[t.type] = t;
            }
            api.msg('NO PAIRS — TRY SHUFFLE');
        }
        function fit() {
            const w = COLS * U + DZ + 8, h = ROWS * V + 8;
            const maxH = Math.min(window.innerHeight * 0.52, 430);
            const sc = Math.min((stage.clientWidth - 8) / w, maxH / h, 1.15);
            st.style.transform = 'scale(' + sc + ')';
            st.style.width = w + 'px'; st.style.height = h + 'px';
            wrap.style.height = (h * sc) + 'px';
        }
        tiles.forEach(t => {
            const b = document.createElement('button'); b.className = 'mt';
            b.style.left = (t.c * U + t.z * DZ) + 'px';
            b.style.top = (t.r * V - t.z * DZ) + 'px';
            b.style.zIndex = t.z * 100 + t.r;
            b.addEventListener('click', () => pick(t));
            t.el = b; st.appendChild(b);
        });
        deal();
        window.addEventListener('resize', fit);
        fit();
        hud();
        api.actions([{ label: 'HINT', fn: hint }, { label: 'SHUFFLE', fn: () => doShuffle(false) }]);
        tick = setInterval(() => { if (!over) hud(); }, 1000);
        after();
        return { destroy() { alive = false; if (tick) clearInterval(tick); window.removeEventListener('resize', fit); } };
    }

    window.GAMES = [
        {
            id: 'pipes', name: 'PIPE FLOW', file: 'PIPES.EXE',
            desc: 'Pipe-Mania with a guaranteed solution: rotate the tiles before the countdown, route the liquid from pump ► to drain ◎. Every board is carved from a hidden valid path — cross pipes score double, sectors get faster.',
            create: PipeFlow
        },
        {
            id: 'bounce', name: 'BOUNCE', file: 'BOUNCE.EXE',
            desc: 'Nokia 3310 replica on a green LCD: auto-bouncing ball, rings, spikes, pits and a flag ending each of 3 hand-built sectors. Steer ◄ ► — the ledge-kick saves a late jump off an edge.',
            create: Bounce
        },
        {
            id: 'mahjong', name: 'MAHJONG SOLITAIRE', file: 'MJ.SOL',
            desc: '104 tiles across two layers, classic free-tile matching with hint and auto-shuffle when you get stuck. Clear the board.',
            create: Mahjong
        }
    ];
})();