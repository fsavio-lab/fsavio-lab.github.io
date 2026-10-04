/* ============ SAVIO/27 — SHELL · ROUTER · READER · SETUP · ARCADE ============ */
(function(){
'use strict';
const {ARTICLES, DATA, GAMES, THEMES, THEME_ORDER} = window;
const $=s=>document.querySelector(s);
const screenEl=$('#screen'), app=$('#app'), ov=$('#overlays');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const clip=(s,n)=>{s=String(s);return s.length>n?s.slice(0,n-1)+'…':s;};
const T0=Date.now();
const uptime=()=>{const s=Math.floor((Date.now()-T0)/1000);return Math.floor(s/60)+'M '+(s%60)+'S';};

/* ---------- config ---------- */
const DEF={theme:'bios',scanlines:45,flicker:true,glow:true,curve:true,sound:true,wipe:true};
let cfg;
try{cfg=Object.assign({},DEF,JSON.parse(localStorage.getItem('s27cfg')||'{}'));}catch(e){cfg=Object.assign({},DEF);}
function saveCfg(){try{localStorage.setItem('s27cfg',JSON.stringify(cfg));}catch(e){}}
function applyCfg(){
  screenEl.dataset.theme=cfg.theme;
  screenEl.dataset.flicker=cfg.flicker?'on':'off';
  screenEl.dataset.glow=cfg.glow?'on':'off';
  screenEl.dataset.curve=cfg.curve?'on':'off';
  screenEl.dataset.wipe=cfg.wipe?'on':'off';
  screenEl.style.setProperty('--scanA',(cfg.scanlines/100*0.5).toFixed(3));
  document.title='SAVIO/27 — '+THEMES[cfg.theme].label;
  const lbl=$('#sb-theme'); if(lbl)lbl.textContent=THEMES[cfg.theme].label;
}

/* ---------- sfx ---------- */
const SFX={
  _c:null,
  ac(){ if(!cfg.sound)return null;
    if(!this._c){try{this._c=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}}
    if(this._c.state==='suspended')this._c.resume(); return this._c; },
  blip(f,d,g){ const c=this.ac(); if(!c)return;
    try{const o=c.createOscillator(),gn=c.createGain();o.type='square';o.frequency.value=f;
    gn.gain.setValueAtTime(g||.035,c.currentTime);gn.gain.exponentialRampToValueAtTime(.0001,c.currentTime+(d||.04));
    o.connect(gn);gn.connect(c.destination);o.start();o.stop(c.currentTime+(d||.04)+.02);}catch(e){} },
  key(){this.blip(520+Math.random()*380,.02,.026);},
  tick(){this.blip(1250,.018,.03);},
  err(){this.blip(150,.2,.06);},
  beep(){this.blip(880,.13,.05);},
  game(f){this.blip(f||440,.045,.05);}
};

/* ---------- state ---------- */
const S={booting:true, overlay:null, route:'terminal', cmd:[], ci:-1,
         game:null, gameIdx:0, selRow:0, lastSpecs:null, postTime:null, pendingArticle:null};

/* ---------- fx ---------- */
function glitch(){ const v=app.firstElementChild; if(!v)return;
  v.classList.add('glitching'); SFX.err(); setTimeout(()=>v.classList.remove('glitching'),340); }
function mount(v){ app.innerHTML=''; if(cfg.wipe)v.classList.add('crp'); app.appendChild(v);
  if(cfg.wipe)setTimeout(()=>v.classList.remove('crp'),520); }

/* ================================================================
   TERMINAL
   ================================================================ */
const Term={view:null,out:null,typed:null,cur:null,inp:null,psEl:null,
  build(){
    const v=el('div','tview'); this.view=v;
    const bar=el('div','sbar');
    bar.appendChild(el('span',null,'C:\\SAVIO — PHOSPHOR SHELL v4.1.0'));
    const r=el('span','sb-r');
    [['F1 SETUP',()=>Setup.open()],['F2 THEME',()=>{cycleTheme();}],['F3 FS27',()=>GameModal.open()],['HIRE ME',()=>{Term.exec('contact','','contact');}]].forEach(([t,fn])=>{
      const b=el('button','sbb',t); b.addEventListener('click',fn); r.appendChild(b);
    });
    const th=el('span',null,''); th.id='sb-theme'; th.textContent=THEMES[cfg.theme].label; r.appendChild(th);
    bar.appendChild(r); v.appendChild(bar);
    const out=el('div','thist scroller'); this.out=out; v.appendChild(out);
    const tin=el('div','tin'); this.psEl=el('span','ps','C:\\SAVIO> ');
    const pv=el('span','pv'); this.typed=el('span',null,''); this.cur=el('span','cur','\u00a0');
    pv.appendChild(this.typed); pv.appendChild(this.cur);
    const inp=el('input','gin'); inp.autocomplete='off'; inp.spellcheck=false; this.inp=inp;
    inp.addEventListener('input',()=>{this.typed.textContent=inp.value;this.scroll();});
    inp.addEventListener('keydown',e=>this.onKey(e));
    tin.appendChild(this.psEl); tin.appendChild(pv); tin.appendChild(inp);
    tin.addEventListener('mousedown',e=>{e.preventDefault();setTimeout(()=>this.focus(),0);});
    v.appendChild(tin);
    const dock=el('div','dock');
    [['BIO','bio'],['WORK','work'],['PROJ','projects'],['BLOG','blog'],['LS','ls'],['TAB','tab'],['CLR','clear'],['FS27','fs27']].forEach(([lbl,c])=>{
      const b=el('button','dk',lbl);
      b.addEventListener('click',()=>{
        if(c==='tab'){this.complete();return;}
        inp.value=c; this.typed.textContent=c; this.submit(); this.focus();
      });
      dock.appendChild(b);
    });
    v.appendChild(dock);
    return v;
  },
  focus(){ if(S.route==='terminal'&&!S.overlay&&!S.booting) this.inp.focus({preventScroll:true}); },
  scroll(){ this.out.scrollTop=this.out.scrollHeight; },
  print(txt,cls){ const d=el('div','ln'+(cls?' '+cls:''),txt); this.out.appendChild(d); this.scroll(); return d; },
  node(n){ this.out.appendChild(n); this.scroll(); return n; },
  nl(){ this.print(''); },
  async typeInto(elm,text){
    let i=0;
    return new Promise(res=>{
      (function tick(){
        i+=1+(Math.random()<.18?2:0);
        if(i>=text.length){elm.textContent=text;return res();}
        elm.textContent=text.slice(0,i);
        SFX.key(); Term.scroll();
        setTimeout(tick,12+Math.random()*22);
      })();
    });
  },
  async printlnTyped(txt,cls){ const d=this.print('',cls); const s=el('span','tw'); d.appendChild(s); await this.typeInto(s,txt); },
  echo(raw){ const d=el('div','ln cmd');
    d.appendChild(el('span','ps','C:\\SAVIO> '));
    d.appendChild(el('span','cmdk',raw));
    this.out.appendChild(d); this.scroll(); },
  clear(){ this.out.innerHTML=''; },
  onKey(e){
    if(e.key==='Enter'){e.preventDefault();this.submit();}
    else if(e.key==='ArrowUp'){e.preventDefault();this.hist(-1);}
    else if(e.key==='ArrowDown'){e.preventDefault();this.hist(1);}
    else if(e.key==='Tab'){e.preventDefault();this.complete();}
    else if(e.key==='l'&&e.ctrlKey){e.preventDefault();this.clear();}
    else if(e.key.length===1)SFX.key();
  },
  hist(dir){
    if(!S.cmd.length)return;
    S.ci=Math.max(-1,Math.min(S.cmd.length-1,S.ci+dir));
    const v=S.ci===-1?'':S.cmd[S.ci];
    this.inp.value=v; this.typed.textContent=v;
  },
  complete(){
    const ctxCmds=['help','bio','work','jobs','cv','resume','projects','proj','blog','read ','cat ','ls','dir',
      'theme ','clear','cls','history','fs27','setup','specs','post','contact','hire','sound ','ver','whoami','exit'];
    const files=Object.keys(DATA.files);
    const ids=ARTICLES?ARTICLES.flatMap(a=>[a.id,a.slug]):[];
    const val=this.inp.value;
    let pool=ctxCmds;
    if(/^theme /i.test(val))pool=THEME_ORDER.map(t=>val.split(' ')[0]+' '+t);
    else if(/^read /i.test(val))pool=ids.map(i=>val.split(' ')[0]+' '+i);
    else if(/^cat /i.test(val))pool=files.map(f=>val.split(' ')[0]+' '+f);
    const m=pool.filter(c=>c.toLowerCase().startsWith(val.toLowerCase()));
    if(m.length===1){this.inp.value=m[0];this.typed.textContent=m[0];SFX.tick();}
    else if(m.length>1){this.print(m.join('   '),'dim');SFX.tick();}
    this.focus();
  },
  async submit(){
    const raw=this.inp.value.trim();
    this.inp.value=''; this.typed.textContent='';
    if(!raw){this.echo('');return;}
    S.cmd.push(raw); S.ci=-1;
    try{const h=JSON.parse(localStorage.getItem('s27cmd')||'[]');h.push(raw);localStorage.setItem('s27cmd',JSON.stringify(h.slice(-30)));}catch(e){}
    this.echo(raw);
    const parts=raw.replace(/^\//,'').split(/\s+/);
    const cmd=parts[0].toLowerCase(), arg=parts.slice(1).join(' ');
    try{ await this.exec(cmd,arg,raw); }catch(e){ this.print('INTERNAL FAULT: '+e.message,'err'); console.error(e); }
    this.focus();
  },
  async exec(cmd,arg,raw){
    switch(cmd){
      case 'help': return this.cmdHelp();
      case 'bio': return this.cmdBio();
      case 'work': case 'jobs': case 'cv': case 'resume': return this.cmdWork();
      case 'specs': case 'post': return this.cmdSpecs();
      case 'contact': case 'hire': return this.cmdContact();
      case 'projects': case 'proj': return this.cmdProjects();
      case 'blog': return this.cmdBlog();
      case 'read': case 'article': return this.cmdRead(arg);
      case 'ls': case 'dir': return this.cmdLs();
      case 'cat': return this.cmdCat(arg);
      case 'theme': return this.cmdTheme(arg);
      case 'clear': case 'cls': return this.clear();
      case 'history':
        S.cmd.slice(-15).forEach((c,i)=>this.print('  '+String(i+1).padStart(3)+'  '+c));
        return;
      case 'fs27': return GameModal.open();
      case 'setup': return Setup.open();
      case 'sound':
        if(arg==='on'||arg==='off'){cfg.sound=arg==='on';saveCfg();applyCfg();this.print('KEYCLICK AUDIO '+(cfg.sound?'ENABLED':'MUTED'),'ok');}
        else this.print('USAGE: sound on|off','dim');
        return;
      case 'ver': return this.print('SAVIO-DOS 4.1.0 · PHOSPHOR SHELL · GENAI EDITION');
      case 'whoami': return this.print('Savio Fernando — software engineer · python & generative ai · 4+ yrs · open to roles → run CONTACT');
      case 'exit': return this.print('THERE IS NO EXIT. THERE IS ONLY PHOSPHOR. (ESC leaves a view)','dim');
      default:{
        glitch();
        this.print('BAD COMMAND OR FILE NAME: "'+cmd+'"','err');
        this.print('TRY "HELP" FOR THE COMMAND DIRECTORY','dim');
      }
    }
  },
  cmdHelp(){
    const W=53;
    const row=(a,b)=>('  '+a).padEnd(24)+(b||'');
    const L=[
      '  PROFILE',
      row('bio ............','system info · neofetch'),
      row('work ...........','employment log · CV'),
      row('projects .......','storage bay'),
      row('contact ........','email · phone · links'),
      row('whoami .........','the one-liner'),
      '',
      '  CONTENT',
      row('blog ...........','article index'),
      row('read <id> ......','open article · read 001'),
      row('ls · dir .......','list files on C:\\SAVIO'),
      row('cat <file> .....','print a file'),
      '',
      '  SYSTEM',
      row('specs ..........','last POST report'),
      row('theme <name> ...','phosphor tubes'),
      row('setup ..........','CRT utility (F1)'),
      row('fs27 ...........','arcade · 3 games'),
      row('clear · history · sound on|off · ver'),
      '',
      row('KEYS  TAB','complete · ↑↓ history'),
      row('      CTRL+L','clear · ESC back'),
      row('      F1 F2 F3','setup · theme · arcade')
    ].map(s=>s.slice(0,W).padEnd(W));
    const p=el('pre','nfout mat');
    p.innerHTML=esc('┌─ COMMAND DIRECTORY '+'─'.repeat(W-20)+'┐\n'
      +L.map(s=>'│'+s+'│').join('\n')+'\n'
      +'└'+'─'.repeat(W)+'┘');
    this.node(p);
  },
  cmdBio(){
    const wrap=el('div','bio-wrap stag');
    const av=el('pre',null,DATA.avatar);
    const box=el('div',null);
    const hd=el('div','ln bv',DATA.identity.name);
    hd.appendChild(document.createTextNode('  '));
    hd.appendChild(el('span','dim',DATA.identity.tagline));
    const sep=el('div','ln dim','─'.repeat(36));
    box.appendChild(hd); box.appendChild(sep);
    DATA.bio.forEach(([k,v])=>{
      const r=el('div','ln spec-row');
      r.appendChild(el('span','k',k));
      r.appendChild(el('span',null,v==='__UPTIME__'?uptime():v));
      box.appendChild(r);
    });
    const mem=el('div','ln'); const pct=60+Math.floor(Math.random()*35);
    const fill=Math.round(pct/10);
    mem.appendChild(el('span','dim','LOAD  '));
    mem.appendChild(el('span','ak','['+'█'.repeat(fill)+'░'.repeat(10-fill)+']'));
    mem.appendChild(el('span',null,' '+pct+'%'));
    box.appendChild(mem);
    wrap.appendChild(av); wrap.appendChild(box);
    this.node(wrap); this.nl();
    this.print('HINT: "work" for experience · "specs" for POST · "contact" for recruiter info.','dim');
  },
  cmdContact(){
    const d=DATA.identity;
    this.print('RECRUITMENT CHANNEL — OPEN FOR PYTHON / GENAI ROLES','dim'); this.nl();
    const card=el('div','frame dbl mat');
    card.appendChild(el('span','lg','CONTACT.SAVIO'));
    const g=el('div','mgrid');
    const row=(k,val,href)=>{
      g.appendChild(el('span','mk',k));
      const v=el('span');
      if(href){const a=el('a',null,val);a.href=href;a.target='_blank';a.rel='noreferrer';v.appendChild(a);}
      else v.textContent=val;
      g.appendChild(v);
    };
    row('NAME',d.name);
    row('ROLE',d.tagline);
    row('EMAIL',d.contact.email,'mailto:'+d.contact.email);
    row('PHONE',d.contact.phone,'tel:'+d.contact.phone.replace(/\s/g,''));
    row('PORTFOLIO',d.contact.site,d.contact.site);
    row('GITHUB',d.contact.github,d.contact.github);
    row('LINKEDIN',d.contact.linkedin,d.contact.linkedin);
    card.appendChild(g);
    this.node(card); this.nl();
    this.print('ALL LINKS CLICKABLE · MAILTO/TEL HANDLED BY YOUR OS.','dim');
  },
  cmdWork(){
    this.print('EMPLOYMENT LOG — 4+ YEARS OF SHIPPED SYSTEMS','dim'); this.nl();
    const list=el('div','plist stag');
    DATA.work.forEach((j,i)=>{
      const c=el('div','frame pcard');
      c.appendChild(el('span','lg','LOG-'+String(i+1).padStart(2,'0')));
      const h=el('div','phead');
      h.appendChild(el('span','pname',j.co));
      h.appendChild(el('span','pyear',j.period));
      h.appendChild(el('span','pstat '+(j.cur?'s-active':'s-shipped'),j.cur?'[CURRENT]':'[COMPLETE]'));
      c.appendChild(h);
      c.appendChild(el('p','pdesc',j.role));
      const tags=el('div',null); tags.appendChild(el('span','dim','stack: '));
      j.tech.forEach(t=>tags.appendChild(el('span','tag','['+t+']')));
      c.appendChild(tags);
      const ul=el('div','pspec');
      ul.textContent=j.pts.map((p,k)=>(k<j.pts.length-1?'├─ ':'└─ ')+p).join('\n');
      c.appendChild(ul);
      list.appendChild(c);
    });
    this.node(list); this.nl();
    this.print('HINT: "cat RESUME.TXT" for the short version.','dim');
  },
  /* ---- projects: UNCHANGED (empty storage bay) ---- */
  cmdProjects(){
    if(!DATA.projects||!DATA.projects.length){ this.projectBay(); return; }
    const list=el('div','plist stag');
    this.print('MOUNTING /PROJECTS — '+DATA.projects.length+' VOLUMES','dim'); this.nl();
    DATA.projects.forEach(p=>{
      const c=el('div','frame pcard');
      c.appendChild(el('span','lg',p.id));
      const h=el('div','phead');
      h.appendChild(el('span','ledc'+(p.status==='ACTIVE'?' blink':''),'●'));
      h.appendChild(el('span','pname',p.name));
      h.appendChild(el('span','pyear',p.year));
      h.appendChild(el('span','pstat s-'+p.status.toLowerCase(),'['+p.status+']'));
      c.appendChild(h);
      c.appendChild(el('p','pdesc',p.desc));
      const tags=el('div',null); tags.appendChild(el('span','dim','tech: '));
      p.stack.forEach(t=>tags.appendChild(el('span','tag','['+t+']')));
      c.appendChild(tags);
      const spec=el('pre','pspec'); spec.textContent=p.spec; spec.hidden=true; c.appendChild(spec);
      const btns=el('div','prow-btns');
      (p.links||[]).forEach(l=>{
        const a=el('a','chip',l.label); a.href=l.url; a.target='_blank'; a.rel='noreferrer'; btns.appendChild(a);
      });
      const sb=el('button','chip','SPEC ▾');
      sb.onclick=()=>{spec.hidden=!spec.hidden;sb.textContent=spec.hidden?'SPEC ▾':'SPEC ▴';SFX.tick();};
      btns.appendChild(sb); c.appendChild(btns);
      list.appendChild(c);
    });
    this.node(list); this.nl();
  },
  projectBay(){
    this.print('MOUNTING /PROJECTS … 0 VOLUMES FOUND','dim'); this.nl();
    const bay=el('div','frame dbl mat');
    bay.appendChild(el('span','lg','PROJECT STORAGE BAY'));
    const grid=el('div','baygrid');
    for(let i=1;i<=4;i++){
      const s=el('div','bayslot');
      s.appendChild(el('div','baydisk blink','▒▒▒▒▒'));
      s.appendChild(el('div','baylbl','BAY 0'+i+' · EMPTY'));
      grid.appendChild(s);
    }
    bay.appendChild(grid);
    const stat=el('div','baystat');
    stat.innerHTML='0 VOLUMES MOUNTED · <span class="ak">4 BAYS AWAITING DATA</span> · WRITE-PROTECTED UNTIL FURTHER NOTICE';
    bay.appendChild(stat);
    const btns=el('div','prow-btns');
    const scan=el('button','chip','RUN DIAGNOSTIC');
    const work=el('button','chip','VIEW WORK LOG');
    work.onclick=()=>{ this.echo('work'); this.exec('work','','work'); };
    scan.onclick=async()=>{
      if(scan.disabled)return;
      scan.disabled=true; SFX.tick();
      const bar=this.print('','dim');
      const total=20;
      for(let i=0;i<=total;i++){
        const f=Math.round(i/total*24);
        bar.textContent='  ['+'█'.repeat(f)+'░'.repeat(24-f)+'] '+Math.round(i/total*100)+'%  SCANNING SECTORS…';
        await wait(55+Math.random()*70);
      }
      SFX.err();
      this.print('  SECTOR 0 ........... EMPTY','dim');
      this.print('  SECTOR 1 ........... EMPTY','dim');
      this.print('  FLASH BANK B ....... 0 CARTRIDGES','dim');
      this.print('VERDICT: PROJECT DATA NOT YET FLASHED TO ROM.','ak');
      this.print('THE ENGINEER IS STILL POLISHING THE CASE STUDIES.','dim');
      this.print('RECRUITERS: RUN "WORK" FOR THE PROOF-OF-SHIP LOG · "CONTACT" TO REACH HIM.','dim');
      scan.disabled=false; scan.textContent='SCAN AGAIN';
    };
    btns.appendChild(scan); btns.appendChild(work);
    bay.appendChild(btns);
    this.node(bay); this.nl();
    this.print('THIS BAY FILLS AS PROJECTS ARE DEFLASHED. MEANWHILE: "WORK" HAS EVERYTHING SHIPPED.','dim');
  },
  /* ---- blog: rows now use openArticle() ---- */
  cmdBlog(){
    if(!ARTICLES||!ARTICLES.length){
      this.print('BLOG VOLUME EMPTY — articles.js DID NOT LOAD.','err');
      this.print('CHECK THE FILE NAME/PATH IN index.html AND THE CONSOLE (F12).','dim');
      return;
    }
    const bl=el('div','bl stag');
    this.print('VOLUME C:\\SAVIO\\BLOG — '+ARTICLES.length+' FILES · CLICK A ROW OR "READ <ID>"','dim'); this.nl();
    const hd=el('div','bl-head dim','IDX   DATE        TITLE                                       TIME');
    bl.appendChild(hd);
    ARTICLES.forEach(a=>{
      const r=el('button','bl-row');
      r.appendChild(el('span','bl-id',a.id));
      r.appendChild(el('span','bl-date dim',a.date));
      r.appendChild(el('span','bl-ti',a.title));
      r.appendChild(el('span','bl-min',a.mins+' MIN'));
      r.appendChild(el('span','bl-ex','└ '+a.excerpt));
      r.addEventListener('click',()=>openArticle(a));
      bl.appendChild(r);
    });
    bl.appendChild(el('div','bl-tip dim','► OPEN WITH: read 001 — or click a title.'));
    this.node(bl); this.nl();
  },
  async cmdRead(arg){
    if(!ARTICLES||!ARTICLES.length){ this.print('ARTICLES MODULE NOT LOADED — CHECK articles.js (F12 CONSOLE).','err'); return; }
    if(!arg){ this.cmdBlog(); return; }
    const q=String(arg).toLowerCase().replace(/\.txt$/,'');
    const a=ARTICLES.find(x=>x.id===q||x.slug===q)
          ||ARTICLES.find(x=>x.slug.indexOf(q)>-1)
          ||ARTICLES[parseInt(q,10)-1];
    if(!a){ glitch(); this.print('FILE NOT FOUND: "'+arg+'" — VALID: '+ARTICLES.map(x=>x.id).join(', ')+' OR SLUG','err'); return; }
    this.print('LOADING '+a.id+' → '+a.slug.toUpperCase()+'.TXT …','dim');
    SFX.tick();
    openArticle(a);
  },
  cmdLs(){
    const p=el('pre','nfout mat');
    let out=' VOLUME IN DRIVE C IS SAVIO\n DIRECTORY OF C:\\SAVIO\n\n';
    Object.keys(DATA.files).forEach(f=>{
      const dot=f.lastIndexOf('.');
      out+=' '+f.slice(0,dot).padEnd(10)+f.slice(dot+1).padEnd(5)+String(DATA.files[f].length*64).padStart(6)+' BYTES\n';
    });
    out+='\n WORKLOG       <DIR>      employment log — try: work\n'
       +' BLOG          <DIR>      '+(ARTICLES?ARTICLES.length:0)+' articles — try: blog\n'
       +' PROJECTS      <DIR>      0 volumes — bay empty\n'
       +' FS27          <DIR>      arcade subsystem — try: fs27\n';
    p.innerHTML=esc(out);
    this.node(p);
  },
  cmdCat(arg){
    const f=Object.keys(DATA.files).find(k=>k.toLowerCase()===String(arg).toLowerCase());
    if(!f){ glitch(); this.print('FILE NOT FOUND: "'+arg+'" — try: '+Object.keys(DATA.files).join(', '),'err'); return; }
    this.print('── '+f+' '+'─'.repeat(Math.max(2,50-f.length)),'dim');
    DATA.files[f].forEach(l=>this.print(l||' '));
    this.print('─'.repeat(52),'dim');
  },
  async cmdTheme(arg){
    if(!arg){ this.print('AVAILABLE TUBES: '+THEME_ORDER.join(' · '),'dim'); return; }
    const t=THEME_ORDER.find(k=>k===arg.toLowerCase());
    if(!t){ glitch(); this.print('UNKNOWN TUBE: "'+arg+'" — try: '+THEME_ORDER.join(', '),'err'); return; }
    cfg.theme=t; saveCfg(); applyCfg();
    glitch();
    await wait(340);
    this.print('TUBE SWAPPED → '+THEMES[t].label,'ok');
  },
  async cmdSpecs(){
    let s=S.lastSpecs;
    if(!s||!s.probed){
      this.print('RE-PROBING LIVE HARDWARE…','dim');
      s=await withTimeout(detectSpecs(),2500,{});
      s.probed=true; S.lastSpecs=s; S.postTime=new Date();
    }
    const rows=specRows(s);
    const W=Math.max(24,...rows.map(r=>r[0].length))+2;
    const p=el('pre','nfout mat');
    let out=' SAVIO/27 POST REPORT — '+(S.postTime?S.postTime.toLocaleString():'LIVE PROBE')+'\n';
    out+=' '+('─'.repeat(48))+'\n';
    rows.forEach(([l,r])=>{ out+=' '+l.padEnd(W)+r+'\n'; });
    out+=' '+('─'.repeat(48))+'\n F1 = CRT SETUP · "THEME <NAME>" TO RE-TUBE THE DISPLAY';
    p.innerHTML=esc(out);
    this.node(p);
  }
};
function cycleTheme(){
  const i=(THEME_ORDER.indexOf(cfg.theme)+1)%THEME_ORDER.length;
  cfg.theme=THEME_ORDER[i]; saveCfg(); applyCfg(); glitch();
  if(S.route==='terminal'&&!S.booting){Term.print('TUBE → '+THEMES[cfg.theme].label,'ok');Term.focus();}
}

/* ================================================================
   HARDWARE PROBE
   ================================================================ */
function withTimeout(p,ms,fallback){
  return Promise.race([
    Promise.resolve(p).catch(()=>fallback),
    new Promise(r=>setTimeout(()=>r(fallback),ms))
  ]);
}
function measureHz(){
  return new Promise(res=>{
    let frames=0; const t0=performance.now();
    (function f(t){ frames++;
      if(t-t0<420) requestAnimationFrame(f);
      else res(Math.round(frames/((t-t0)/1000)));
    })(t0);
  });
}
function fmtBytes(b){
  if(b==null||isNaN(b))return null;
  const u=['B','KB','MB','GB','TB']; let i=0;
  while(b>=1024&&i<u.length-1){b/=1024;i++;}
  return (i?b.toFixed(1):b)+' '+u[i];
}
function browserTag(){
  const ua=navigator.userAgent; let m;
  if((m=ua.match(/edg\/[\d.]+/i)))     return m[0].toUpperCase();
  if((m=ua.match(/opr\/[\d.]+/i)))     return m[0].toUpperCase();
  if((m=ua.match(/firefox\/[\d.]+/i))) return m[0].toUpperCase();
  if((m=ua.match(/chrome\/[\d.]+/i)))  return m[0].toUpperCase();
  if((m=ua.match(/version\/[\d.]+/i))&&/safari/i.test(ua)) return 'SAFARI/'+m[0].split('/')[1];
  return 'UNKNOWN BROWSER';
}
function gpuName(){
  try{
    const c=document.createElement('canvas');
    const gl=c.getContext('webgl')||c.getContext('experimental-webgl');
    if(!gl)return null;
    const ext=gl.getExtension('WEBGL_debug_renderer_info');
    let r=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);
    r=String(r||'').trim();
    if(!r||/^mozilla$/i.test(r))return null;
    const m=r.match(/^ANGLE \((.+)\)$/);
    if(m){
      const parts=m[1].split(/\s*,\s*/);
      r=parts.sort((a,b)=>b.length-a.length)[0]||m[1];
      r=r.replace(/\s*Direct3D.*$/i,'').replace(/\s*(vs|ps|gs)_\d+_\d+.*$/i,'')
         .replace(/\s*(OpenGL|Metal|Vulkan).*$/i,'').trim();
    }
    return r||null;
  }catch(e){return null;}
}
async function detectSpecs(){
  const s={};
  s.cores=navigator.hardwareConcurrency||null;
  s.arch=null; s.mobile=null; s.os=null;
  if(navigator.userAgentData){
    try{
      const ua=await withTimeout(navigator.userAgentData.getHighEntropyValues(
        ['architecture','bitness','platformVersion','model']),600,{});
      s.arch=((ua.architecture||'')+(ua.bitness?'-'+ua.bitness.toLowerCase():'')).toUpperCase()||null;
      s.os=(navigator.userAgentData.platform||'')+(ua.platformVersion?' '+ua.platformVersion.split('.')[0]:'');
      s.mobile=!!navigator.userAgentData.mobile;
    }catch(e){}
  }
  if(!s.os){
    const m=navigator.userAgent.match(/\(([^)]+)\)/);
    s.os=m?clip(m[1],36):(navigator.platform||'UNKNOWN PLATFORM');
  }
  s.gpu=gpuName();
  s.ram=navigator.deviceMemory||null;
  s.res=screen.width+'×'+screen.height;
  s.depth=screen.colorDepth||24;
  s.dpr=Math.round((window.devicePixelRatio||1)*100)/100;
  s.hz=await withTimeout(measureHz(),900,null);
  const con=navigator.connection||{};
  s.net=(navigator.onLine?'ONLINE':'OFFLINE')
       +(con.effectiveType?' · '+con.effectiveType.toUpperCase():'')
       +(con.downlink?' · ~'+con.downlink+'Mb/s':'');
  s.quota=null; s.usage=null;
  try{
    if(navigator.storage&&navigator.storage.estimate){
      const q=await withTimeout(navigator.storage.estimate(),600,{});
      s.quota=fmtBytes(q.quota); s.usage=fmtBytes(q.usage);
    }
  }catch(e){}
  s.locale=navigator.language||'??';
  try{ s.tz=Intl.DateTimeFormat().resolvedOptions().timeZone||null; }catch(e){ s.tz=null; }
  s.touch=navigator.maxTouchPoints||0;
  s.heap=(performance.memory&&performance.memory.usedJSHeapSize)?fmtBytes(performance.memory.usedJSHeapSize):null;
  s.browser=browserTag();
  return s;
}
function specRows(s){
  s=s||{};
  const V=(x,fb)=>(x==null||x==='')?fb:x;
  return [
    ['Central Processor', s.cores? s.cores+' LOGICAL CORES'+(s.arch?' ['+s.arch+']':'') : 'CORE COUNT HIDDEN BY BROWSER'],
    ['Coprocessor / GPU', clip(V(s.gpu,'GENERIC RASTERIZER [MASKED BY BROWSER]'),46)],
    ['Memory', s.ram? '≈'+(s.ram*1024)+'MB [DEVICE MEMORY API]' : 'HIDDEN BY BROWSER [PRIVACY]'],
    ['Storage Pool', s.quota? s.quota+' QUOTA'+(s.usage?' · '+s.usage+' USED':'') : 'LOCAL STORAGE [SANDBOXED]'],
    ['JS Heap', s.heap? s.heap+' IN USE' : 'MANAGED'],
    ['Display', V(s.res,'UNKNOWN')+' · '+(s.depth||24)+'BIT · DPR '+(s.dpr||1)],
    ['Raster Lock', s.hz? s.hz+'Hz MEASURED' : '60Hz [ASSUMED]'],
    ['Input Devices', s.touch>0? s.touch+'-POINT TOUCH · KEYBOARD · POINTER' : 'KEYBOARD · POINTER'],
    ['Network Link', V(s.net,'UNKNOWN')],
    ['System Clock', (s.tz? s.tz.toUpperCase()+' · ':'')+V(s.locale,'??')],
    ['Host ROM', clip(V(s.browser,'UNKNOWN')+(s.mobile==null?'':' · '+(s.mobile?'MOBILE':'DESKTOP')),46)],
    ['Security', (window.isSecureContext?'SECURE CONTEXT':'INSECURE CONTEXT')+' · COOKIES '+(navigator.cookieEnabled?'ON':'OFF')]
  ];
}

/* ================================================================
   BOOT — POST with module self-check + review gate
   ================================================================ */
async function boot(){
  const b=el('div','boot scroller');
  const w=el('div','bwrap'); b.appendChild(w);
  const st={skipped:false,done:false,phase:'post'};
  const pending=new Set();
  let gateRes=null;
  const sleep=ms=>{
    if(st.skipped)return Promise.resolve();
    return new Promise(r=>{ pending.add(r); setTimeout(()=>{pending.delete(r);r();},ms); });
  };
  const onEvt=e=>{
    if(st.phase==='post'){
      if(st.skipped)return;
      st.skipped=true;
      pending.forEach(r=>r()); pending.clear();
      if(e&&e.type==='keydown'&&e.key&&e.key.length===1)e.preventDefault();
    }else if(st.phase==='gate'){
      if(e&&e.type==='keydown'&&e.key&&e.key.length===1)e.preventDefault();
      if(gateRes)gateRes();
    }
  };
  window.addEventListener('keydown',onEvt,true);
  window.addEventListener('pointerdown',onEvt,true);
  window.addEventListener('touchstart',onEvt,true);
  const skipRow=el('div','skip');
  skipRow.appendChild(el('span','blink','PRESS ANY KEY TO SKIP POST · OR '));
  const sb=el('button','skipbtn','[ SKIP » ]');
  sb.addEventListener('click',e=>{e.stopPropagation();onEvt(e);});
  skipRow.appendChild(sb);
  b.appendChild(skipRow);
  app.appendChild(b);
  const autoscroll=()=>{ b.scrollTop=b.scrollHeight; };
  const row=(l,r,cls)=>{
    const e=el('div','brow');
    e.appendChild(el('span',null,l));
    const v=el('span','dim'+(cls?' '+cls:''),r||'');
    e.appendChild(v); w.appendChild(e); autoscroll();
    return v;
  };
  const blank=()=>{ w.appendChild(el('div',null,' ')); };

  row('SAVIO BIOS (C) 1987-2025 SAVIO MICROSYSTEMS INC.');
  row('BIOS VERSION 4.1.0 · BUILD 271018 · LIVE CLIENT PROBE');
  blank();

  /* module self-check — surfaces missing/broken data files at boot */
  const mods=[
    ['ARTICLES', (ARTICLES&&ARTICLES.length)? ARTICLES.length+' ARTICLES INDEXED' : 'MISSING — CHECK articles.js'],
    ['PORTFOLIO DATA', window.DATA? 'DATA.JS MOUNTED' : 'MISSING — CHECK data.js'],
    ['ARCADE', (GAMES&&GAMES.length)? GAMES.length+' TITLES LOADED' : 'MISSING — CHECK games.js']
  ];
  for(const [n,v,ok] of mods){ row('MODULE '+n, v, ok?'ok':'err'); await sleep(60); }
  if(mods.some(m=>/MISSING/.test(m[1])))
    row('MODULE WARNING','OPEN CONSOLE (F12) — SCRIPT PATH OR SYNTAX FAULT','err');
  blank();

  const probeP=withTimeout(detectSpecs(),2500,{});
  const probe=row('Probing hardware on this machine','…');
  let s;
  if(st.skipped){ s=null; probe.textContent='SKIPPED'; }
  else{ s=await probeP; probe.textContent='DONE'; }
  await sleep(160);
  for(const [l,r,cls] of specRows(s)){
    if(l==='Memory'){
      const mv=row(l,'0K');
      if(!st.skipped&&s&&s.ram){
        const target=s.ram*1024;
        for(let i=1;i<=10;i++){ mv.textContent='≈'+Math.round(target*i/10)+'MB'; await sleep(42); autoscroll(); }
      }
      mv.textContent=s&&s.ram? '≈'+(s.ram*1024)+'MB OK [DEVICE MEMORY]' : (s?'HIDDEN BY BROWSER [PRIVACY]':'SKIPPED');
      mv.className='dim ok'; await sleep(80); continue;
    }
    row(l,r,cls); await sleep(70);
  }
  blank();
  row('Booting C:\\SAVIO\\SHELL.EXE','OK');
  await sleep(280);
  if(s&&s.browser){ s.probed=true; S.lastSpecs=s; }
  S.postTime=new Date();

  st.phase='gate';
  const grow=el('div','brow');
  grow.appendChild(el('span','blink','▶ POST COMPLETE — SCROLL TO REVIEW · PRESS ANY KEY'));
  const gb=el('button','skipbtn','[ ENTER SHELL » ]');
  gb.addEventListener('click',e=>{e.stopPropagation();if(gateRes)gateRes();});
  grow.appendChild(gb);
  w.appendChild(grow); autoscroll();
  await new Promise(r=>{ gateRes=r; if(st.skipped)setTimeout(r,60); });
  finish();

  function finish(){
    if(st.done)return; st.done=true;
    window.removeEventListener('keydown',onEvt,true);
    window.removeEventListener('pointerdown',onEvt,true);
    window.removeEventListener('touchstart',onEvt,true);
    SFX.beep();
    S.booting=false;
    route();
    Term.out.appendChild(el('pre','banner',DATA.banner));
    const q=S.lastSpecs;
    const sum=q?[q.cores?q.cores+' CORES':null,q.gpu?clip(q.gpu,26):null,q.hz?q.hz+'HZ':null].filter(Boolean).join(' · '):null;
    if(sum)Term.print('POST PASSED ['+sum+'] — RUN "SPECS" TO REVIEW THE FULL REPORT','ok');
    Term.print('PHOSPHOR SHELL v4.1.0 — WELCOME, OPERATOR.','ok');
    Term.print('TYPE "HELP" FOR COMMANDS · "WORK" FOR EXPERIENCE · "FS27" FOR THE ARCADE.');
    Term.print('HINT: F1 = CRT SETUP · "READ 001" OPENS THE LATEST ARTICLE.','dim');
    Term.nl();
    Term.focus();
  }
}

/* ================================================================
   ARTICLE READER — markdown: CRLF-safe, frontmatter, tables, images
   ================================================================ */
function inline(s){
  const out=[]; let rest=s,m;
  const re=/(!\[([^\]]*)\]\(([^)\s]+)[^)]*\))|(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/;
  while((m=re.exec(rest))){
    if(m.index)out.push(document.createTextNode(rest.slice(0,m.index)));
    if(m[1]!=null){
      const a=el('a','imgchip','▦ '+(m[2]||'IMAGE')+' ⧉');
      a.href=m[3]; a.target='_blank'; a.rel='noreferrer'; out.push(a);
    }
    else if(m[5]!=null)out.push(el('b',null,m[5]));
    else if(m[7]!=null)out.push(el('code',null,m[7]));
    else{const a=el('a',null,m[9]);a.href=m[10];a.target='_blank';a.rel='noreferrer';out.push(a);}
    rest=rest.slice(m.index+m[0].length);
  }
  if(rest)out.push(document.createTextNode(rest));
  return out;
}
function hl(code,lang){
  const K={js:'const let var function return if else for while do new class import from export default async await try catch throw typeof this null undefined true false of in',
    python:'def class return if elif else for while import from as with try except raise lambda None True False and or not in is pass yield global assert async await print self',
    bash:'if then fi for do done while export echo cd tail jq select npm git node python pip docker curl',
    css:'position absolute inset pointer events background repeating gradient animation none display flex grid'};
  const kw=(K[lang]||K.js).split(' ').join('|');
  const re=new RegExp('(\\/\\/[^\\n]*|#[^\\n]*)|("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\')|\\b('+kw+')\\b|(\\b\\d+(?:\\.\\d+)?\\b)','g');
  let out='',last=0,m;
  while((m=re.exec(code))){
    out+=esc(code.slice(last,m.index));
    const cls=m[1]?'tok-c':m[2]?'tok-s':m[3]?'tok-k':'tok-n';
    out+='<span class="'+cls+'">'+esc(m[0])+'</span>';
    last=m.index+m[0].length;
  }
  return out+esc(code.slice(last));
}
function codeBlock(lang,code){
  const w=el('div','cblock');
  const bar=el('div','cbar');
  bar.appendChild(el('span',null,'┌─ '+lang.toUpperCase()));
  const cp=el('button','chip mini','COPY');
  cp.onclick=()=>{ try{navigator.clipboard?navigator.clipboard.writeText(code):(function(){const t=document.createElement('textarea');t.value=code;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();})();}catch(e){}
    cp.textContent='COPIED ■'; SFX.tick(); setTimeout(()=>cp.textContent='COPY',1200); };
  bar.appendChild(cp);
  const pre=el('pre','scroller'); pre.innerHTML='<code>'+hl(code,lang)+'</code>';
  w.appendChild(bar); w.appendChild(pre);
  return w;
}
function mdTable(head,rows){
  const cols=head.length, w=[];
  for(let c=0;c<cols;c++)w[c]=head[c].length;
  rows.forEach(r=>{for(let c=0;c<cols;c++)w[c]=Math.max(w[c],((r&&r[c])||'').length);});
  const edge=(l,m,r2)=>l+w.map(n=>'─'.repeat(n+2)).join(m)+r2;
  const line=cells=>'│'+w.map((n,c)=>' '+String((cells&&cells[c])||'').padEnd(n)+' ').join('│')+'│';
  const out=[edge('┌','┬','┐'),line(head),edge('├','┼','┤')];
  rows.forEach(r=>out.push(line(r)));
  out.push(edge('└','┴','┘'));
  const pre=el('pre','mdtbl scroller'); pre.textContent=out.join('\n');
  return pre;
}
function mdRender(md){
  md=String(md||'').replace(/\r\n?/g,'\n');
  /* strip YAML frontmatter if present */
  if(/^---\s*\n/.test(md)){
    const end=md.indexOf('\n---',4);
    if(end>-1)md=md.slice(end+4).replace(/^\s*\n/,'');
  }
  const lines=md.split('\n'); const root=el('div','artbody'); const headings=[];
  let i=0,h2c=0;
  const add=n=>{root.appendChild(n);};
  while(i<lines.length){
    const l=lines[i];
    if(l.startsWith('~~~')||l.startsWith('```')){
      const fence=l.slice(0,3);
      const lang=l.slice(3).trim(); const buf=[]; i++;
      while(i<lines.length&&!lines[i].startsWith(fence)){buf.push(lines[i]);i++;}
      i++; add(codeBlock(lang||'txt',buf.join('\n'))); continue;
    }
    if(/^##\s/.test(l)){
      const id='sec-'+(h2c++); headings.push({id,title:l.slice(3)});
      const h=el('h2',null,''); h.id=id; inline(l.slice(3)).forEach(n=>h.appendChild(n)); add(h); i++; continue;
    }
    if(/^#{1,4}\s/.test(l)){ const h=el('h4'); inline(l.replace(/^#{1,4}\s/,'')).forEach(n=>h.appendChild(n)); add(h); i++; continue; }
    /* markdown table */
    if(/^\s*\|.*\|\s*$/.test(l)&&i+1<lines.length&&/^\s*\|[\s:|-]+\|\s*$/.test(lines[i+1])){
      const parse=r=>r.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());
      const head=parse(l); i+=2; const rows=[];
      while(i<lines.length&&/^\s*\|.*\|\s*$/.test(lines[i])){rows.push(parse(lines[i]));i++;}
      add(mdTable(head,rows)); continue;
    }
    if(/^>\s?/.test(l)){
      const q=el('blockquote');
      while(i<lines.length&&/^>\s?/.test(lines[i])){ inline(lines[i].replace(/^>\s?/,'')).forEach(n=>q.appendChild(n)); q.appendChild(el('br')); i++; }
      add(q); continue;
    }
    if(/^[-*]\s/.test(l)){
      const ul=el('ul');
      while(i<lines.length&&/^[-*]\s/.test(lines[i])){ const li=el('li'); inline(lines[i].replace(/^[-*]\s/,'')).forEach(n=>li.appendChild(n)); ul.appendChild(li); i++; }
      add(ul); continue;
    }
    if(/^\d+\.\s/.test(l)){
      const ol=el('ol');
      while(i<lines.length&&/^\d+\.\s/.test(lines[i])){ const li=el('li'); inline(lines[i].replace(/^\d+\.\s/,'')).forEach(n=>li.appendChild(n)); ol.appendChild(li); i++; }
      add(ol); continue;
    }
    if(/^---+\s*$/.test(l)){ add(el('div','hr','─'.repeat(64))); i++; continue; }
    if(!l.trim()){ i++; continue; }
    const buf=[l]; i++;
    while(i<lines.length&&lines[i].trim()&&!/^(#{1,4}\s|~~~|```|>|\s*\|[-\s:|]*\|)/.test(lines[i])&&!/^[-*]\s/.test(lines[i])&&!/^\d+\.\s/.test(lines[i])&&!/^---+\s*$/.test(lines[i])){buf.push(lines[i]);i++;}
    const p=el('p'); buf.flatMap(b2=>inline(b2).concat(' ')).forEach(n=>p.appendChild(n)); add(p);
  }
  return {root,headings};
}
function buildArticle(a){
  const v=el('div','aview');
  const pb=el('div','pathbar');
  const path=el('span','path','C:\\SAVIO\\BLOG\\'+a.slug.toUpperCase()+'.TXT');
  const pr=el('span');
  const setupB=el('button','chip mini','SETUP'); setupB.addEventListener('click',()=>Setup.open());
  const escB=el('button','chip mini','[ESC] RETURN TO TERMINAL'); escB.addEventListener('click',()=>go('#/'));
  pr.appendChild(setupB); pr.appendChild(document.createTextNode(' ')); pr.appendChild(escB);
  pb.appendChild(path); pb.appendChild(pr); v.appendChild(pb);
  const prog=el('div','aprog','['+'░'.repeat(24)+']   0% READ'); v.appendChild(prog);
  const sc=el('div','ascroll scroller'); const aw=el('div','awrap');
  const h1=el('h1','ah1',a.title); aw.appendChild(h1);
  const meta=el('div','frame dbl ameta'); meta.appendChild(el('span','lg','FILE METADATA'));
  const mg=el('div','mgrid');
  [['AUTHOR',DATA.identity.name],['DATE',a.date],['READ TIME',a.mins+' MIN'],['TAGS',a.tags.join(' · ')]].forEach(([k,val])=>{
    mg.appendChild(el('span','mk',k)); mg.appendChild(el('span',null,val));
  });
  meta.appendChild(mg);
  const {root,headings}=mdRender(a.md);
  if(headings.length){
    const toc=el('div','mtoc'); toc.appendChild(el('span','dim','TABLE OF CONTENTS'));
    headings.forEach(h=>{
      const bt=el('button',null,'► '+h.title);
      bt.addEventListener('click',()=>{const t=document.getElementById(h.id);if(t)t.scrollIntoView({behavior:'smooth'});SFX.tick();});
      toc.appendChild(bt);
    });
    meta.appendChild(toc);
  }
  aw.appendChild(meta); aw.appendChild(root);
  aw.appendChild(el('div','eof','■ ■ ■  EOF  ■ ■ ■'));
  const idx=ARTICLES.indexOf(a);
  const nav=el('div','anav');
  if(idx>0){const p=el('button','chip','◄ PREV: '+ARTICLES[idx-1].id);p.addEventListener('click',()=>openArticle(ARTICLES[idx-1]));nav.appendChild(p);}
  else nav.appendChild(el('span'));
  if(idx<ARTICLES.length-1){const n=el('button','chip','NEXT: '+ARTICLES[idx+1].id+' ►');n.addEventListener('click',()=>openArticle(ARTICLES[idx+1]));nav.appendChild(n);}
  aw.appendChild(nav);
  sc.appendChild(aw); v.appendChild(sc);
  const top=el('button','chip mini topchip','▲ TOP');
  top.addEventListener('click',()=>{sc.scrollTo({top:0,behavior:'smooth'});SFX.tick();});
  v.appendChild(top);
  sc.addEventListener('scroll',()=>{
    const max=sc.scrollHeight-sc.clientHeight;
    const pct=max>0?Math.min(100,Math.round(sc.scrollTop/max*100)):0;
    const f=Math.round(pct/100*24);
    prog.textContent='['+'█'.repeat(f)+'░'.repeat(24-f)+'] '+String(pct).padStart(3)+'% READ';
  });
  return v;
}

/* ================================================================
   NAV — openArticle with router failsafe
   ================================================================ */
function openArticle(a){
  if(!a)return;
  S.pendingArticle=a.slug;
  const target='#/article/'+a.slug;
  if(location.hash===target)route(); else location.hash=target;
  setTimeout(()=>{
    if(S.route!=='article'&&S.route!=='terminal-fault'){
      console.warn('[SAVIO/27] router fallback engaged for',a.slug);
      try{
        closeOverlay();
        S.route='article';
        const v=buildArticle(a); mount(v);
        v.querySelector('.ascroll').scrollTop=0;
      }catch(e){console.error(e);}
    }
  },300);
}
function closeOverlay(){
  try{ if(S.overlay==='game')GameModal.close(); }catch(e){ console.error(e); }
  try{ if(S.overlay==='setup')Setup.close(); }catch(e){ console.error(e); }
  S.overlay=null;
}
function go(hash){ if(location.hash===hash)route(); else location.hash=hash; }
function route(){
  if(S.booting)return;
  closeOverlay();
  try{
    const m=location.hash.match(/^#\/article\/([\w-]+)/);
    if(m){
      let a=ARTICLES?ARTICLES.find(x=>x.slug===m[1]):null;
      if(!a&&S.pendingArticle===m[1]&&ARTICLES)a=ARTICLES.find(x=>x.slug===S.pendingArticle);
      if(a){
        S.route='article'; S.pendingArticle=null;
        const v=buildArticle(a); mount(v);
        v.querySelector('.ascroll').scrollTop=0;
        return;
      }
    }
    S.route='terminal';
    if(!Term.view)Term.build();
    mount(Term.view);
    Term.focus();
  }catch(err){
    console.error('[SAVIO/27] route fault:',err);
    S.route='terminal';
    try{ if(!Term.view)Term.build(); app.innerHTML=''; app.appendChild(Term.view); }catch(e2){}
  }
}
window.addEventListener('hashchange',route);
window.addEventListener('unhandledrejection',ev=>{
  const r=ev.reason, msg=r&&(r.message||r);
  console.error('[SAVIO/27] async fault:',r);
  if(!S.booting&&Term.out&&Term.out.parentNode)Term.print('ASYNC FAULT: '+msg,'err');
});
window.addEventListener('error',ev=>{ console.error('[SAVIO/27]',ev.error||ev.message); });

/* ================================================================
   SETUP DRAWER
   ================================================================ */
const ROWS=[
  {k:'theme',   label:'DISPLAY THEME',      type:'cycle', opts:THEME_ORDER, fmt:v=>THEMES[v].label},
  {k:'scanlines',label:'SCANLINE INTENSITY',type:'range', min:0,max:80,step:5, fmt:v=>v+'%'},
  {k:'flicker', label:'REFRESH FLICKER',    type:'bool'},
  {k:'glow',    label:'PHOSPHOR GLOW',      type:'bool'},
  {k:'curve',   label:'CRT CURVATURE',      type:'bool'},
  {k:'wipe',    label:'CRT BEAM WIPE',      type:'bool'},
  {k:'sound',   label:'KEYCLICK AUDIO',     type:'bool'}
];
const Setup={
  open(){
    if(S.overlay==='setup')return;
    S.overlay='setup'; S.selRow=0;
    const sh=el('div','setup'); sh.id='setupDrawer';
    const t=el('div','stitle');
    t.appendChild(el('span',null,'── CRT SETUP UTILITY ──'));
    const x=el('button',null,'[X]'); x.addEventListener('click',()=>Setup.close()); t.appendChild(x);
    sh.appendChild(t);
    sh.appendChild(el('div','shint','◄ ► ADJUST VALUE · ↑↓ SELECT · ESC EXIT'));
    const rows=el('div','srows'); sh.appendChild(rows);
    const foot=el('div','sfoot');
    foot.appendChild(el('span',null,'SAVIO SETUP (C) 1987'));
    const rb=el('button','chip mini','RESTORE DEFAULTS');
    rb.addEventListener('click',()=>{cfg=Object.assign({},DEF);saveCfg();applyCfg();Setup.render();SFX.beep();});
    foot.appendChild(rb); sh.appendChild(foot);
    ov.innerHTML=''; ov.appendChild(sh);
    requestAnimationFrame(()=>sh.classList.add('open'));
    this.rowsEl=rows;
    this.render();
  },
  render(){
    if(!this.rowsEl)return;
    this.rowsEl.innerHTML='';
    ROWS.forEach((r,i)=>{
      const row=el('div','srow'+(i===S.selRow?' sel':''));
      row.appendChild(el('span','arr','►'));
      row.appendChild(el('span',null,r.label));
      const val=el('span','sval');
      if(r.type==='cycle'){
        r.opts.forEach(o=>{const sp=el('span','sopt'+(cfg[r.k]===o?' on':''),r.fmt(o));val.appendChild(sp);});
      }else{
        val.textContent=r.type==='bool'?(cfg[r.k]?'[ON ]':'[OFF]'):r.fmt(cfg[r.k]);
      }
      val.onclick=e=>{e.stopPropagation();S.selRow=i;this.adjust(1);this.render();};
      row.onclick=()=>{if(S.selRow===i)this.adjust(1);else{S.selRow=i;SFX.tick();}this.render();};
      this.rowsEl.appendChild(row);
    });
  },
  adjust(dir){
    const r=ROWS[S.selRow]; if(!r)return;
    SFX.tick();
    if(r.type==='bool')cfg[r.k]=!cfg[r.k];
    else if(r.type==='range')cfg[r.k]=Math.max(r.min,Math.min(r.max,cfg[r.k]+dir*r.step));
    else{const i=(r.opts.indexOf(cfg[r.k])+dir+r.opts.length)%r.opts.length;cfg[r.k]=r.opts[i];}
    saveCfg(); applyCfg(); this.render();
  },
  close(){
    const d=$('#setupDrawer'); if(!d)return;
    d.classList.remove('open');
    setTimeout(()=>{ if(S.overlay!=='setup'&&d.parentNode)d.remove(); },240);
    S.overlay=null;
  }
};

/* ================================================================
   GAME MODAL (FS27)
   ================================================================ */
const GameModal={
  open(){ if(S.overlay==='game')return;
    S.overlay='game'; S.gameIdx=0;
    const w=el('div','gwrap open'); w.id='gwrap';
    const win=el('div','gwin');
    const t=el('div','gtitle');
    this.titleEl=el('span',null,'FS27 ARCADE — MENU');
    t.appendChild(this.titleEl);
    const x=el('button',null,'[X] ESC'); x.addEventListener('click',()=>GameModal.close()); t.appendChild(x);
    win.appendChild(t);
    this.body=el('div','gbody'); win.appendChild(this.body);
    this.foot=el('div','gfoot'); win.appendChild(this.foot);
    w.appendChild(win); ov.innerHTML=''; ov.appendChild(w);
    this.menu();
  },
  hud(l,r){
    let h=this.hudEl;
    if(!h){ h=el('div','ghud'); this.hudEl=h; this.body.parentNode.insertBefore(h,this.body); }
    h.innerHTML='';
    h.appendChild(el('span','bv',l)); h.appendChild(el('span','dim',r));
  },
  actions(list){
    let pad=this.padEl;
    if(!list){ if(pad)pad.remove(); this.padEl=null; return; }
    if(!pad){ pad=el('div','gpad'); this.padEl=pad; this.body.appendChild(pad); }
    pad.innerHTML='';
    list.forEach(a=>{
      const b=el('button','gpbtn',a.label);
      if(a.hold){ b.addEventListener('pointerdown',()=>a.hold(true)); b.addEventListener('pointerup',()=>a.hold(false)); b.addEventListener('pointerleave',()=>a.hold(false)); }
      else b.addEventListener('click',a.fn);
      pad.appendChild(b);
    });
  },
  msg(t){
    if(!t){ if(this.msgEl){this.msgEl.remove();this.msgEl=null;} return; }
    if(!this.msgEl){ this.msgEl=el('div','gmsg'); this.body.appendChild(this.msgEl); }
    this.msgEl.textContent=t;
  },
  menu(){
    this.stopGame();
    this.titleEl.textContent='FS27 ARCADE — GAME SELECT';
    this.hud('FS27 ARCADE v1.0','3 TITLES LOADED');
    this.actions(null); this.msg('');
    this.body.innerHTML='';
    this.foot.innerHTML='<span>↑↓ SELECT · ENTER RUN · CLICK TO PLAY</span><span>ESC EXIT ARCADE</span>';
    GAMES.forEach((g,i)=>{
      const r=el('div','grow'+(i===S.gameIdx?' sel':''));
      r.appendChild(el('span','gmark','►'));
      const nm=el('span','gname',g.name);
      const fl=el('span','gfile',g.file);
      nm.appendChild(document.createTextNode(' ')); nm.appendChild(fl);
      r.appendChild(nm);
      r.appendChild(el('span','gdesc',g.desc));
      r.addEventListener('click',()=>{S.gameIdx=i;GameModal.launch(i);});
      this.body.appendChild(r);
    });
  },
  select(d){
    S.gameIdx=(S.gameIdx+d+GAMES.length)%GAMES.length;
    [...this.body.children].forEach((c,i)=>c.classList.toggle('sel',i===S.gameIdx));
    SFX.tick();
  },
  launch(i){
    this.stopGame();
    const g=GAMES[i];
    this.titleEl.textContent='FS27 ARCADE — '+g.name+' ['+g.file+']';
    this.body.innerHTML=''; this.hudEl=null; this.msgEl=null; this.padEl=null;
    const st=el('div'); st.style.position='relative'; st.id='gstage';
    this.body.appendChild(st);
    this.foot.innerHTML='<span>'+g.name+'</span><span>ESC EXIT</span>';
    const api={
      sfx:SFX,
      hud:(l,r)=>GameModal.hud(l,r),
      actions:l=>GameModal.actions(l),
      msg:t=>GameModal.msg(t),
      over:score=>{
        GameModal.msg('GAME OVER — SCORE '+score);
        GameModal.actions([{label:'RESTART',fn:()=>GameModal.launch(i)}]);
        SFX.err();
      },
      win:(t2,sub)=>{
        const w=el('div','mwin'); const f=el('div','frame');
        f.appendChild(el('span','lg','SYSTEM MESSAGE'));
        f.appendChild(el('div','bv',t2));
        f.appendChild(el('div','dim',sub));
        const b=el('button','chip','PLAY AGAIN');
        b.style.marginTop='12px';
        b.addEventListener('click',()=>GameModal.launch(i));
        f.appendChild(b); w.appendChild(f); st.appendChild(w);
        SFX.beep();
      }
    };
    SFX.beep();
    this.game=g.create(st,api);
  },
  stopGame(){ if(this.game){try{this.game.destroy();}catch(e){} this.game=null; } },
  close(){
    this.stopGame();
    const w=$('#gwrap'); if(w)w.remove();
    this.hudEl=null;this.padEl=null;this.msgEl=null;
    S.overlay=null;
  }
};

/* ================================================================
   GLOBAL KEYS
   ================================================================ */
window.addEventListener('keydown',e=>{
  if(S.booting)return;
  if(e.key==='F1'){e.preventDefault();Setup.open();return;}
  if(e.key==='F2'){e.preventDefault();cycleTheme();return;}
  if(e.key==='F3'){e.preventDefault();GameModal.open();return;}
  if(e.key==='Escape'){
    if(S.overlay==='game'){GameModal.close();return;}
    if(S.overlay==='setup'){Setup.close();return;}
    if(S.route==='article'){go('#/');return;}
    return;
  }
  if(S.overlay==='setup'){
    if(e.key==='ArrowUp'){e.preventDefault();S.selRow=(S.selRow+ROWS.length-1)%ROWS.length;Setup.render();}
    if(e.key==='ArrowDown'){e.preventDefault();S.selRow=(S.selRow+1)%ROWS.length;Setup.render();}
    if(e.key==='ArrowLeft'){e.preventDefault();Setup.adjust(-1);}
    if(e.key==='ArrowRight'){e.preventDefault();Setup.adjust(1);}
    return;
  }
  if(S.overlay==='game'){
    if(!GameModal.game){
      if(e.key==='ArrowUp'){e.preventDefault();GameModal.select(-1);}
      if(e.key==='ArrowDown'){e.preventDefault();GameModal.select(1);}
      if(e.key==='Enter'){e.preventDefault();GameModal.launch(S.gameIdx);}
    }
    return;
  }
  if(S.route==='terminal'&&!e.ctrlKey&&!e.metaKey&&e.key.length===1&&document.activeElement!==Term.inp){
    Term.focus();
  }
});
screenEl.addEventListener('mouseup',()=>{
  if(S.route!=='terminal'||S.overlay||S.booting)return;
  if(String(window.getSelection()).length)return;
  Term.focus();
});

/* ================================================================
   INIT
   ================================================================ */
applyCfg();
try{ S.cmd=JSON.parse(localStorage.getItem('s27cmd')||'[]'); }catch(e){ S.cmd=[]; }
Term.build();
boot();
})();