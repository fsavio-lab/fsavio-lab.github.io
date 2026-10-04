/* ============ SAVIO/27 — PORTFOLIO DATA (v4 · GENAI EDITION) ============ */
window.THEMES = {
  bios:      {label:'CLASSIC IBM BIOS',   sw:['#0000AA','#FFFF55']},
  phoenix:   {label:'PHOENIX BIOS',       sw:['#000033','#00AAAA']},
  green:     {label:'GREEN PHOSPHOR',     sw:['#020C02','#00FF66']},
  amber:     {label:'MONOCHROME AMBER',   sw:['#0C0800','#FFB000']},
  matrix:    {label:'CYBER MATRIX',       sw:['#000A0D','#00E5FF']},
  cmd:       {label:'COMMAND PROMPT',     sw:['#0C0C0C','#CCCCCC']},
  powershell:{label:'POWERSHELL CONSOLE', sw:['#012456','#FFE97F']},
  apple:     {label:'APPLE TERMINAL',     sw:['#FFFFFF','#1A1A1A']}
};
window.THEME_ORDER = ['bios','phoenix','green','amber','matrix','cmd','powershell','apple'];

window.DATA = {
    identity:{
    name:'SAVIO FERNANDO',
    handle:'savio@fsavio-lab',
    tagline:'software engineer — python / generative ai',
    contact:{
      email:'fsavio27@gmail.com',
      phone:'+91 9004736849',
      site:'https://fsavio-lab.github.io',
      github:'https://github.com/fsavio-lab',
      linkedin:'https://www.linkedin.com/in/savio-fernando-2003891b5'
    }
  },

  banner:
'███████╗ █████╗ ██╗   ██╗██╗ ██████╗ \n'+
'██╔════╝██╔══██╗██║   ██║██║██╔═══██╗\n'+
'███████╗███████║██║   ██║██║██║   ██║\n'+
'╚════██║██╔══██║╚██╗ ██╔╝██║██║   ██║\n'+
'███████║██║  ██║ ╚████╔╝ ██║╚██████╔╝\n'+
'╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚═╝ ╚═════╝ ',

  avatar:[
'   ╭─────────────╮',
'   │ ┌─────────┐ │',
'   │ │ >>> ▓▓▓ │ │',
'   │ │░░░░░░░░░│ │',
'   │ └─────────┘ │',
'   ╰─┬───────┬───╯',
' ┌───┴───────┴───┐',
' │ ▙▄▄▄▄▄▄▄▄▄▄▄▟ │',
' └───────────────┘'
  ].join('\n'),

    files:{
'README.TXT':[
'SAVIO FERNANDO ............ SAVIO/27 v4.1 [GENAI EDITION]',
'',
'Software engineer · 4+ years · Python backend, full stack',
'and Generative AI: agentic workflows, RAG / GraphRAG,',
'LoRA fine-tuning, FastAPI and AWS.',
'',
'OPEN TO: Python / GenAI / full stack roles.',
'',
'NEXT:  WORK ....... employment log',
'       PROJECTS ... case studies',
'       BLOG ....... articles',
'       CONTACT .... email · phone · links  ← recruiters',
'       FS27 ....... arcade (you earned it)'],
'CONTACT.TXT':[
'SAVIO FERNANDO — SOFTWARE ENGINEER (PYTHON / GENERATIVE AI)',
'',
'EMAIL ...... fsavio27@gmail.com',
'PHONE ...... +91 9004736849',
'PORTFOLIO .. https://fsavio-lab.github.io',
'GITHUB ..... https://github.com/fsavio-lab',
'LINKEDIN ... https://www.linkedin.com/in/savio-fernando-2003891b5',
'',
'Open to Python / Generative AI / full stack roles and',
'client-facing system design work.',
'',
'TIP: run CONTACT for the clickable version of this card.'],
'RESUME.TXT':[
'SAVIO FERNANDO — SOFTWARE ENGINEER (PYTHON / GENERATIVE AI)',
'',
'GRAYMATRIX ...... 2025-26  Assoc. SWE — Python/GenAI',
'UNIFYXPERTS ...... 2024-25  Senior Full Stack Developer',
'FAFADIA TECH ..... 2022-24  Full Stack Software Developer',
'FAFADIA TECH ..... 2022     Full Stack Developer Intern',
'',
'CORE: agentic ai · rag · graphrag · llm fine-tuning',
'      nlu · fastapi · aws · distributed systems',
'',
'Full log: run WORK · Contact: run CONTACT'],
'SKILLS.TXT':[
'LANGUAGES ..... python · javascript',
'BACKEND ....... fastapi · node.js · frappe · REST APIs',
'AI / LLM ...... langchain · langgraph · rag · graphrag',
'               lora / qlora fine-tuning · nlu',
'               nemo guardrails · guardrails ai',
'MODELS ........ gpt-4.1 · veo 3 · imagen',
'GRAPH DBS ..... neo4j · falkordb',
'VECTOR STORE .. mongodb (vector storage)',
'CLOUD ......... aws sqs · lambda · textract',
'               aws secrets manager',
'MOBILE ........ react native · paper · mmkv']
  },

   bio:[
    ['NAME','Savio Fernando'],
    ['ROLE','software engineer — python / genai'],
    ['EXPERIENCE','4+ years · 4 roles · 3 companies'],
    ['FOCUS','agentic ai · rag · llm fine-tuning'],
    ['LLM STACK','langchain · langgraph · guardrails'],
    ['GRAPH','neo4j · falkordb · graphrag'],
    ['BACKEND','fastapi · node.js · frappe'],
    ['CLOUD','aws sqs · lambda · textract'],
    ['UPTIME','__UPTIME__'],
    ['STATUS','● open to python / genai roles']
  ],

  work:[
    {co:'GRAYMATRIX', role:'Associate Software Engineer — Python / Generative AI', period:'JUN 2025 — AUG 2026', cur:true,
     tech:['PYTHON','FASTAPI','LANGCHAIN','LANGGRAPH','GPT-4.1','VEO 3','IMAGEN','NEO4J','FALKORDB','LORA/QLORA','AWS TEXTRACT','NODE.JS'],
     pts:[
      'Built an agentic AI social media platform (GPT-4.1 · Veo 3 · Imagen) generating and publishing multimodal content to Twitter, LinkedIn and WhatsApp.',
      'Shipped an MCP-enabled agentic procurement system — LangGraph + AWS Textract + MongoDB vectors — for tender OCR, knowledge retrieval, corrigendum generation, bid evaluation and AI-assisted award recommendations.',
      'Designed a GraphRAG architecture on Neo4j and FalkorDB combining graph knowledge with retrieval workflows; built modular RAG ingestion with custom chunking strategies.',
      'Developed LLM fine-tuning pipelines with LoRA / QLoRA for parameter-efficient domain adaptation.',
      'Built an NLU conversational AI system for government entities — natural-language mutual fund investment workflows.',
      'Evaluated NeMo Guardrails and Guardrails AI for reliability, controllability and governance of GenAI applications.'
     ]},
    {co:'UNIFYXPERTS', role:'Senior Full Stack Developer', period:'OCT 2024 — MAY 2025',
     tech:['PYTHON','FASTAPI','NODE.JS','FRAPPE','AWS SQS','AWS LAMBDA','SECRETS MANAGER'],
     pts:[
      'Engineered a real-time event-driven marketplace (Python · AWS SQS · Lambda) improving delivery efficiency by 35%.',
      'Developed scalable backend APIs and business workflows with Frappe, integrating cloud and third-party platforms.',
      'Designed asynchronous SQS/Lambda workflows decoupling services and hardening marketplace reliability.',
      'Implemented secure cloud integrations with AWS Secrets Manager and service-level authentication.',
      'Led technical consultations on 5+ client projects — from business requirements to system design, plans and estimates.'
     ]},
    {co:'FAFADIA TECH', role:'Full Stack Software Developer', period:'OCT 2022 — OCT 2024',
     tech:['PYTHON','FASTAPI','NODE.JS','FRAPPE','REACT NATIVE','MMKV'],
     pts:[
      'Developed ERP and e-commerce workflow automation (inventory · finance · CRM · marketplace) on Python and Frappe.',
      'Automated financial, logistics and CRM workflows — reducing manual operational effort by 40%.',
      'Built real-time order fulfillment and tracking workflows — processing speed and accuracy up 20%.',
      'Shipped a React Native news aggregation MVP (React Native Paper · MMKV) with offline data access; responsiveness up 38%.',
      'Consulted on requirements, solution design and technical estimation — client operational efficiency up 20%.'
     ]},
    {co:'FAFADIA TECH', role:'Full Stack Developer — Intern', period:'JUL 2022 — OCT 2022',
     tech:['PYTHON','JAVASCRIPT','LEGACY CODE'],
     pts:[
      'Analyzed operational workflows at material packaging facilities to scope business process automation opportunities.',
      'Refactored a legacy application codebase — performance and maintainability up 68% across selected workflows.'
     ]}
  ],

  /* Add real URLs to links:[{label:'SOURCE',url:'...'}] and the
     buttons appear on each card automatically. */
    /* PROJECTS BAY: intentionally empty for now. The terminal renders a
     creative "storage bay" empty state (app.js → cmdProjects).
     To add projects later, push objects:
     {id:'PRJ-01',name:'NAME',year:'2025',status:'ACTIVE',links:[{label:'SOURCE',url:'...'}],
      desc:'...',stack:['TAG'],spec:'├─ ...\n└─ ...'} */
  projects:[],
}