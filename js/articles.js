/* ============ SAVIO/27 — ARTICLE DATA ============ */
window.ARTICLES = [
{
  id:'001', slug:'building-ai-agents', title:'Building AI Agents That Survive Production',
  date:'2025-11-18', mins:8, tags:['AI','AGENTS','ARCHITECTURE'],
  excerpt:'Most demos die the week they meet real users. A field guide to tool loops, guardrails and boring, beautiful constraints.',
  md:
`The demo is always flawless. The agent answers in three seconds, cites its sources, defers gracefully. Then you ship it, and on Tuesday afternoon a user asks something no benchmark ever imagined, and the whole thing hallucinates a refund policy that does not exist.

## The Demo-to-Production Gap
An agent is not a feature. It is a **non-deterministic distributed system** with a personality. Treat it like one: budgets, retries, timeouts, and an explicit contract for failure — the same discipline you would demand from a payments integration.

The gap is not intelligence. It is **bounded behavior**: what the system does when it does not know, when a tool is down, when the user lies to it.

## Give the Model a Shell, Not a Wish
The single biggest upgrade is replacing "please try to do X" with a tight tool loop. Here is the shape of the loop I ship, stripped to its skeleton:

~~~js
// one turn of the agent loop — every escape hatch is explicit
async function step(agent, task, budget = 6) {
  for (let i = 0; i < budget; i++) {
    const plan = await agent.think(task);
    if (plan.kind === "done") return plan.result;      // declared exit

    const tool = registry.get(plan.tool);
    if (!tool) return fail("UNKNOWN_TOOL", plan.tool); // no silent guessing

    const out = await withTimeout(tool.run(plan.args), 4000);
    task = append(task, observation(out));             // ground next turn
  }
  return fail("BUDGET_EXHAUSTED");                     // never spin forever
}
~~~

Three details carry all the weight: a **hard step budget**, a registry that refuses unknown tools, and a timeout on every call. None of it is clever. All of it is the reason the thing does not melt.

## Constraints Beat Cleverness
> An agent with five permissions and a checklist will outperform an agent with fifty permissions and a dream, every single time.

The failure mode is almost never "the model was too dumb." It is "the model had too many doors." Constrain the tool surface per task. Constrain the output format. Constrain the blast radius — an agent that can read your catalog should not share a process with one that can write to your ledger.

## Observability or It Didn't Happen
If you cannot replay a bad turn, you cannot fix it. Log every prompt, tool call, latency and token spend as a structured trace:

~~~bash
# every turn gets a trace id — grep is your debugger
 $ tail -f agent.log | jq 'select(.trace=="t-8841")'
{"turn":2,"tool":"search","ms":612,"tokens":843}
{"turn":3,"tool":"UNKNOWN_TOOL","ms":1}
~~~

That second line is the entire incident report. The agent called a tool that does not exist, because nothing told it the catalog changed. One line of context beats a week of vibes.

## The Pre-Flight Checklist
- Every tool has an owner, a timeout and a fallback.
- The model can always answer **"I don't know"** without penalty.
- Output formats are validated; invalid output is retried once, then failed loudly.
- A human approval gate exists for anything irreversible.
- You have replayed at least one real incident end-to-end.

Ship the boring version first. The magic is in the guardrails.`
},
{
  id:'002', slug:'sixty-fps-commandment', title:'The 60fps Commandment: Profiling Retro Interfaces',
  date:'2025-09-02', mins:7, tags:['PERFORMANCE','CSS','CANVAS'],
  excerpt:'Scanlines, glow and typewriter text are cheap until they are not. A profiler-first tour of CRT aesthetics that never drop a frame.',
  md:
`Retro aesthetics have a dirty secret: most implementations are a performance crime scene. Five blurred overlays, an infinite animation on a full-screen element, a typewriter re-rendering the framework forty times a second — and suddenly the phosphor glow costs more than the app.

## Why CRT Vibes Eat Frames
The CRT look is made of effects painters hate: full-screen repaints, blur, blend modes, text shadows on everything. Each one forces the compositor to work on every frame. Individually, nothing. Together, jank.

The rule I enforce on every project: **the CRT layer must be free**. If disabling the scanlines changes the frame graph, the implementation is wrong.

## The Cost of a Scanline
A scanline overlay is one element, one gradient, zero animation:

~~~css
/* the entire scanline engine — drawn once, composited forever */
.scanlines {
  position: absolute; inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(0,0,0,.22) 0 1px,
    transparent 1px 3px
  );
}
~~~

No animation. No repaint. The GPU tiles it once and pastes it over every frame for free. The moment someone adds \`animation\` to that element, or a blur filter to its parent, the compositor starts doing cardio.

## Paint by Numbers
Profiling is not mystical. Record five seconds of idle screen and read it like a heart monitor:
- **Green (paint)** during idle means something is repainting. Find it. Kill it.
- **Purple (layout)** during typing means your typewriter resizes things. It should only mutate text nodes.
- Long tasks over 50ms mean script is fighting the frame budget.

The typewriter deserves special mention. The naive version sets framework state per character — a full render per glyph. The version I ship types **imperatively** into a text node with jittered cadence:

~~~js
// types into one node — no re-renders, no reconciliation, pure mechanical feel
function typeInto(el, text, done) {
  let i = 0;
  (function tick() {
    i += 1 + (Math.random() < 0.18 ? 2 : 0);   // uneven cadence
    el.textContent = text.slice(0, i);
    if (i >= text.length) return done();
    setTimeout(tick, 14 + Math.random() * 26);
  })();
}
~~~

One node mutated. Zero reconciliation. It even *feels* more mechanical, because the jitter is real.

## The House Rules
- Decorative overlays are static, unanimated, and pointer-events: none.
- Text effects mutate text nodes, not component state.
- Anything animated animates only transform and opacity.
- prefers-reduced-motion is not optional.
- If a toggle exists (flicker, glow), it must measurably save work.

Nostalgia is the promise. 60fps is the invoice. Pay it silently.`
},
{
  id:'003', slug:'crt-design-philosophy', title:'Scanlines Make Interfaces Feel Alive',
  date:'2025-06-14', mins:6, tags:['DESIGN','RETRO','UX'],
  excerpt:'Constraint as an aesthetic. What flat design lost when it stopped admitting it was made of pixels — and how to get it back.',
  md:
`There is a reason you can recognize a VT100 from across the room. It is not the green. It is the **honesty** — every pixel was placed by something, and the screen admits it. Modern flat design, for all its polish, often feels like plastic wrap over a machine hiding its own machinery.

## Nostalgia Is a UX Feature
Retro aesthetics get dismissed as cosplay, but the feelings they trigger are functional. A BIOS-style interface tells the user: *this thing has rules, and the rules are knowable.* Menus are menus. Commands are commands. The machine will never surprise you with a modal asking if you are "still watching."

That predictability is a feature you can engineer, not just a mood you can borrow.

## Constraint as Aesthetic
A character grid is the most brutal layout constraint ever invented, and that is exactly why it works. When everything snaps to a monospace grid:
- Alignment is guaranteed, not aspirational.
- Box-drawing characters become a complete visual language: \`┌ ─ ┐\` for structure, \`░ ▒ ▓█\` for weight, \`►\` for attention.
- Hierarchy comes from **case and weight**, not twelve shades of grey.

You cannot fake this with a border-radius and a display font. The grid has to actually run the layout.

## The Phosphor Rules
After a decade of building these interfaces, my rule set has collapsed to five lines:
- **One light source.** Bright text glows like an emission; structure does not.
- **One accent per state.** Selection, warning, error. Nothing else gets color.
- **Motion is mechanical.** Cursors blink with step timing, wipes collapse like a beam, text arrives at uneven intervals. Ease-in-out is for rubber, not glass.
- **Every effect has an off switch.** Scanlines, flicker, curvature — the user owns the tube, not you.
- **Content outlives chrome.** If the effects make an article hard to read, the effects are wrong.

~~~css
/* glow behaves like an emission — one shadow, one source */
#screen[data-glow="on"] #rootglow {
  text-shadow: 0 0 6px rgba(0, 255, 102, .5);
}
~~~

That single line is the entire phosphor engine of this site. It makes the text feel *lit from behind*.

## The Payoff
Interfaces built this way age strangely well, because their aesthetic is not a trend — it is a description of hardware. Trends expire. Hardware has a datasheet.

Make your interface feel like it has a datasheet.`
}
];