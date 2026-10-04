Customizing SAVIO/27
1. Identity & contact — js/data.js

Edit DATA.identity:

identity:{  name:'SAVIO FERNANDO',  handle:'savio@fsavio-lab',  tagline:'software engineer — python / generative ai',  contact:{    email:'fsavio27@gmail.com',    phone:'+91 9004736849',    site:'https://fsavio-lab.github.io',    github:'https://github.com/fsavio-lab',    linkedin:'https://www.linkedin.com/in/savio-fernando-2003891b5'  }}

This feeds bio, contact, article metadata and CONTACT.TXT.
2. Work log — DATA.work[]

{ co:'COMPANY', role:'Title', period:'MMM YYYY — MMM YYYY', cur:true,  tech:['TAG1','TAG2'],  pts:[ 'Achievement with a number in it.', '…' ] }

Rendered as LOG-01… frames; cur:true gets the [CURRENT] badge.
3. Projects — DATA.projects[]

The array ships empty ([]) → the storage-bay empty state renders.Push one object and full cards replace the bay automatically:

{ id:'PRJ-01', name:'NAME', year:'2025', status:'ACTIVE',   // ACTIVE|SHIPPED|BETA  desc:'One paragraph.',  stack:['TAG1','TAG2'],  links:[{label:'SOURCE',url:'https://github.com/…'},   // optional         {label:'LIVE',url:'https://…'}],  spec:'├─ LINE ONE\n└─ LINE TWO' }                        // optional pre block

4. Articles — js/articles.js

{ id:'001', slug:'my-post', title:'Title', date:'YYYY-MM-DD',  mins:7, tags:['TAG'],  excerpt:'One line for the index.',  md:`…markdown string…` }

Read command accepts: 001 (id), my-post (slug), or a uniquesubstring of either. .txt suffix is stripped.
Supported markdown dialect
Syntax	Renders as
## Heading	Section heading + TOC entry
### / # / ####	Minor heading
**bold** · `code`	Bright span · boxed inline chip
~~~js and ```js	Code block, syntax-highlighted (js python bash css), COPY button
> quote	Accent-bar blockquote
- item / 1. item	Lists (accent markers)
| a | b | + separator row	ASCII box table
[text](url)	Link (accent, dotted underline)
![alt](src)	Terminal image chip (opens in new tab)
---	ASCII rule
Leading --- YAML block	Stripped (frontmatter)

CRLF line endings are normalized automatically — paste straightfrom Windows editors or Notion exports.
5. Themes

CSS — add to css/style.css:

#screen[data-theme="mytube"]{--bg:#000;--fg:#0F0;--bright:#CFC;  --accent:#0F0;--accent2:#8F8;--dim:#060;--border:#0A0;  --barbg:#0F0;--barfg:#000;--sel:rgba(0,255,0,.1);  --glowc:0,255,0;--glowa:.4;--str:#CFC}

JS — register in both lists in data.js:

window.THEMES.mytube = {label:'MY TUBE', sw:['#000','#0F0']};window.THEME_ORDER.push('mytube');

F1, theme <TAB>, and the status-bar label pick it up automatically.
6. Files on the virtual drive — DATA.files

'NOTES.TXT':['line one','line two','']

Appears in ls, cat NOTES.TXT, and cat <TAB> completion. Bytesare simulated (lines × 64).
7. Banner

Open banner.html → pick tube → ⭳ DOWNLOAD PNG (1584×396,LinkedIn-exact). Edit contact rows in its rows[] array.