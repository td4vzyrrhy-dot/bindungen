/* ==========================================
   ATOMBINDUNG – GETEILTE ELEKTRONEN
   ========================================== */
(() => {
  'use strict';
  const covalentAtoms = {
    H: {name:'Wasserstoff',valence:1,targetShell:2,typicalBonds:1},
    Cl:{name:'Chlor',valence:7,targetShell:8,typicalBonds:1},
    O: {name:'Sauerstoff',valence:6,targetShell:8,typicalBonds:2},
    N: {name:'Stickstoff',valence:5,targetShell:8,typicalBonds:3},
    C: {name:'Kohlenstoff',valence:4,targetShell:8,typicalBonds:4}
  };
  const moleculeCatalog = [
    {id:'H2',formula:'H₂',title:'Baue ein Wasserstoffmolekül.',atoms:{H:2}},
    {id:'Cl2',formula:'Cl₂',title:'Baue ein Chlormolekül.',atoms:{Cl:2}},
    {id:'H2O',formula:'H₂O',title:'Baue Wasser.',atoms:{H:2,O:1}},
    {id:'NH3',formula:'NH₃',title:'Baue Ammoniak.',atoms:{N:1,H:3}},
    {id:'CH4',formula:'CH₄',title:'Baue Methan.',atoms:{C:1,H:4}},
    {id:'CH3Cl',formula:'CH₃Cl',title:'Baue Chlormethan.',atoms:{C:1,H:3,Cl:1}},
    {id:'NH2Cl',formula:'NH₂Cl',title:'Baue Chloramin.',atoms:{N:1,H:2,Cl:1}},
    {id:'CHCl3',formula:'CHCl₃',title:'Baue Chloroform.',atoms:{C:1,H:1,Cl:3}}
  ];
  const moleculeTasks = moleculeCatalog.slice(0,3);
  const slots = [{x:50,y:50},{x:12,y:50},{x:88,y:50},{x:50,y:12},{x:50,y:88}];
  const clone = value => JSON.parse(JSON.stringify(value));
  const emptyGraph = () => ({atoms:[],bonds:[]});
  const bondCount = (graph,id) => graph.bonds.filter(b=>b.includes(id)).length;
  const freePairCount = atom => (atom.free||[]).filter(value=>value===2).length;
  const bondKey = bond => [...bond].sort().join(':');
  function inspectGraph(graph) {
    if(!graph || !Array.isArray(graph.atoms) || !Array.isArray(graph.bonds)) return false;
    const ids = new Set(graph.atoms.map(a=>a.id));
    if(ids.size!==graph.atoms.length || graph.atoms.some(a=>!covalentAtoms[a.symbol]||!Array.isArray(a.free)||a.free.length!==4||a.free.some(value=>value!==0&&value!==2))) return false;
    const seen = new Set();
    for(const b of graph.bonds) {
      if(!Array.isArray(b)||b.length!==2||b[0]===b[1]||!ids.has(b[0])||!ids.has(b[1])||seen.has(bondKey(b)))return false;
      seen.add(bondKey(b));
    }
    return true;
  }
  function validateMolecule(graph,task) {
    if(!inspectGraph(graph))return {ok:false,message:'Prüfe die Verbindungen zwischen den Atomen.'};
    const counts = {};
    graph.atoms.forEach(a=>counts[a.symbol]=(counts[a.symbol]||0)+1);
    const symbols = new Set([...Object.keys(counts),...Object.keys(task.atoms)]);
    if([...symbols].some(s=>(counts[s]||0)!==(task.atoms[s]||0)))return {ok:false,message:'Vergleiche deinen Atomvorrat im Arbeitsbereich mit der Formel. Eine kleine Zahl gibt an, wie viele Atome dieser Sorte dazugehören.'};
    for(const atom of graph.atoms) {
      const data = covalentAtoms[atom.symbol], count = bondCount(graph,atom.id), expectedFreePairs=(data.valence-data.typicalBonds)/2;
      if(count!==data.typicalBonds)return {ok:false,message:`Prüfe ${data.name}: Das Atom hat hier ${count} ${count===1?'Bindung':'Bindungen'}. Wie viele Elektronen fehlen ihm ursprünglich zur vollen Außenschale?`,atom:atom.id};
      if(freePairCount(atom)!==expectedFreePairs)return {ok:false,message:`Verteile bei ${data.name} auch die freien Elektronenpaare. Benötigt werden hier ${expectedFreePairs}.`,atom:atom.id};
    }
    const reached = new Set();
    const visit = id => {if(reached.has(id))return;reached.add(id);graph.bonds.filter(b=>b.includes(id)).forEach(b=>visit(b.find(x=>x!==id)));};
    if(graph.atoms.length)visit(graph.atoms[0].id);
    if(reached.size!==graph.atoms.length)return {ok:false,message:'Gehören alle Atome zu einem zusammenhängenden Molekül?'};
    return {ok:true,message:'✓ Passt. Alle Atome erreichen in diesem Modell eine voll besetzte Außenschale.'};
  }
  const seededGraph = (symbols,bonds) => ({atoms:symbols.map((symbol,i)=>({id:'a'+i,symbol,slot:i,free:[0,0,0,0]})),bonds:bonds.map(b=>b.map(i=>'a'+i))});
  const repairTasks = [
    {...moleculeCatalog[2],id:'water',title:'Das soll ein Wassermolekül werden.',initial:seededGraph(['O','H'],[[0,1]]),palette:['H','O','Cl']},
    {...moleculeCatalog[4],id:'methane',title:'Das soll Methan CH₄ werden.',initial:seededGraph(['C','H','H','H'],[[0,1],[0,2],[0,3]]),palette:['H','O','Cl']},
    {...moleculeCatalog[3],id:'ammonia',title:'Das soll NH₃ werden.',initial:seededGraph(['N','H','H'],[[0,1],[0,2]]),palette:['H','N','Cl']},
    {...moleculeCatalog[1],id:'chlorine',title:'Verbinde die beiden Chloratome richtig.',initial:seededGraph(['Cl','Cl'],[]),palette:[]},
    {id:'hydrogen',formula:'H — H — H',title:'Hier hat ein Wasserstoffatom zu viele Bindungen.',initial:seededGraph(['H','H','H'],[[0,1],[0,2]]),palette:[],removeOnly:true}
  ];
  function checkMoleculeRepair(graph,task) {
    if(!task.removeOnly)return validateMolecule(graph,task);
    // One H remains unbound; do not claim that this isolated atom has a full shell.
    if(!inspectGraph(graph)||graph.atoms.length!==3||graph.atoms.some(a=>a.symbol!=='H')||graph.bonds.length!==1||!task.initial.bonds.some(b=>bondKey(b)===bondKey(graph.bonds[0])))return {ok:false,message:'Entferne genau eine der beiden Bindungen. Jedes H-Atom darf hier höchstens eine Bindung haben.'};
    return {ok:true,message:'✓ Die überzählige Bindung ist entfernt. Es bleiben ein H₂-Molekül mit vollen ersten Schalen und ein einzelnes, ungebundenes H-Atom. Dieses einzelne Atom besitzt weiterhin nur ein Elektron.'};
  }
  function allRequirementsMet(state) {
    return !!(state.hydrogenQuestion&&state.hydrogenIdea&&state.sharedH&&state.chlorineQuestion&&state.sharedCl&&state.partners&&state.builderContinued&&moleculeTasks.every(t=>state.built.includes(t.id))&&Object.keys(covalentAtoms).every(s=>state.matched[s]===covalentAtoms[s].typicalBonds)&&state.comparison&&repairTasks.every(t=>state.repairs.includes(t.id)));
  }
  // Pure model functions are also used by the local regression checks.
  window.CovalentModel = {covalentAtoms,moleculeTasks,repairTasks,validateMolecule,checkMoleculeRepair,allRequirementsMet,bondCount};

  function initCovalentBonding() {
    const root = document.querySelector('#covalent-learning');
    if(!root)return;
    const $ = selector => root.querySelector(selector);
    const saved = BindungenProgress.loadProgress().covalentLearning;
    const state = Object.assign({version:1,hydrogenQuestion:false,hydrogenIdea:false,sharedH:false,chlorineQuestion:false,sharedCl:false,partners:false,builderContinued:false,partnerPairs:[],built:[],matched:{},comparison:false,repairs:[],drafts:{},buildIndex:0,repairIndex:0},saved?.version===1?saved:{});
    state.built = Array.isArray(state.built)?state.built:[];
    state.repairs = Array.isArray(state.repairs)?state.repairs:[];
    state.matched = state.matched&&typeof state.matched==='object'?state.matched:{};
    state.drafts = state.drafts&&typeof state.drafts==='object'?state.drafts:{};
    // Preserve access for learners who already started the exercises after the builder.
    if(Object.keys(state.matched).length||state.comparison||state.repairs.length)state.builderContinued=true;
    let saveWarning = false;
    function persist() {
      try {const progress=BindungenProgress.loadProgress();progress.covalentLearning=clone(state);BindungenProgress.saveProgress(progress);}
      catch {saveWarning=true;$('#covalent-progress').textContent='Dein Browser kann den Fortschritt gerade nicht speichern. Lass diese Seite bis zum Abschluss geöffnet.';}
    }
    function feedback(node,text,success=false) {node.textContent=text;node.classList.toggle('is-success',success);}
    function reveal(selector,visible) {$(selector).hidden=!visible;}
    function refreshSections() {
      reveal('#hydrogen-idea',state.hydrogenQuestion);
      reveal('#hydrogen-sharing',state.hydrogenIdea);
      reveal('#covalent-definition',state.sharedH);
      reveal('#chlor-example',state.sharedH);
      reveal('#partner-activity',state.sharedCl);
      reveal('#molecule-builder',state.partners);
      const builderDone=moleculeTasks.every(t=>state.built.includes(t.id));
      reveal('#builder-continue',builderDone);
      reveal('#bond-number-match',builderDone&&state.builderContinued);
      reveal('#bond-comparison',Object.keys(covalentAtoms).every(s=>state.matched[s]===covalentAtoms[s].typicalBonds));
      reveal('#molecule-repair',state.comparison);
      const finished=allRequirementsMet(state);
      reveal('#covalent-summary',finished);
      const milestones=[state.sharedH,state.sharedCl,state.partners,...moleculeTasks.map(t=>state.built.includes(t.id)),Object.keys(state.matched).length===5,state.comparison,...repairTasks.map(t=>state.repairs.includes(t.id))];
      if(!saveWarning)$('#covalent-progress').textContent=`${milestones.filter(Boolean).length} von ${milestones.length} Lernschritten entdeckt · Dein Fortschritt wird gespeichert.`;
      const stage=finished?4:state.comparison?4:state.builderContinued?3:state.partners?2:state.hydrogenIdea?1:0;
      root.querySelectorAll('.covalent-path li').forEach((li,i)=>{li.classList.toggle('is-current',i===stage);li.classList.toggle('is-done',i<stage);if(i===stage)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
      if(finished)finishCovalentBonding();
    }
    function finishCovalentBonding() {
      if(!allRequirementsMet(state))return;
      const progress=BindungenProgress.loadProgress();
      if(!progress.completedMissions.includes(7)){try {BindungenProgress.completeMission(7,'atombindung');}catch {saveWarning=true;$('#covalent-progress').textContent='Die Freigabe konnte nicht gespeichert werden. Erlaube das Speichern von Websitedaten und lade die Seite erst danach neu.';}}
    }
    const quizData = {
      hydrogenQuestion:{answer:'1',success:'Beiden Atomen fehlt also genau ein Elektron.',hint:'Auf die erste Schale passen 2 Elektronen. Eines ist schon da.'},
      hydrogenIdea:{answer:'share',success:'Genau. Beide Elektronen können gemeinsam genutzt werden.',transfer:'Dann hätte ein Wasserstoffatom kein Elektron mehr. Probiere eine andere Idee.',lose:'Dann hätte keines der beiden Atome eine voll besetzte Schale.'},
      chlorineQuestion:{answer:'1',success:'Genau, eines fehlt. Welche Elektronen könnten die beiden Atome gemeinsam nutzen? Wähle jeweils das ungepaarte Elektron und tippe auf die Mitte.',hint:'Für eine volle Außenschale braucht Chlor in diesem Modell 8 Elektronen. Es hat bereits 7.'},
      comparison:{answer:'different',success:'✓ Genau: Bei der Ionenbindung werden Elektronen übertragen; bei der Atombindung werden sie gemeinsam genutzt.',hint:'Betrachte die beiden Modelle: Wandert ein Elektron zu einem Atom oder entsteht ein gemeinsames Paar?'}
    };
    root.querySelectorAll('[data-quiz]').forEach(quiz=>{
      const key=quiz.dataset.quiz,data=quizData[key];
      const showSolved=()=>{quiz.querySelectorAll('button').forEach(button=>{button.disabled=true;button.classList.toggle('is-correct',button.dataset.answer===data.answer);});feedback(quiz.querySelector('[role="status"]'),data.success,true);};
      if(state[key])showSolved();
      quiz.addEventListener('click',event=>{
        const button=event.target.closest('[data-answer]');if(!button||state[key])return;
        if(button.dataset.answer!==data.answer){feedback(quiz.querySelector('[role="status"]'),data[button.dataset.answer]||data.hint);return;}
        state[key]=true;showSolved();persist();refreshSections();
        if(key==='chlorineQuestion')sharing.Cl.enable();
      });
    });

    function createSharing(symbol) {
      const host=$(`[data-sharing="${symbol}"]`),key=symbol==='H'?'sharedH':'sharedCl';
      const complete=!!state[key];let selected=null,moved=complete?[0,1]:[],busy=false;
      const pairs=side=>symbol==='Cl'?`<span class="lone-pair top" aria-hidden="true">••</span><span class="lone-pair bottom" aria-hidden="true">••</span><span class="lone-pair ${side==='left'?'outer-left':'outer-right'}" aria-hidden="true">••</span>`:'';
      host.innerHTML=`<div class="sharing-stage ${complete?'is-shared is-line':''}"><div class="sharing-atom left"><strong>${symbol}</strong>${pairs('left')}</div><div class="sharing-atom right"><strong>${symbol}</strong>${pairs('right')}</div><button class="shared-electron-area" type="button" aria-label="Ausgewähltes Elektron in den gemeinsamen Bereich bewegen"><span>Mitte</span></button><span class="sharing-line" aria-hidden="true">—</span>${[0,1].map(i=>`<button type="button" class="shared-electron electron-${i} ${complete?'is-moved':''}" data-electron="${i}" aria-label="Ungepaartes Elektron des ${i===0?'linken':'rechten'} ${symbol==='H'?'Wasserstoffatoms':'Chloratoms'}" aria-pressed="false"><span aria-hidden="true">●</span></button>`).join('')}</div><p class="covalent-feedback sharing-feedback" role="status" aria-live="polite"></p><button type="button" class="btn sharing-toggle" ${complete?'':'hidden'}>Elektronenpaar anzeigen</button>`;
      const stage=host.querySelector('.sharing-stage'),target=host.querySelector('.shared-electron-area'),message=host.querySelector('.sharing-feedback'),toggle=host.querySelector('.sharing-toggle');
      const successText=symbol==='H'?'Die beiden Elektronen werden nun von beiden Atomen gemeinsam genutzt. Beide Wasserstoffatome können dadurch auf 2 Elektronen zugreifen.':'Auch hier entsteht ein gemeinsames Elektronenpaar. Beide Chloratome können dadurch eine voll besetzte Außenschale erreichen. Die übrigen Außenelektronen bleiben sichtbar.';
      function enable() {
        const enabled=symbol==='H'||state.chlorineQuestion;
        host.querySelectorAll('[data-electron]').forEach(button=>button.disabled=!enabled||moved.includes(Number(button.dataset.electron)));
        target.disabled=!enabled||moved.length===2;
        if(complete)feedback(message,successText,true);
        else if(!enabled)feedback(message,'Betrachte die sieben Punkte an jedem Atom und beantworte zuerst die Frage darunter.');
        else if(!moved.length)feedback(message,'Tippe zuerst ein ungepaartes Elektron an, dann auf die Mitte.');
      }
      stage.addEventListener('click',event=>{
        const button=event.target.closest('[data-electron]');if(!button||button.disabled||busy)return;
        selected=Number(button.dataset.electron);
        host.querySelectorAll('[data-electron]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
        feedback(message,'Elektron ausgewählt. Tippe jetzt auf die Mitte.');
      });
      target.addEventListener('click',()=>{
        if(selected===null){feedback(message,'Wähle zuerst eines der ungepaarten Elektronen aus.');return;}
        if(busy||moved.includes(selected))return;
        const button=host.querySelector(`[data-electron="${selected}"]`);
        moved.push(selected);button.classList.add('is-moved');button.setAttribute('aria-pressed','false');button.disabled=true;selected=null;
        if(moved.length===1){feedback(message,'Ein Elektron ist in der Mitte. Wähle jetzt das Elektron des anderen Atoms.');return;}
        busy=true;target.disabled=true;feedback(message,'Ein gemeinsames Elektronenpaar entsteht.');
        setTimeout(()=>{stage.classList.add('is-shared');feedback(message,successText,true);},700);
        setTimeout(()=>{state[key]=true;busy=false;stage.classList.add('is-line');toggle.hidden=false;persist();refreshSections();},1250);
      });
      toggle.addEventListener('click',()=>{const line=stage.classList.toggle('is-line');toggle.textContent=line?'Elektronenpaar anzeigen':'Bindungsstrich anzeigen';});
      enable();return {enable};
    }
    const sharing={H:createSharing('H'),Cl:createSharing('Cl')};

    let partnerSelection=null;
    const partnerSymbols=['H','H','Cl','Cl'];
    if(!Array.isArray(state.partnerPairs))state.partnerPairs=[];
    function renderPartners() {
      const used=state.partnerPairs.flat();
      $('#partner-atoms').innerHTML=partnerSymbols.map((s,i)=>`<button class="partner-atom" type="button" data-partner="${i}" aria-label="${covalentAtoms[s].name}, Atom ${i+1}" aria-pressed="${partnerSelection===i}" ${used.includes(i)?'disabled':''}><strong>${s}</strong><span>${used.includes(i)?'verbunden ✓':'antippen'}</span></button>`).join('');
      $('#partner-results').innerHTML=state.partnerPairs.map(pair=>{const a=partnerSymbols[pair[0]],b=partnerSymbols[pair[1]],formula=a===b?a+'₂':'HCl';return `<div class="partner-product"><span>${a}</span><b aria-label="gemeinsames Elektronenpaar">:</b><span>${b}</span><small>${formula}</small></div>`;}).join('');
    }
    $('#partner-atoms').addEventListener('click',event=>{
      const button=event.target.closest('[data-partner]');if(!button||button.disabled)return;
      const i=Number(button.dataset.partner);
      if(partnerSelection===null){partnerSelection=i;renderPartners();feedback($('#partner-feedback'),'Wähle jetzt ein zweites Atom.');return;}
      if(partnerSelection===i){partnerSelection=null;renderPartners();return;}
      state.partnerPairs.push([partnerSelection,i]);partnerSelection=null;
      if(state.partnerPairs.length===2)state.partners=true;
      feedback($('#partner-feedback'),'✓ Nichtmetall + Nichtmetall → Atombindung. Auch HCl ist eine passende Kombination.',true);persist();renderPartners();refreshSections();
    });
    $('#partner-reset').addEventListener('click',()=>{state.partnerPairs=[];partnerSelection=null;persist();renderPartners();feedback($('#partner-feedback'),'Probiere eine andere Kombination.');});
    renderPartners();

    // One graph editor serves both free construction and repairs. Positions never determine correctness.
    function atomSvg(symbol,degree=0,glasses=false,occupiedAngles=[],freePairs=0,freeZones=[0,0,0,0]) {
      const data=covalentAtoms[symbol];
      const singles=Math.max(0,data.typicalBonds-degree);
      const available=[-90,0,90,180].sort((a,b)=>{
        const distance=angle=>occupiedAngles.length?Math.min(...occupiedAngles.map(x=>Math.abs(((angle-x+540)%360)-180))):0;
        return distance(b)-distance(a);
      });
      let dots='';
      const drawPair=angle=>{const radialX=50+34*Math.cos(angle),radialY=50+34*Math.sin(angle),tangentX=-Math.sin(angle)*7,tangentY=Math.cos(angle)*7;dots+=`<line x1="${radialX-tangentX}" y1="${radialY-tangentY}" x2="${radialX+tangentX}" y2="${radialY+tangentY}" class="free-pair-line"/>`;};
      freeZones.forEach((value,index)=>{if(value===2)drawPair([-90,0,90,180][index]*Math.PI/180);});
      const groups=glasses?[...Array(degree).fill(1),...Array(singles).fill(1)]:[];
      groups.forEach((count,i)=>{const angle=available[(freePairs+i)%4]*Math.PI/180;const radialX=50+34*Math.cos(angle),radialY=50+34*Math.sin(angle);dots+=`<circle cx="${radialX}" cy="${radialY}" r="3" class="valence-dot"/>`;});
      return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" class="atom-disc"/><text x="50" y="58" text-anchor="middle">${symbol}</text>${dots}</svg>`;
    }
    class MoleculeEditor {
      constructor(host,kind,task,index) {
        this.host=host;this.kind=kind;this.task=task;this.index=index;this.key=kind+':'+task.id;this.selection=[];this.palette=null;this.glasses=false;this.highlight=null;
        const draft=state.drafts[this.key];
        this.graph=draft&&inspectGraph(draft)&&draft.atoms.every(a=>Number.isInteger(a.slot)&&slots[a.slot])&&new Set(draft.atoms.map(a=>a.slot)).size===draft.atoms.length?clone(draft):clone(task.initial||emptyGraph());
        this.solved=(kind==='builder'?state.built:state.repairs).includes(task.id)&&this.validate().ok;
        this.host.innerHTML=`<p class="editor-instructions">${task.removeOnly?'Tippe eine der beiden Bindungen an, um sie zu entfernen. Das übrige H-Atom bleibt sichtbar.':task.palette?.length===0?'Tippe die beiden Atome an und wähle „Elektronen teilen“.':'1. Atom im Vorrat wählen, dann einen freien Platz antippen. 2. Zwei gesetzte Atome antippen und „Elektronen teilen“ wählen. 3. Wähle ein Atom und anschließend die gewünschte Seite für ein freies Elektronenpaar.'}</p><div class="atom-palette" aria-label="Atomvorrat"></div><div class="builder-workspace ${kind==='repair'?'repair-workspace':''}" aria-label="Arbeitsbereich für dein Molekül"><svg class="bond-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg><div class="workspace-slots"></div><div class="workspace-bonds"></div><div class="workspace-atoms"></div></div><div class="free-pair-choices" hidden aria-label="Position des freien Elektronenpaars"></div><details class="bond-list"><summary>Bindungen ansehen und entfernen</summary><div class="bond-list-items"></div></details><div class="editor-tools"><button type="button" class="btn share-bond">Elektronen teilen</button><button type="button" class="btn remove-free-pair">Freies Paar entfernen</button><button type="button" class="btn remove-atom">Ausgewähltes Atom entfernen</button><button type="button" class="btn reset-molecule">${kind==='repair'?'Reparatur neu starten':'Arbeitsbereich leeren'}</button></div><p class="model-note">${task.removeOnly?'Ein Bindungsstrich steht für ein gemeinsames Elektronenpaar.':'Zum Entfernen einer Bindung tippe auf ihren Strich oder öffne „Bindungen ansehen und entfernen“. Wähle ein Atom und danach eine freie Seite.'}</p><div class="editor-check"><button type="button" class="btn btn-primary check-molecule">${kind==='repair'?'Reparatur prüfen':'Molekül prüfen'}</button><button type="button" class="btn electron-glasses" aria-pressed="false" hidden>Elektronenbrille einschalten</button></div><p class="covalent-feedback editor-feedback" role="status" aria-live="polite"></p><p class="covalent-feedback shell-feedback" role="status" aria-live="polite"></p>`;
        this.host.onclick=event=>this.handleClick(event);
        this.render();if(this.solved)this.showSuccess();
      }
      validate(){return this.kind==='repair'?checkMoleculeRepair(this.graph,this.task):validateMolecule(this.graph,this.task);}
      tell(text,success=false){feedback(this.host.querySelector('.editor-feedback'),text,success);}
      store(){state.drafts[this.key]=clone(this.graph);persist();}
      changed(){this.solved=false;this.glasses=false;this.highlight=null;this.host.querySelector('.shell-feedback').textContent='';this.store();this.render();$('#'+this.kind+'-next').hidden=true;}
      render() {
        const palette=this.task.palette||Object.keys(covalentAtoms);
        this.host.querySelector('.atom-palette').innerHTML=palette.map(s=>`<button type="button" class="palette-atom" data-palette="${s}" aria-pressed="${this.palette===s}" aria-label="${covalentAtoms[s].name}, ${covalentAtoms[s].valence} Außenelektronen auswählen">${atomSvg(s,0,true)}<span>${covalentAtoms[s].valence} Außenelektron${s==='H'?'':'en'}</span></button>`).join('');
        this.host.querySelector('.workspace-slots').innerHTML=slots.map((slot,i)=>this.graph.atoms.some(a=>a.slot===i)?'':`<button type="button" class="workspace-slot" data-slot="${i}" style="left:${slot.x}%;top:${slot.y}%" aria-label="${['Mitte','Links','Rechts','Oben','Unten'][i]}: Atom einsetzen" ${!palette.length?'disabled':''}>+</button>`).join('');
        this.host.querySelector('.workspace-atoms').innerHTML=this.graph.atoms.map(atom=>{
          const slot=slots[atom.slot],count=bondCount(this.graph,atom.id);
          const neighbors=this.graph.bonds.filter(b=>b.includes(atom.id)).map(b=>this.graph.atoms.find(a=>a.id===b.find(id=>id!==atom.id)));
          const angles=neighbors.map(n=>Math.atan2(slots[n.slot].y-slot.y,slots[n.slot].x-slot.x)*180/Math.PI);
          return `<button class="builder-atom ${this.highlight===atom.id?'shell-highlight':''}" type="button" data-atom="${atom.id}" style="left:${slot.x}%;top:${slot.y}%" aria-pressed="${this.selection.includes(atom.id)}" aria-label="${covalentAtoms[atom.symbol].name}, ${count} ${count===1?'Bindung':'Bindungen'}, ${freePairCount(atom)} freie Elektronenpaare, ${['Mitte','links','rechts','oben','unten'][atom.slot]}">${atomSvg(atom.symbol,count,this.glasses,angles,freePairCount(atom),atom.free)}<span class="atom-bond-count">${count} ${count===1?'Bindung':'Bindungen'} · ${freePairCount(atom)} freie Paare</span></button>`;
        }).join('');
        let lines='',targets='';
        this.graph.bonds.forEach((bond,i)=>{
          const a=slots[this.graph.atoms.find(atom=>atom.id===bond[0]).slot],b=slots[this.graph.atoms.find(atom=>atom.id===bond[1]).slot],x=(a.x+b.x)/2,y=(a.y+b.y)/2;
          const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy),ox=-dy/length*1.3,oy=dx/length*1.3;
          lines+=`<g class="builder-bond ${this.glasses?'with-glasses':''} ${this.freshBond===bondKey(bond)?'new-bond':''}"><line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/><g class="bond-electrons"><circle cx="${x+ox}" cy="${y+oy}" r=".95"/><circle cx="${x-ox}" cy="${y-oy}" r=".95"/></g></g>`;
          targets+=`<button type="button" class="bond-target" data-bond="${i}" style="left:${x}%;top:${y}%" aria-label="Bindung zwischen ${this.graph.atoms.find(a=>a.id===bond[0]).symbol} und ${this.graph.atoms.find(a=>a.id===bond[1]).symbol} entfernen"></button>`;
        });
        this.host.querySelector('.bond-layer').innerHTML=lines;
        this.host.querySelector('.workspace-bonds').innerHTML=targets;
        this.host.querySelector('.bond-list-items').innerHTML=this.graph.bonds.length?this.graph.bonds.map((bond,i)=>{
          const names=bond.map(id=>{const atom=this.graph.atoms.find(a=>a.id===id);return `${atom.symbol} (${'Mitte,links,rechts,oben,unten'.split(',')[atom.slot]})`;});
          return `<button type="button" class="btn" data-bond="${i}">${names.join(' — ')} entfernen</button>`;
        }).join(''):'<p>Noch keine Bindungen vorhanden.</p>';
        this.host.querySelector('.share-bond').disabled=this.selection.length!==2||this.task.removeOnly;
        this.host.querySelector('.share-bond').hidden=!!this.task.removeOnly;
        const freeChoices=this.host.querySelector('.free-pair-choices'),selectedAtom=this.selection.length===1?this.graph.atoms.find(atom=>atom.id===this.selection[0]):null;
        freeChoices.hidden=!selectedAtom||this.task.removeOnly;
        freeChoices.innerHTML=selectedAtom?`<span>Freies Paar platzieren:</span>${['oben','rechts','unten','links'].map((name,index)=>`<button type="button" class="btn" data-free-pair-zone="${index}" ${selectedAtom.free[index]===2?'disabled':''}>${name}</button>`).join('')}`:'';
        this.host.querySelector('.remove-free-pair').disabled=this.selection.length!==1||this.task.removeOnly||!this.selection.length||freePairCount(this.graph.atoms.find(atom=>atom.id===this.selection[0]))===0;
        this.host.querySelector('.remove-atom').hidden=this.kind==='repair';
        this.host.querySelector('.remove-atom').disabled=this.selection.length!==1;
        const glasses=this.host.querySelector('.electron-glasses');glasses.hidden=!this.solved;glasses.setAttribute('aria-pressed',String(this.glasses));glasses.textContent=this.glasses?'Elektronenbrille ausschalten':'Elektronenbrille einschalten';
      }
      handleClick(event) {
        const button=event.target.closest('button');if(!button||button.disabled)return;
        if(button.dataset.palette){this.palette=button.dataset.palette;this.selection=[];this.render();this.tell(`${covalentAtoms[this.palette].name} ausgewählt. Tippe auf einen freien Platz im Arbeitsbereich.`);return;}
        if(button.dataset.slot!==undefined){
          if(!this.palette){this.tell('Wähle zuerst ein Atom aus dem Vorrat.');return;}
          if(this.graph.atoms.length>=5){this.tell('Entferne zunächst ein Atom, um Platz zu schaffen.');return;}
          let id=0;while(this.graph.atoms.some(a=>a.id==='a'+id))id++;
          this.graph.atoms.push({id:'a'+id,symbol:this.palette,slot:Number(button.dataset.slot),free:[0,0,0,0]});this.palette=null;this.selection=[];this.changed();this.tell('Atom eingesetzt. Setze weitere Atome oder wähle zwei Atome zum Verbinden.');return;
        }
        if(button.dataset.atom){
          const id=button.dataset.atom;
          if(this.glasses){this.highlightElectronShell(id);return;}
          this.palette=null;
          this.selection=this.selection.includes(id)?this.selection.filter(x=>x!==id):this.selection.length===2?[id]:[...this.selection,id];
          this.render();this.tell(this.selection.length===2?'Zwei Atome ausgewählt. Tippe auf „Elektronen teilen“.':this.selection.length===1?'Wähle ein zweites Atom aus.':'Auswahl aufgehoben.');return;
        }
        if(button.dataset.bond!==undefined){this.graph.bonds.splice(Number(button.dataset.bond),1);this.selection=[];this.changed();this.tell('Bindung entfernt. Prüfe nun dein Modell.');return;}
        if(button.classList.contains('share-bond')){this.createSharedBond();return;}
        if(button.dataset.freePairZone!==undefined){this.addFreePair(Number(button.dataset.freePairZone));return;}
        if(button.classList.contains('remove-free-pair')){this.removeFreePair();return;}
        if(button.classList.contains('remove-atom')){const id=this.selection[0];this.graph.atoms=this.graph.atoms.filter(a=>a.id!==id);this.graph.bonds=this.graph.bonds.filter(b=>!b.includes(id));this.selection=[];this.changed();this.tell('Atom und seine Bindungen entfernt.');return;}
        if(button.classList.contains('reset-molecule')){this.graph=clone(this.task.initial||emptyGraph());this.selection=[];this.palette=null;this.changed();this.tell('Du kannst neu beginnen.');return;}
        if(button.classList.contains('check-molecule')){const result=this.validate();this.highlight=result.atom||null;if(result.ok){this.arrangeMolecule();this.solved=true;const done=this.kind==='builder'?state.built:state.repairs;if(!done.includes(this.task.id))done.push(this.task.id);this.store();this.render();this.showSuccess();renderTaskTabs(this.kind);refreshSections();}else{this.render();this.tell(result.message);}return;}
        if(button.classList.contains('electron-glasses')){this.glasses=!this.glasses;this.selection=[];this.render();this.tell(this.glasses?'Die Punkte zwischen den Atomen sind gemeinsame Elektronenpaare. Punkte am Atom sind nicht an Bindungen beteiligt. Tippe ein Atom an, um seine Außenschale zu prüfen.':'Die Bindungsstriche stehen wieder für die gemeinsam genutzten Elektronenpaare.',true);}
      }
      createSharedBond() {
        if(this.selection.length!==2)return;
        const pair=[...this.selection];
        if(this.graph.bonds.some(b=>bondKey(b)===bondKey(pair))){this.tell('Diese beiden Atome teilen bereits ein Elektronenpaar. In dieser Einführung verwenden wir nur Einfachbindungen.');return;}
        // Allow an incorrect bond count so the learner can inspect and repair it.
        this.graph.bonds.push(pair);this.freshBond=bondKey(pair);this.selection=[];this.changed();this.tell('Ein gemeinsames Elektronenpaar verbindet die beiden Atome. Prüfe, ob die Bindungszahlen passen.');
        setTimeout(()=>{if(this.host.onclick){this.freshBond=null;this.host.querySelectorAll('.new-bond').forEach(node=>node.classList.remove('new-bond'));}},1100);
      }
      addFreePair(zone) {
        const atom=this.graph.atoms.find(item=>item.id===this.selection[0]);
        if(!atom)return;
        if(atom.free[zone]===2){this.tell('Auf dieser Seite liegt bereits ein freies Elektronenpaar.');return;}
        atom.free[zone]=2;this.changed();this.tell(`Freies Elektronenpaar an ${covalentAtoms[atom.symbol].name} ergänzt.`);this.selection=[atom.id];this.render();
      }
      removeFreePair() {
        const atom=this.graph.atoms.find(item=>item.id===this.selection[0]);
        if(!atom)return;
        const zone=(atom.free||[]).lastIndexOf(2);
        if(zone<0)return;
        atom.free[zone]=0;this.changed();this.tell(`Freies Elektronenpaar an ${covalentAtoms[atom.symbol].name} entfernt.`);this.selection=[atom.id];this.render();
      }
      arrangeMolecule() {
        if(this.task.removeOnly)return;
        if(this.graph.atoms.length===2){this.graph.atoms.forEach((atom,i)=>atom.slot=i+1);return;}
        const center=[...this.graph.atoms].sort((a,b)=>bondCount(this.graph,b.id)-bondCount(this.graph,a.id))[0];
        center.slot=0;let slot=1;this.graph.atoms.filter(a=>a.id!==center.id).forEach(atom=>atom.slot=slot++);
      }
      showSuccess(){this.tell(this.validate().message,true);this.host.querySelector('.electron-glasses').hidden=false;const tasks=this.kind==='builder'?moleculeTasks:repairTasks;$('#'+this.kind+'-next').hidden=this.index===tasks.length-1;}
      highlightElectronShell(id){
        const atom=this.graph.atoms.find(a=>a.id===id),data=covalentAtoms[atom.symbol],count=data.valence+bondCount(this.graph,id),full=count===data.targetShell;
        this.highlight=id;this.render();feedback(this.host.querySelector('.shell-feedback'),`${data.name} kann auf ${count} ${atom.symbol==='H'?'Elektronen':'Außenelektronen'} zugreifen.${full?' ✓':' Die Schale dieses einzelnen Atoms ist noch nicht voll.'}`,full);
      }
    }
    const editors={};
    function renderTaskTabs(kind) {
      const tasks=kind==='builder'?moleculeTasks:repairTasks,done=kind==='builder'?state.built:state.repairs,index=kind==='builder'?state.buildIndex:state.repairIndex;
      $('#'+kind+'-tasks').innerHTML=tasks.map((task,i)=>`<button type="button" class="task-tab" data-task="${i}" ${i>0&&!done.includes(tasks[i-1].id)?'disabled':''} ${i===index?'aria-current="step"':''}>${i+1} · ${kind==='builder'?task.formula:'Reparatur'}${done.includes(task.id)?' ✓':''}</button>`).join('');
    }
    function openTask(kind,index) {
      const tasks=kind==='builder'?moleculeTasks:repairTasks,done=kind==='builder'?state.built:state.repairs;
      index=Math.max(0,Math.min(tasks.length-1,Number.isInteger(index)?index:0));
      if(index>0&&!done.includes(tasks[index-1].id))index=0;
      state[kind==='builder'?'buildIndex':'repairIndex']=index;
      const task=tasks[index];$('#'+kind+'-task-title').textContent=task.title;$('#'+kind+'-formula').textContent=task.formula;$('#'+kind+'-next').hidden=true;
      editors[kind]=new MoleculeEditor($('#'+kind+'-editor'),kind,task,index);renderTaskTabs(kind);persist();
    }
    ['builder','repair'].forEach(kind=>{
      $('#'+kind+'-tasks').addEventListener('click',event=>{const button=event.target.closest('[data-task]');if(button&&!button.disabled)openTask(kind,Number(button.dataset.task));});
      $('#'+kind+'-next').addEventListener('click',()=>{if(editors[kind].solved)openTask(kind,editors[kind].index+1);});
    });
    $('#builder-continue').addEventListener('click',()=>{
      if(!moleculeTasks.every(task=>state.built.includes(task.id)))return;
      state.builderContinued=true;persist();refreshSections();
      $('#bond-number-match').scrollIntoView?.({behavior:'smooth',block:'start'});
    });
    openTask('builder',state.buildIndex);openTask('repair',state.repairIndex);

    let matchSelected=null;
    // Shuffle once on page load; selecting a card must not move the other cards.
    const shuffleCards=cards=>{
      const result=[...cards];
      for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
      return result;
    };
    const matchAtoms=shuffleCards(Object.entries(covalentAtoms));
    let matchValues=shuffleCards([1,1,2,3,4]);
    const directlyAligned=()=>matchValues.some((value,i)=>value===matchAtoms[i][1].typicalBonds);
    for(let attempt=0;directlyAligned()&&attempt<40;attempt++)matchValues=shuffleCards(matchValues);
    // Keep every corresponding position different, even if repeated random draws align.
    if(directlyAligned())matchValues=matchAtoms.map(([symbol])=>({H:2,Cl:3,O:4,N:1,C:1})[symbol]);
    function renderMatching() {
      $('#matching-atoms').innerHTML=matchAtoms.map(([s,data])=>`<button type="button" class="match-atom" data-match="${s}" aria-pressed="${matchSelected===s}" ${state.matched[s]?'disabled':''}><strong>${s}</strong><span>Mir fehl${data.typicalBonds===1?'t':'en'} ${data.typicalBonds} Elektron${data.typicalBonds===1?'':'en'}.</span>${state.matched[s]?'<b>✓ zugeordnet</b>':''}</button>`).join('');
      const used={};Object.values(state.matched).forEach(n=>used[n]=(used[n]||0)+1);
      $('#matching-targets').innerHTML=matchValues.map((value,i)=>{const taken=(used[value]||0)>0;if(taken)used[value]--;return `<button type="button" class="match-target" data-count="${value}" data-target="${i}" ${taken?'disabled':''}>meistens <strong>${value} ${value===1?'Bindung':'Bindungen'}</strong>${taken?' ✓':''}</button>`;}).join('');
    }
    $('#matching-atoms').addEventListener('click',event=>{const b=event.target.closest('[data-match]');if(!b||b.disabled)return;matchSelected=b.dataset.match;renderMatching();feedback($('#matching-feedback'),`${covalentAtoms[matchSelected].name} ausgewählt. Tippe die passende Bindungszahl an.`);});
    $('#matching-targets').addEventListener('click',event=>{
      const b=event.target.closest('[data-count]');if(!b||b.disabled)return;
      if(!matchSelected){feedback($('#matching-feedback'),'Wähle zuerst eine Atomkarte aus.');return;}
      const count=Number(b.dataset.count),data=covalentAtoms[matchSelected];
      if(count!==data.typicalBonds){feedback($('#matching-feedback'),'Prüfe, wie viele Elektronen diesem Atom noch fehlen. Jede Einfachbindung stellt ein weiteres Elektron gemeinsam zur Verfügung.');return;}
      state.matched[matchSelected]=count;matchSelected=null;feedback($('#matching-feedback'),`✓ ${count} Außenelektron${count===1?' fehlt':'en fehlen'} → meist ${count} ${count===1?'Bindung':'Bindungen'}.`,true);persist();renderMatching();refreshSections();
    });
    renderMatching();refreshSections();
  }
  document.addEventListener('DOMContentLoaded',initCovalentBonding);
})();
