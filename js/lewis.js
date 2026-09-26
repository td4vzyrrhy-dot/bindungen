/* ==========================================
   LEWIS-SCHREIBWEISE – VOM ELEKTRON ZUR FORMEL
   ========================================== */
(() => {
  'use strict';
  const lewisAtoms={
    H:{name:'Wasserstoff',valenceElectrons:1,targetElectrons:2,typicalBonds:1,shells:[1]},
    C:{name:'Kohlenstoff',valenceElectrons:4,targetElectrons:8,typicalBonds:4,shells:[2,4]},
    N:{name:'Stickstoff',valenceElectrons:5,targetElectrons:8,typicalBonds:3,shells:[2,5]},
    O:{name:'Sauerstoff',valenceElectrons:6,targetElectrons:8,typicalBonds:2,shells:[2,6]},
    Cl:{name:'Chlor',valenceElectrons:7,targetElectrons:8,typicalBonds:1,shells:[2,8,7]}
  };
  const lewisMolecules={
    H2:{formula:'H₂',atoms:{H:2}},HCl:{formula:'HCl',atoms:{H:1,Cl:1}},Cl2:{formula:'Cl₂',atoms:{Cl:2}},
    H2O:{formula:'H₂O',atoms:{H:2,O:1}},NH3:{formula:'NH₃',atoms:{N:1,H:3}},CH4:{formula:'CH₄',atoms:{C:1,H:4}},
    CH3Cl:{formula:'CH₃Cl',atoms:{C:1,H:3,Cl:1}},NH2Cl:{formula:'NH₂Cl',atoms:{N:1,H:2,Cl:1}},CHCl3:{formula:'CHCl₃',atoms:{C:1,H:1,Cl:3}}
  };
  const buildTasks=['H2','HCl','Cl2','H2O','NH3','CH4'];
  const challengeTasks=['CH3Cl','NH2Cl','CHCl3'];
  const symbolTasks=['H','C','N','O','Cl'];
  const positions=['top','right','bottom','left'],positionNames=['oben','rechts','unten','links'];
  const slots=[{x:50,y:50},{x:12,y:50},{x:88,y:50},{x:50,y:12},{x:50,y:88}];
  const slotNames=['Mitte','links','rechts','oben','unten'];
  const checklist=[
    'Ich lese die Molekülformel und bestimme, welche Atome und wie viele davon zum Molekül gehören.',
    'Ich bestimme die Außenelektronen jedes Atoms mithilfe der Hauptgruppe im Periodensystem und addiere sie. Diese Gesamtzahl steht für meine Zeichnung zur Verfügung.',
    'Ich ordne die Elementsymbole an. Wasserstoff steht außen und bildet eine Bindung. Bei Molekülen mit mehreren Außenatomen steht das Atom mit den meisten Bindungsmöglichkeiten in unseren Beispielen in der Mitte.',
    'Ich verbinde benachbarte Atome zunächst durch Einfachbindungen. Jeder Bindungsstrich steht für ein gemeinsames Elektronenpaar und benötigt zwei Elektronen.',
    'Ich verteile die übrigen Elektronen als freie Elektronenpaare an den Atomen, zuerst an den Außenatomen. Ein freies Paar zeichne ich als zwei Punkte oder als Strich außen am Elementsymbol.',
    'Ich prüfe die Außenschalen: Wasserstoff soll auf zwei Elektronen zugreifen können (Duettregel), die anderen Atome in diesen Beispielen auf acht (Oktettregel). Gemeinsame Elektronenpaare zählen für beide verbundenen Atome.',
    'Fehlen trotz verteilter Elektronen noch Elektronen zur vollen Außenschale, prüfe ich, ob ein freies Elektronenpaar eines Nachbaratoms als weiteres gemeinsames Paar genutzt werden kann. So entsteht zum Beispiel eine Doppelbindung. Ich füge dabei keine neuen Elektronen hinzu.',
    'Zum Schluss kontrolliere ich Atomzahlen, Bindungen, freie Elektronenpaare und die Gesamtzahl der Elektronen. Sie muss mit meiner anfangs berechneten Zahl übereinstimmen.'
  ];
  const clone=value=>JSON.parse(JSON.stringify(value));
  const emptyGraph=()=>({atoms:[],bonds:[]});
  const edgeKey=b=>[b.from,b.to].sort().join(':');
  const sum=list=>list.reduce((a,b)=>a+b,0);
  function shuffle(values){const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
  function countBondElectrons(graph,id){return 2*sum(graph.bonds.filter(b=>b.from===id||b.to===id).map(b=>b.order));}
  function countLonePairElectrons(graph,id){return sum(graph.atoms.find(a=>a.id===id)?.free||[]);}
  function countElectronsForAtom(graph,id){return countBondElectrons(graph,id)+countLonePairElectrons(graph,id);}
  function totalDrawnElectrons(graph){return sum(graph.atoms.map(a=>sum(a.free)))+2*sum(graph.bonds.map(b=>b.order));}
  function valenceBudget(graph){return sum(graph.atoms.map(a=>lewisAtoms[a.symbol].valenceElectrons));}
  function validateDuet(graph,id){return countElectronsForAtom(graph,id)===2;}
  function validateOctet(graph,id){return countElectronsForAtom(graph,id)===8;}
  function inspectGraph(graph){
    if(!graph||!Array.isArray(graph.atoms)||!Array.isArray(graph.bonds))return false;
    const ids=new Set(graph.atoms.map(a=>a.id));
    if(ids.size!==graph.atoms.length||graph.atoms.some(a=>!lewisAtoms[a.symbol]||!Array.isArray(a.free)||a.free.length!==4||a.free.some(n=>!Number.isInteger(n)||n<0||n>2)))return false;
    const edges=new Set();for(const bond of graph.bonds){if(!ids.has(bond.from)||!ids.has(bond.to)||bond.from===bond.to||![1,2].includes(bond.order)||edges.has(edgeKey(bond)))return false;edges.add(edgeKey(bond));}return true;
  }
  function validateLewisSymbol(symbol,zones){
    if(!lewisAtoms[symbol]||!Array.isArray(zones)||zones.length!==4||zones.some(n=>!Number.isInteger(n)||n<0||n>2))return false;
    const n=lewisAtoms[symbol].valenceElectrons;
    return sum(zones)===n&&zones.filter(x=>x===1).length===(n<=4?n:8-n)&&zones.filter(x=>x===2).length===Math.max(0,n-4);
  }
  function validateLewisStructure(graph,moleculeId){
    const task=lewisMolecules[moleculeId];
    if(!task||!inspectGraph(graph))return {ok:false,message:'Prüfe die Atome und ihre Verbindungen.'};
    const counts={};graph.atoms.forEach(a=>counts[a.symbol]=(counts[a.symbol]||0)+1);
    if([...new Set([...Object.keys(counts),...Object.keys(task.atoms)])].some(s=>(counts[s]||0)!==(task.atoms[s]||0)))return {ok:false,message:'Vergleiche die Atomsorten und ihre Anzahl mit der Molekülformel.'};
    for(const atom of graph.atoms){
      const data=lewisAtoms[atom.symbol],bondElectrons=countBondElectrons(graph,atom.id),freeElectrons=sum(atom.free);
      if(atom.symbol==='H'&&(bondElectrons>2||bondElectrons+freeElectrons>2))return {ok:false,atom:atom.id,message:'Wasserstoff benötigt nur 2 Elektronen auf seiner ersten Schale. Prüfe seine Bindungen und freien Elektronen.'};
      if(bondElectrons!==data.typicalBonds*2)return {ok:false,atom:atom.id,message:`Prüfe die gemeinsamen Elektronenpaare an ${data.name}. Reichen sie für eine volle Außenschale, oder sind es zu viele?`};
      if(graph.bonds.some(b=>(b.from===atom.id||b.to===atom.id)&&b.order!==1))return {ok:false,atom:atom.id,message:'Prüfe die Bindungsordnung: Für dieses Molekül werden Einfachbindungen benötigt.'};
      const expectedFree=data.valenceElectrons-data.typicalBonds;
      if(moleculeId==='H2O'&&atom.symbol==='O'&&freeElectrons!==4)return {ok:false,atom:atom.id,message:'Bei H₂O braucht Sauerstoff zusätzlich zu den zwei O–H-Bindungen zwei freie Elektronenpaare (vier freie Elektronen).'};
      if(freeElectrons!==expectedFree||atom.free.some(n=>n===1))return {ok:false,atom:atom.id,message:'Prüfe, welche Außenelektronen nicht für die Bindung benötigt werden. Sind sie vollständig als freie Elektronenpaare eingezeichnet?'};
      if(countElectronsForAtom(graph,atom.id)!==data.targetElectrons)return {ok:false,atom:atom.id,message:`Zähle die Elektronen an ${data.name} mit dem Oktett-Scanner.`};
    }
    const reached=new Set();function visit(id){if(reached.has(id))return;reached.add(id);graph.bonds.filter(b=>b.from===id||b.to===id).forEach(b=>visit(b.from===id?b.to:b.from));}if(graph.atoms.length)visit(graph.atoms[0].id);
    if(reached.size!==graph.atoms.length)return {ok:false,message:'Die Atome müssen zu einem zusammenhängenden Molekül gehören.'};
    if(totalDrawnElectrons(graph)!==valenceBudget(graph))return {ok:false,message:'Prüfe die Gesamtzahl der Außenelektronen. Gemeinsame Paare werden in der Gesamtbilanz nur einmal gezählt.'};
    return {ok:true,message:'✓ Vollständig: Atome, Bindungen und freie Elektronenpaare stimmen. H erfüllt die Duettregel, die anderen Atome erfüllen die Oktettregel.'};
  }
  const seededGraph=(symbols,bonds,free=[])=>({atoms:symbols.map((symbol,i)=>({id:'a'+i,symbol,slot:i,free:free[i]||[0,0,0,0]})),bonds:bonds.map(([from,to,order=1])=>({from:'a'+from,to:'a'+to,order}))});
  const repairTasks=[
    {id:'hydrogen',molecule:'H2',title:'Wasserstoff: Prüfe das gemeinsame Paar.',initial:seededGraph(['H','H'],[[0,1,2]])},
    {id:'water',molecule:'H2O',title:'Wasser: Ist die Zeichnung vollständig?',initial:seededGraph(['O','H','H'],[[0,1],[0,2]])},
    {id:'ammonia',molecule:'NH3',title:'Ammoniak: Schau genau auf den Stickstoff.',initial:seededGraph(['N','H','H','H'],[[0,1],[0,2],[0,3]])},
    {id:'methane',molecule:'CH4',title:'Methan: Vergleiche mit der Formel.',initial:seededGraph(['C','H','H','H'],[[0,1],[0,2],[0,3]])},
    {id:'chlorine',molecule:'Cl2',title:'Chlor: Sind alle Außenelektronen da?',initial:seededGraph(['Cl','Cl'],[[0,1]],[[2,0,2,0],[2,0,2,0]])}
  ];
  function allRequirementsMet(s){return !!(s.outer&&symbolTasks.every(k=>s.symbols.includes(k))&&s.symbolRule&&s.hydrogenIdea&&s.sharedH&&s.hydrogenLine&&s.chlorSymbols.length===2&&s.sharedCl&&s.chlorineLine&&s.loneRule&&buildTasks.every(k=>s.built.includes(k))&&Object.keys(lewisAtoms).every(k=>s.pattern[k]===lewisAtoms[k].typicalBonds)&&repairTasks.every(t=>s.repairs.includes(t.id))&&s.challengeIds.length===3&&new Set(s.challengeIds).size===3&&s.challengeIds.every(k=>s.challengeDone.includes(k)))}
  function drawDots(n){return Array.from({length:n},()=>'<i class="electron-dot" aria-hidden="true"></i>').join('');}
  function renderLewisAtom(symbol,free=[0,0,0,0]){return `<span class="lewis-atom" data-element="${symbol}"><span class="element-symbol">${symbol}</span>${positions.map((side,i)=>`<span class="electron-zone ${side}" aria-label="${free[i]} freie Elektronen ${positionNames[i]}">${drawDots(free[i])}</span>`).join('')}</span>`;}
  function renderShell(symbol){const data=lewisAtoms[symbol],radii=data.shells.length===1?[75]:data.shells.length===2?[40,80]:[26,55,84];let drawing='';data.shells.forEach((count,shell)=>{const radius=radii[shell];drawing+=`<circle cx="100" cy="100" r="${radius}" class="shell-ring"/>`;for(let i=0;i<count;i++){const angle=(i/count*360-90)*Math.PI/180;drawing+=`<circle cx="${100+radius*Math.cos(angle)}" cy="${100+radius*Math.sin(angle)}" r="4.5" class="${shell===data.shells.length-1?'outer-electron':'inner-electron'}"/>`;}});return `<svg viewBox="0 0 200 200" role="img" aria-label="${data.name}: ${data.shells.join(', ')} Elektronen auf den Schalen, von innen nach außen"><circle cx="100" cy="100" r="17" class="shell-nucleus"/>${drawing}<text x="100" y="106" text-anchor="middle">${symbol}</text></svg><p>${data.name}<br><strong>${data.valenceElectrons} Außenelektron${data.valenceElectrons===1?'':'en'}</strong></p>`;}
  window.LewisLearning={lewisAtoms,lewisMolecules,buildTasks,repairTasks,checklist,validateLewisSymbol,validateLewisStructure,countBondElectrons,countLonePairElectrons,countElectronsForAtom,totalDrawnElectrons,valenceBudget,validateDuet,validateOctet,allRequirementsMet};

  function initLewisLearning(){
    const root=document.querySelector('#lewis-learning');if(!root)return;
    const $=selector=>root.querySelector(selector);
    const defaults={version:1,outer:false,symbols:[],symbolDrafts:{},symbolLineDrafts:{},symbolIndex:0,symbolRule:false,hydrogenIdea:false,sharedH:false,hydrogenLine:false,chlorSymbols:[],sharedCl:false,chlorineLine:false,loneRule:false,built:[],builderContinued:false,pattern:{},repairs:[],challengeIds:[],challengeDone:[],drafts:{},indices:{build:0,repair:0,challenge:0},attempts:{}};
    const saved=BindungenProgress.loadProgress().lewisLearning;
    const state=Object.assign(clone(defaults),saved?.version===1?saved:{});
    for(const key of ['symbols','chlorSymbols','built','repairs','challengeIds','challengeDone'])if(!Array.isArray(state[key]))state[key]=[];
    for(const key of ['symbolDrafts','pattern','drafts','indices','attempts'])if(!state[key]||typeof state[key]!=='object')state[key]={};
    if(state.challengeIds.length){
      const previous=state.challengeIds[state.indices.challenge||0];
      state.challengeIds=[...new Set(state.challengeIds.filter(id=>challengeTasks.includes(id)))].slice(0,3);
      for(const id of shuffle(challengeTasks))if(state.challengeIds.length<3&&!state.challengeIds.includes(id))state.challengeIds.push(id);
      state.challengeDone=state.challengeDone.filter(id=>state.challengeIds.includes(id));
      const pending=state.challengeIds.findIndex(id=>!state.challengeDone.includes(id));
      state.indices.challenge=state.challengeIds.includes(previous)?state.challengeIds.indexOf(previous):Math.max(0,pending);
    }
    let active=true,saveWarning=false,translator,sharingH,sharingCl;const editors={};
    const later=(fn,delay)=>setTimeout(()=>{if(active)fn();},delay);
    const tell=(node,message,ok=false)=>{node.textContent=message;node.classList.toggle('is-success',ok);};
    function persist(){try{const p=BindungenProgress.loadProgress();p.lewisLearning=clone(state);BindungenProgress.saveProgress(p);}catch{saveWarning=true;$('#lewis-progress').textContent='Der Fortschritt kann gerade nicht gespeichert werden. Lass diese Seite bis zum Abschluss geöffnet.';}}
    const show=(selector,visible)=>{$(selector).hidden=!visible;};
    const allBuilt=()=>buildTasks.every(k=>state.built.includes(k));
    const allPattern=()=>Object.keys(lewisAtoms).every(k=>state.pattern[k]===lewisAtoms[k].typicalBonds);
    const allRepairs=()=>repairTasks.every(t=>state.repairs.includes(t.id));
    function refresh(){
      show('#lewis-symbol-intro',state.outer);show('#lewis-translator',state.outer);
      show('#lewis-rule-question',symbolTasks.every(s=>state.symbols.includes(s)));show('#lewis-first-rule',state.symbolRule);
      show('#lewis-hydrogen',state.symbolRule);show('#lewis-bond-rule',state.hydrogenLine);show('#lewis-chlorine',state.hydrogenLine);
      show('#lewis-cl-sharing',state.chlorSymbols.length===2);show('#lewis-lone-question',state.chlorineLine);show('#lewis-second-rule',state.loneRule);
      show('#lewis-builder',state.loneRule);show('#lewis-build-continue',allBuilt());show('#lewis-pattern',allBuilt()&&state.builderContinued);
      show('#lewis-pattern-rule',allPattern());
      show('#lewis-detective',allPattern());show('#lewis-challenge',allRepairs()&&allPattern());
      if(allRepairs()&&allPattern()&&!editors.challenge)startChallenge();
      const complete=allRequirementsMet(state);show('#lewis-summary',complete);
      const milestones=[state.outer,...symbolTasks.map(k=>state.symbols.includes(k)),state.symbolRule,state.hydrogenLine,state.loneRule,...buildTasks.map(k=>state.built.includes(k)),allPattern(),...repairTasks.map(t=>state.repairs.includes(t.id)),...Array.from({length:3},(_,i)=>!!state.challengeIds[i]&&state.challengeDone.includes(state.challengeIds[i]))];
      if(!saveWarning)$('#lewis-progress').textContent=`${milestones.filter(Boolean).length} von ${milestones.length} Lernschritten · Dein Fortschritt wird gespeichert.`;
      const stage=allRepairs()?4:allBuilt()?3:state.loneRule?2:state.outer?1:0;
      root.querySelectorAll('.lewis-path li').forEach((li,i)=>{li.classList.toggle('is-current',i===stage);if(i===stage)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
      if(complete&&!BindungenProgress.loadProgress().completedMissions.includes(8)){try{BindungenProgress.completeMission(8,'lewis');}catch{saveWarning=true;$('#lewis-progress').textContent='Die Freigabe konnte nicht gespeichert werden. Erlaube das Speichern von Websitedaten.';}}
    }
    $('#lewis-h-shell').innerHTML=renderShell('H');$('#lewis-h-symbol').innerHTML=renderLewisAtom('H',[0,1,0,0]);
    $('#lewis-checklist-steps').innerHTML=checklist.map(step=>`<li>${step}</li>`).join('');
    const quizzes={
      outer:{question:'Welches Elektron ist für eine chemische Bindung besonders wichtig?',answers:['Das Außenelektron','Der Atomkern','Alle inneren Elektronen'],correct:0,success:'Für Bindungen sind vor allem die Außenelektronen wichtig.',hint:'Betrachte die äußerste besetzte Schale.'},
      symbolRule:{question:'Was zeigt ein Lewis-Symbol?',answers:['Alle Elektronen eines Atoms.','Nur die Außenelektronen eines Atoms.','Nur die Protonen.'],correct:1,success:'✓ Das Elementsymbol und die Außenelektronen reichen für das Lewis-Symbol.',hint:'Vergleiche das Schalenmodell mit deiner vereinfachten Darstellung.'},
      hydrogenIdea:{question:'Beiden Wasserstoffatomen fehlt jeweils ein Elektron. Was passiert bei der Atombindung?',answers:['Sie nutzen die beiden Elektronen gemeinsam.','Ein Atom gibt sein Elektron vollständig ab.','Die Elektronen verschwinden.'],correct:0,success:'Genau. Bewege beide Elektronen in die Mitte: Elektron antippen, dann Ziel antippen.',hint:'Erinnere dich an die Atombindung: Beide Atome nutzen etwas gemeinsam.'},
      loneRule:{question:'Was passiert mit den Elektronen, die nicht an der Bindung beteiligt sind?',answers:['Sie verschwinden beim Verbinden.','Sie bleiben als freie Elektronenpaare am Atom.','Sie werden alle an das andere Atom abgegeben.'],correct:1,success:'✓ Die übrigen Elektronen bleiben als freie Elektronenpaare am Atom.',hint:'Betrachte die Punkte, die weiterhin um jedes Chloratom stehen.'}
    };
    root.querySelectorAll('[data-quiz]').forEach(host=>{
      const key=host.dataset.quiz,data=quizzes[key];
      host.innerHTML=`<fieldset class="lewis-quiz"><legend>${data.question}</legend><div class="lewis-options">${data.answers.map((answer,i)=>`<button type="button" data-answer="${i}" ${state[key]?'disabled':''} class="${state[key]&&i===data.correct?'is-correct':''}">${answer}</button>`).join('')}</div><p class="lewis-feedback" role="status" aria-live="polite">${state[key]?data.success:''}</p></fieldset>`;
      host.addEventListener('click',event=>{const button=event.target.closest('[data-answer]');if(!button||button.disabled)return;if(Number(button.dataset.answer)!==data.correct){tell(host.querySelector('[role="status"]'),data.hint);return;}
        host.querySelectorAll('button').forEach(b=>{b.disabled=true;b.classList.toggle('is-correct',Number(b.dataset.answer)===data.correct);});tell(host.querySelector('[role="status"]'),data.success,true);
        const finish=()=>{state[key]=true;persist();refresh();if(key==='hydrogenIdea')sharingH.enable();};
        if(key==='outer'){$('#lewis-intro-model').classList.add('is-simplifying');later(finish,750);}else finish();
      });
    });

    class SymbolBuilder {
      constructor(host,symbol,key,done,onComplete){this.host=host;this.symbol=symbol;this.key=key;this.onComplete=onComplete;this.selected=false;this.done=done;const draft=state.symbolDrafts[key];const lineDraft=state.symbolLineDrafts?.[key];this.zones=Array.isArray(draft)&&draft.length===4&&draft.every(n=>Number.isInteger(n)&&n>=0&&n<=2)?clone(draft):[0,0,0,0];this.lines=Array.isArray(lineDraft)&&lineDraft.length===4?clone(lineDraft):[false,false,false,false];if(done&&!validateLewisSymbol(symbol,this.zones)){const n=lewisAtoms[symbol].valenceElectrons;this.zones=Array.from({length:4},(_,i)=>Math.min(2,Math.max(0,n-i>=1?1:0)+(n>4&&i<n-4?1:0)));}
        this.host.innerHTML=`<div class="lewis-symbol-builder"><h3>${lewisAtoms[symbol].name}</h3><p>${symbol} besitzt <strong>${lewisAtoms[symbol].valenceElectrons} Außenelektron${symbol==='H'?'':'en'}</strong>.</p><div class="symbol-electron-stock" aria-label="Ein Elektron zum mehrfachen Verwenden"></div><p class="lewis-model-note">Wähle das einzelne Elektron aus und setze es mehrfach auf die Seiten des Symbols. Klicke eine Seite mit zwei Punkten erneut an, um das Paar als Strich darzustellen.</p><div class="symbol-position-board"><strong class="element-symbol">${symbol}</strong>${positions.map((side,i)=>`<button type="button" class="electron-position ${side}" data-position="${i}" aria-label="Elektron ${positionNames[i]} einsetzen"></button>`).join('')}</div><div class="lewis-toolbar"><button type="button" class="btn symbol-check">Lewis-Symbol prüfen</button><button type="button" class="btn symbol-reset">Punkte neu setzen</button></div><p class="lewis-feedback symbol-feedback" role="status" aria-live="polite"></p></div>`;
        this.host.onclick=event=>this.click(event);this.render();
      }
      render(){this.host.querySelector('.symbol-electron-stock').innerHTML=`<button type="button" data-stock="electron" aria-label="Ein Elektron auswählen und mehrfach verwenden" aria-pressed="${this.selected}" ${this.done?'disabled':''}>${drawDots(1)}</button>`;this.host.querySelectorAll('[data-position]').forEach(button=>{const i=Number(button.dataset.position);button.innerHTML=this.lines[i]&&this.zones[i]===2?'<span class="electron-pair-line" aria-hidden="true"></span>':drawDots(this.zones[i]);button.disabled=this.done;button.setAttribute('aria-label',`${positionNames[i]}: ${this.zones[i]} Elektronen${this.lines[i]?' als Elektronenpaar-Strich':''}; Elektron einsetzen`);});this.host.querySelector('.symbol-check').disabled=this.done;this.host.querySelector('.symbol-reset').disabled=this.done;if(this.done)tell(this.host.querySelector('.symbol-feedback'),'✓ Lewis-Symbol vollständig.',true);}
      click(event){const b=event.target.closest('button');if(!b||b.disabled)return;const msg=this.host.querySelector('.symbol-feedback');if(b.dataset.stock!==undefined){this.selected=true;this.render();tell(msg,'Ein Elektron ist ausgewählt. Du kannst es mehrfach auf den Seiten einsetzen.');return;}
        if(b.dataset.position!==undefined){const i=Number(b.dataset.position);if(this.zones[i]===2){this.lines[i]=!this.lines[i];state.symbolLineDrafts[this.key]=clone(this.lines);persist();this.render();tell(msg,this.lines[i]?'Das Elektronenpaar wird jetzt als Strich dargestellt.':'Das Elektronenpaar wird wieder als zwei Punkte dargestellt.');return;}if(!this.selected){tell(msg,'Wähle zuerst das Elektron aus dem Vorrat.');return;}if(this.zones[i]===1&&this.zones.includes(0)){tell(msg,'Besetze zunächst jede Seite einmal, bevor du Elektronen paarweise anordnest.');return;}this.zones[i]++;state.symbolDrafts[this.key]=clone(this.zones);persist();this.render();tell(msg,`${sum(this.zones)} von ${lewisAtoms[this.symbol].valenceElectrons} Elektronen gesetzt.`);return;}
        if(b.classList.contains('symbol-reset')){this.zones=[0,0,0,0];this.selected=null;state.symbolDrafts[this.key]=clone(this.zones);persist();this.render();tell(msg,'Setze die Punkte neu.');return;}
        if(b.classList.contains('symbol-check')){if(!validateLewisSymbol(this.symbol,this.zones)){tell(msg,'Prüfe die Zahl der Außenelektronen und verteile sie zuerst einzeln auf die vier Seiten.');return;}this.done=true;this.render();this.onComplete();persist();refresh();}
      }
    }
    function renderTranslatorTabs(){$('#lewis-translator-tabs').innerHTML=symbolTasks.map((s,i)=>`<button type="button" data-symbol-task="${i}" ${i>0&&!state.symbols.includes(symbolTasks[i-1])?'disabled':''} ${i===state.symbolIndex?'aria-current="step"':''}>${s}${state.symbols.includes(s)?' ✓':''}</button>`).join('');}
    function openTranslator(index){index=Math.max(0,Math.min(4,Number.isInteger(index)?index:0));if(index>0&&!state.symbols.includes(symbolTasks[index-1]))index=0;state.symbolIndex=index;const symbol=symbolTasks[index];$('#translator-shell').innerHTML=renderShell(symbol);translator=new SymbolBuilder($('#translator-editor'),symbol,'translator:'+symbol,state.symbols.includes(symbol),()=>{if(!state.symbols.includes(symbol))state.symbols.push(symbol);renderTranslatorTabs();$('#translator-next').hidden=index===4;});renderTranslatorTabs();$('#translator-next').hidden=!state.symbols.includes(symbol)||index===4;}
    $('#lewis-translator-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-symbol-task]');if(b&&!b.disabled){openTranslator(Number(b.dataset.symbolTask));persist();}});
    $('#translator-next').addEventListener('click',()=>{if(translator.done){openTranslator(state.symbolIndex+1);persist();}});
    openTranslator(state.symbolIndex);
    ['left','right'].forEach(side=>new SymbolBuilder($('#chlor-symbol-'+side),'Cl','chlor:'+side,state.chlorSymbols.includes(side),()=>{if(!state.chlorSymbols.includes(side))state.chlorSymbols.push(side);sharingCl.enable();}));

    function createSharing(host,symbol){
      const isH=symbol==='H',sharedKey=isH?'sharedH':'sharedCl',lineKey=isH?'hydrogenLine':'chlorineLine';let moved=state[sharedKey]?[0,1]:[],selected=null;
      const freeLeft=isH?[0,0,0,0]:[2,0,2,2],freeRight=isH?[0,0,0,0]:[2,2,2,0];
      host.innerHTML=`<p>${isH?'Wähle beide Elektronen nacheinander aus.':'Die Symbole werden passend zueinander gedreht. Wähle jeweils das ungepaarte Elektron aus.'}</p><div class="lewis-sharing-stage ${state[lineKey]?'as-line':''} ${state[sharedKey]?'pair-ready':''}"><div class="sharing-symbol left">${renderLewisAtom(symbol,freeLeft)}</div><div class="sharing-symbol right">${renderLewisAtom(symbol,freeRight)}</div><button type="button" class="lewis-pair-target" aria-label="Ausgewähltes Elektron zwischen die Atome bewegen">Mitte</button><span class="lewis-shared-line" aria-hidden="true"></span>${[0,1].map(i=>`<button type="button" class="lewis-sharing-electron e${i} ${moved.includes(i)?'in-middle':''}" data-share-electron="${i}" aria-pressed="false" aria-label="Ungepaartes Elektron des ${i===0?'linken':'rechten'} ${symbol}-Atoms">${drawDots(1)}</button>`).join('')}</div><p class="lewis-feedback sharing-feedback" role="status" aria-live="polite"></p><button type="button" class="btn simplify-pair" ${state[sharedKey]?'':'hidden'}>${state[lineKey]?'Elektronenpaar anzeigen':'Darstellung vereinfachen'}</button>`;
      const stage=host.querySelector('.lewis-sharing-stage'),target=host.querySelector('.lewis-pair-target'),simplify=host.querySelector('.simplify-pair'),msg=host.querySelector('.sharing-feedback');
      function enable(){const enabled=isH?state.hydrogenIdea:state.chlorSymbols.length===2;host.querySelectorAll('[data-share-electron]').forEach(b=>b.disabled=!enabled||moved.includes(Number(b.dataset.shareElectron)));target.disabled=!enabled||moved.length===2;if(state[sharedKey])tell(msg,isH?'Diese beiden Elektronen bilden ein gemeinsames Elektronenpaar.':'Ein gemeinsames Elektronenpaar verbindet die Chloratome. Die anderen sechs Elektronen jedes Atoms bleiben sichtbar.',true);}
      host.addEventListener('click',event=>{const b=event.target.closest('button');if(!b||b.disabled)return;if(b.dataset.shareElectron!==undefined){selected=Number(b.dataset.shareElectron);host.querySelectorAll('[data-share-electron]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));tell(msg,'Elektron ausgewählt. Tippe auf die Mitte.');return;}
        if(b===target){if(selected===null){tell(msg,'Wähle zuerst ein ungepaartes Elektron aus.');return;}const electron=host.querySelector(`[data-share-electron="${selected}"]`);moved.push(selected);electron.classList.add('in-middle');electron.setAttribute('aria-pressed','false');electron.disabled=true;selected=null;if(moved.length===2){target.disabled=true;later(()=>{state[sharedKey]=true;stage.classList.add('pair-ready');simplify.hidden=false;enable();persist();refresh();},600);}else tell(msg,'Wähle nun das Elektron des anderen Atoms.');return;}
        if(b===simplify){if(!state[lineKey]){stage.classList.add('as-line');simplify.disabled=true;later(()=>{state[lineKey]=true;simplify.disabled=false;simplify.textContent='Elektronenpaar anzeigen';persist();refresh();},500);}else{const line=stage.classList.toggle('as-line');simplify.textContent=line?'Elektronenpaar anzeigen':'Bindungsstrich anzeigen';}}
      });enable();return {enable};
    }
    sharingH=createSharing($('#lewis-h-sharing'),'H');sharingCl=createSharing($('#lewis-cl-sharing'),'Cl');

    class LewisEditor {
      constructor(host,kind,molecule,key,initial=emptyGraph()){
        this.host=host;this.kind=kind;this.molecule=molecule;this.key=key;this.initial=clone(initial);this.selection=[];this.palette=null;this.mode=null;this.bondSelection=null;this.movingPair=null;this.highlight=null;this.scanVersion=0;this.disposed=false;
        const draft=state.drafts[key];this.graph=inspectGraph(draft)&&draft.atoms.length<=5&&draft.atoms.every(a=>Number.isInteger(a.slot)&&slots[a.slot])&&new Set(draft.atoms.map(a=>a.slot)).size===draft.atoms.length?clone(draft):clone(initial);
        this.solved=this.wasCompleted()&&validateLewisStructure(this.graph,molecule).ok;
        const challenge=kind==='challenge';
        this.host.innerHTML=`<p class="lewis-editor-instruction" ${challenge?'hidden':''}>Atom im Vorrat antippen → freien Platz wählen. Zwei Atome antippen → „Gemeinsames Paar“. Für freie Elektronen ein einzelnes Atom auswählen und unten eine Seite antippen.</p><div class="lewis-atom-palette" aria-label="Atomvorrat"></div><p class="lewis-electron-budget" ${challenge?'hidden':''}></p><div class="lewis-workspace" aria-label="Arbeitsfläche für die Lewis-Struktur"><svg class="lewis-bond-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg><div class="lewis-empty-slots"></div><div class="lewis-bond-targets"></div><div class="lewis-placed-atoms"></div></div><div class="lewis-selection-status" role="status" aria-live="polite"></div><div class="lewis-toolbar"><button type="button" class="btn connect-atoms">Gemeinsames Paar</button><button type="button" class="btn share-free-pair" hidden>Freies Paar gemeinsam nutzen</button><button type="button" class="btn remove-atom">Atom entfernen</button><button type="button" class="btn clear-editor">${kind==='repair'?'Ausgangsbild wiederherstellen':'Zeichnung leeren'}</button></div><section class="lewis-atom-inspector" hidden><h4></h4><div class="lewis-electron-modes"><button type="button" data-mode="single">Einzelnes Elektron</button><button type="button" data-mode="pair">Freies Elektronenpaar</button><button type="button" data-mode="remove">Elektron entfernen</button></div><div class="lewis-inspector-positions">${positions.map((side,i)=>`<button type="button" data-free-zone="${i}"><span>${positionNames[i]}</span><span class="inspector-dots"></span></button>`).join('')}</div><p class="lewis-model-note">Wähle ein Werkzeug und dann eine Seite. Die Orientierung der freien Paare darf variieren.</p></section><details class="lewis-bond-list"><summary>Bindungen auswählen und bearbeiten</summary><div class="lewis-bond-list-items"></div></details><div class="lewis-bond-tools" hidden><p class="selected-bond-label"></p><button type="button" class="btn reduce-bond">Ein gemeinsames Paar entfernen</button><button type="button" class="btn increase-bond">Ein gemeinsames Paar ergänzen</button></div><section class="octet-scanner"><div class="scanner-heading"><div><p class="step-label">1 · MIT DEM OKTETT-SCANNER ÜBERPRÜFEN</p><h4>Fertig gezeichnet? Starte jetzt den Scanner!</h4></div><button type="button" class="btn btn-primary run-scanner">Oktett-Scanner starten</button></div><p><strong>Benutze den Oktett-Scanner, um deine Zeichnung zu überprüfen.</strong> Prüfe die Rückmeldung für jedes Atom. Verbessere rot markierte Ergebnisse und starte den Scanner erneut. Klicke danach auf „Lewis-Struktur prüfen“ (bei einer Reparatur auf „Reparatur prüfen“).</p><p class="lewis-model-note">Ein gemeinsames Paar zählt bei beiden gebundenen Atomen zur Außenschale. Für H gilt die Duettregel mit 2 Elektronen.</p><div class="octet-results" role="status" aria-live="polite"></div></section><p class="step-label">2 · GESAMTE STRUKTUR PRÜFEN</p><div class="lewis-toolbar"><button type="button" class="btn btn-primary check-lewis">${kind==='repair'?'Reparatur prüfen':'Lewis-Struktur prüfen'}</button><button type="button" class="btn challenge-hint" hidden>Hinweis anzeigen</button></div><p class="lewis-feedback editor-feedback" role="status" aria-live="polite"></p>`;
        this.host.onclick=e=>this.click(e);this.render();if(this.solved)this.showSuccess();
      }
      wasCompleted(){return this.kind==='build'?state.built.includes(this.molecule):this.kind==='repair'?state.repairs.includes(this.key.split(':')[1]):state.challengeDone.includes(this.molecule);}
      isDoubleAllowed(){return false;}
      feedback(text,ok=false){const node=this.host.querySelector('.editor-feedback');node.classList.remove('is-result','is-error');tell(node,text,ok);}
      showResult(text,ok){this.feedback((ok?'✓ RICHTIG! ':'✗ NOCH NICHT RICHTIG. ')+text.replace(/^✓\s*/,''),ok);const node=this.host.querySelector('.editor-feedback');node.classList.add('is-result');node.classList.toggle('is-error',!ok);node.scrollIntoView?.({behavior:'smooth',block:'center'});}
      store(){state.drafts[this.key]=clone(this.graph);persist();}
      dispose(){this.disposed=true;this.scanVersion++;}
      mutated(){this.scanVersion++;this.solved=false;this.highlight=null;this.host.querySelector('.octet-results').innerHTML='';this.host.querySelector('.run-scanner').disabled=false;this.store();this.render();$('#lewis-'+this.kind+'-next').hidden=true;}
      atom(id){return this.graph.atoms.find(a=>a.id===id);}
      selectedAtom(){return this.selection.length===1?this.atom(this.selection[0]):null;}
      render(){
        const palette=Object.keys(lewisAtoms);
        this.host.querySelector('.lewis-atom-palette').innerHTML=palette.map(symbol=>`<button type="button" data-palette="${symbol}" aria-label="${lewisAtoms[symbol].name} einsetzen" aria-pressed="${this.palette===symbol}"><strong>${symbol}</strong><span>${lewisAtoms[symbol].valenceElectrons} Außenelektron${symbol==='H'?'':'en'}</span></button>`).join('');
        this.host.querySelector('.lewis-electron-budget').textContent=`Außenelektronen der gesetzten Atome: ${valenceBudget(this.graph)} · bisher eingezeichnet: ${totalDrawnElectrons(this.graph)} (gemeinsame Paare hier nur einmal gezählt)`;
        this.host.querySelector('.lewis-empty-slots').innerHTML=slots.map((slot,i)=>this.graph.atoms.some(a=>a.slot===i)?'':`<button type="button" class="lewis-empty-slot" data-slot="${i}" style="left:${slot.x}%;top:${slot.y}%" aria-label="Atom ${slotNames[i]} einsetzen" ${palette.length?'':'disabled'}>+</button>`).join('');
        this.host.querySelector('.lewis-placed-atoms').innerHTML=this.graph.atoms.map(a=>`<button type="button" class="lewis-atom-button ${this.highlight===a.id?'is-scanned':''}" data-atom="${a.id}" style="left:${slots[a.slot].x}%;top:${slots[a.slot].y}%" aria-pressed="${this.selection.includes(a.id)}" aria-label="${lewisAtoms[a.symbol].name} ${slotNames[a.slot]}, ${countBondElectrons(this.graph,a.id)/2} gemeinsame Paare, ${sum(a.free)} freie Elektronen">${renderLewisAtom(a.symbol,a.free)}</button>`).join('');
        let lines='',targets='',list='';
        this.graph.bonds.forEach((bond,i)=>{const aa=this.atom(bond.from),bb=this.atom(bond.to),a=slots[aa.slot],b=slots[bb.slot],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy),nx=-dy/length,ny=dx/length,x=(a.x+b.x)/2,y=(a.y+b.y)/2;let edgeLines='',dots='';for(let j=0;j<bond.order;j++){const offset=bond.order===2?(j===0?-1.3:1.3):0;edgeLines+=`<line x1="${a.x+nx*offset}" y1="${a.y+ny*offset}" x2="${b.x+nx*offset}" y2="${b.y+ny*offset}"/>`;dots+=`<circle cx="${x+nx*(offset-.75)}" cy="${y+ny*(offset-.75)}" r=".65"/><circle cx="${x+nx*(offset+.75)}" cy="${y+ny*(offset+.75)}" r=".65"/>`;}
          lines+=`<g class="lewis-bond ${this.freshBond===edgeKey(bond)?'fresh-pair':''} ${this.bondSelection===i?'selected-bond':''}"><g class="bond-lines">${edgeLines}</g><g class="shared-pair-dots">${dots}</g></g>`;
          const name=`${aa.symbol} (${slotNames[aa.slot]}) – ${bb.symbol} (${slotNames[bb.slot]}), ${bond.order} gemeinsame${bond.order===1?'s':''} Paar${bond.order===1?'':'e'}`;
          targets+=`<button type="button" class="lewis-bond-hit" data-bond="${i}" style="left:${x}%;top:${y}%" aria-label="${name} bearbeiten"></button>`;
          list+=`<button type="button" class="btn" data-bond="${i}" aria-pressed="${this.bondSelection===i}">${name}</button>`;
        });
        this.host.querySelector('.lewis-bond-layer').innerHTML=lines;this.host.querySelector('.lewis-bond-targets').innerHTML=targets;this.host.querySelector('.lewis-bond-list-items').innerHTML=list||'<p>Noch keine Bindungen.</p>';
        this.host.querySelector('.connect-atoms').disabled=this.selection.length!==2;
        this.host.querySelector('.remove-atom').disabled=this.selection.length!==1;
        const selected=this.selectedAtom(),inspector=this.host.querySelector('.lewis-atom-inspector');inspector.hidden=!selected;
        if(selected){inspector.querySelector('h4').textContent=`Freie Elektronen an ${lewisAtoms[selected.symbol].name} (${slotNames[selected.slot]})`;inspector.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===this.mode)));inspector.querySelectorAll('[data-free-zone]').forEach(b=>{const i=Number(b.dataset.freeZone);b.querySelector('.inspector-dots').innerHTML=drawDots(selected.free[i]);b.setAttribute('aria-label',`${positionNames[i]}: ${selected.free[i]} freie Elektronen bearbeiten`);b.disabled=false;});}
        const move=this.host.querySelector('.share-free-pair');move.hidden=true;move.disabled=!selected||selected.symbol!=='O'||!selected.free.includes(2);
        this.host.querySelector('.lewis-selection-status').textContent=this.movingPair?'Ein freies Paar ist ausgewählt. Tippe jetzt das benachbarte C-Atom an.':this.selection.length===2?'Zwei Atome ausgewählt.':selected?`${lewisAtoms[selected.symbol].name} ausgewählt.`:'';
        const bond=this.graph.bonds[this.bondSelection],tools=this.host.querySelector('.lewis-bond-tools');tools.hidden=!bond;
        if(bond){tools.querySelector('.selected-bond-label').textContent=`Ausgewählt: ${this.atom(bond.from).symbol} – ${this.atom(bond.to).symbol}, ${bond.order} gemeinsame${bond.order===1?'s':''} Paar${bond.order===1?'':'e'}`;tools.querySelector('.increase-bond').hidden=!this.isDoubleAllowed();tools.querySelector('.increase-bond').disabled=bond.order>=2;tools.querySelector('.reduce-bond').disabled=false;}
        const attempted=(state.attempts[this.key]||0)>0;
        this.host.querySelector('.challenge-hint').hidden=this.kind!=='challenge'||!attempted||this.solved;
        this.host.querySelector('.octet-scanner').hidden=false;
      }
      click(event){const b=event.target.closest('button');if(!b||b.disabled||this.disposed)return;
        if(b.dataset.palette){this.palette=b.dataset.palette;this.selection=[];this.bondSelection=null;this.movingPair=null;this.render();this.feedback('Atom ausgewählt. Tippe einen freien Platz an.');return;}
        if(b.dataset.slot!==undefined){if(!this.palette){this.feedback('Wähle zuerst ein Atom aus dem Vorrat.');return;}let i=0;while(this.atom('a'+i))i++;this.graph.atoms.push({id:'a'+i,symbol:this.palette,slot:Number(b.dataset.slot),free:[0,0,0,0]});this.palette=null;this.selection=[];this.mutated();this.feedback('Atom eingesetzt.');return;}
        if(b.dataset.atom){const id=b.dataset.atom;if(this.movingPair){this.convertFreePair(id);return;}this.palette=null;this.bondSelection=null;this.selection=this.selection.includes(id)?this.selection.filter(x=>x!==id):this.selection.length===2?[id]:[...this.selection,id];this.render();return;}
        if(b.dataset.bond!==undefined){this.bondSelection=Number(b.dataset.bond);this.selection=[];this.palette=null;this.movingPair=null;this.render();this.feedback('Bindung ausgewählt. Bearbeite sie mit den Schaltflächen unter der Bindungsliste.');return;}
        if(b.dataset.mode){this.mode=b.dataset.mode;this.render();return;}
        if(b.dataset.freeZone!==undefined){const atom=this.selectedAtom();if(!atom)return;if(!this.mode){this.feedback('Wähle zuerst eine Möglichkeit: einzelnes Elektron, freies Elektronenpaar oder Elektron entfernen.');return;}const zone=Number(b.dataset.freeZone),change=this.mode==='pair'?2:this.mode==='single'?1:-1;if(atom.free[zone]+change>2){this.feedback('Auf dieser Seite ist kein Platz für weitere Elektronen. Wähle eine andere Seite.');return;}if(atom.free[zone]+change<0){this.feedback('Auf dieser Seite ist kein freies Elektron eingezeichnet.');return;}atom.free[zone]+=change;this.mutated();this.feedback('Freie Elektronen geändert.');return;}
        if(b.classList.contains('connect-atoms')){this.connectAtoms();return;}
        if(b.classList.contains('share-free-pair')){this.movingPair=this.selection[0];this.render();return;}
        if(b.classList.contains('remove-atom')){const id=this.selection[0];this.graph.atoms=this.graph.atoms.filter(a=>a.id!==id);this.graph.bonds=this.graph.bonds.filter(edge=>edge.from!==id&&edge.to!==id);this.selection=[];this.mutated();this.feedback('Atom und zugehörige Bindungen entfernt.');return;}
        if(b.classList.contains('clear-editor')){this.graph=clone(this.initial);this.selection=[];this.palette=null;this.bondSelection=null;this.movingPair=null;this.mutated();this.feedback('Die Zeichnung ist zum Neubeginn bereit.');refresh();return;}
        if(b.classList.contains('reduce-bond')||b.classList.contains('increase-bond')){const bond=this.graph.bonds[this.bondSelection];if(!bond)return;bond.order+=b.classList.contains('reduce-bond')?-1:1;if(bond.order===0)this.graph.bonds.splice(this.bondSelection,1);this.bondSelection=null;this.mutated();this.feedback('Bindungsordnung geändert. Prüfe auch die freien Elektronen.');return;}
        if(b.classList.contains('check-lewis')){this.check();return;}
        if(b.classList.contains('challenge-hint')){this.feedback(validateLewisStructure(this.graph,this.molecule).message);return;}
        if(b.classList.contains('run-scanner'))this.runOctetScanner();
      }
      connectAtoms(){if(this.selection.length!==2)return;const [from,to]=this.selection;const existing=this.graph.bonds.find(b=>(b.from===from&&b.to===to)||(b.from===to&&b.to===from));if(existing){this.feedback(this.isDoubleAllowed()?'Zwischen diesen Atomen besteht bereits eine Bindung. Wähle die Bindung aus, um ein Paar zu ergänzen, oder nutze ein freies Paar gemeinsam.':'Diese Atome teilen schon ein Paar. Hier verwendest du zunächst Einfachbindungen.');return;}const bond={from,to,order:1};this.graph.bonds.push(bond);this.freshBond=edgeKey(bond);this.selection=[];this.mutated();this.feedback('Ein gemeinsames Elektronenpaar wird zum Bindungsstrich.');later(()=>{if(this.disposed)return;this.freshBond=null;this.host.querySelectorAll('.fresh-pair').forEach(n=>n.classList.remove('fresh-pair'));},1100);}
      convertFreePair(targetId){const source=this.atom(this.movingPair),target=this.atom(targetId),bond=this.graph.bonds.find(b=>[b.from,b.to].includes(source?.id)&&[b.from,b.to].includes(targetId));if(!source||target?.symbol!=='C'||!bond||bond.order!==1||!source.free.includes(2)){this.feedback('Wähle das benachbarte C-Atom mit einer Einfachbindung.');return;}const before=totalDrawnElectrons(this.graph);source.free[source.free.lastIndexOf(2)]-=2;bond.order=2;this.freshBond=edgeKey(bond);this.movingPair=null;this.selection=[];this.mutated();this.feedback(`Ein bisher freies Paar wird gemeinsam genutzt. Die Gesamtzahl bleibt ${before} Elektronen.`,true);later(()=>{if(!this.disposed){this.freshBond=null;this.host.querySelectorAll('.fresh-pair').forEach(n=>n.classList.remove('fresh-pair'));}},1100);}
      check(){const result=validateLewisStructure(this.graph,this.molecule);if(!result.ok){state.attempts[this.key]=(state.attempts[this.key]||0)+1;this.highlight=this.kind==='challenge'?null:result.atom;this.store();this.render();this.showResult((this.kind==='challenge'?'Prüfe deine Zeichnung oder fordere einen Hinweis an.':result.message)+' Benutze den Oktett-Scanner oben zur Überprüfung und verbessere deine Zeichnung.',false);return;}this.markSolved();}
      markSolved(){if(!validateLewisStructure(this.graph,this.molecule).ok)return;this.solved=true;this.selection=[];this.bondSelection=null;this.arrange();if(this.kind==='build'){if(!state.built.includes(this.molecule))state.built.push(this.molecule);}else if(this.kind==='repair'){const id=this.key.split(':')[1];if(!state.repairs.includes(id))state.repairs.push(id);}else if(this.kind==='challenge'){if(!state.challengeDone.includes(this.molecule))state.challengeDone.push(this.molecule);}this.store();this.render();this.showSuccess();renderEditorTabs(this.kind);refresh();}
      arrange(){
        if(this.graph.atoms.length===2)this.graph.atoms.forEach((a,i)=>a.slot=i+1);
        else {const center=[...this.graph.atoms].sort((a,b)=>countBondElectrons(this.graph,b.id)-countBondElectrons(this.graph,a.id))[0];if(center){center.slot=0;let slot=1;this.graph.atoms.filter(a=>a!==center).forEach(a=>a.slot=slot++);}}
        // Correctness is orientation-independent; after checking, keep free pairs away from bonds.
        for(const atom of this.graph.atoms){
          const here=slots[atom.slot],neighbors=this.graph.bonds.filter(b=>b.from===atom.id||b.to===atom.id).map(b=>this.atom(b.from===atom.id?b.to:b.from));
          const angles=neighbors.map(n=>Math.atan2(slots[n.slot].y-here.y,slots[n.slot].x-here.x)*180/Math.PI);
          const distance=angle=>Math.min(...angles.map(other=>Math.abs(((angle-other+540)%360)-180)));
          const order=[0,1,2,3].sort((a,b)=>distance([-90,0,90,180][b])-distance([-90,0,90,180][a]));
          const pairs=atom.free.filter(n=>n===2).length;atom.free=[0,0,0,0];for(let i=0;i<pairs;i++)atom.free[order[i]]=2;
        }
      }
      showSuccess(){this.showResult(validateLewisStructure(this.graph,this.molecule).message,true);{const tasks=tasksFor(this.kind);$('#lewis-'+this.kind+'-next').hidden=(state.indices[this.kind]||0)===tasks.length-1;}}
      runOctetScanner(onComplete){
        if(!this.graph.atoms.length){this.feedback('Setze zuerst Atome in den Arbeitsbereich.');return;}
        const token=++this.scanVersion,output=this.host.querySelector('.octet-results'),button=this.host.querySelector('.run-scanner');output.innerHTML='<p class="scanner-running">Der Scanner überprüft jetzt jedes Atom …</p>';button.disabled=true;
        const atoms=[...this.graph.atoms].sort((a,b)=>slots[a.slot].y-slots[b.slot].y||slots[a.slot].x-slots[b.slot].x);let index=0;
        const step=()=>{if(this.disposed||this.scanVersion!==token)return;if(index===atoms.length){this.highlight=null;this.render();button.disabled=false;output.querySelector('.scanner-running')?.remove();const result=validateLewisStructure(this.graph,this.molecule);const summary=document.createElement('p');summary.className='scanner-summary '+(result.ok?'octet-valid':'octet-invalid');summary.textContent=result.ok?'✓ RICHTIG! Deine Lewis-Struktur stimmt. Klicke jetzt auf „'+(this.kind==='repair'?'Reparatur prüfen':'Lewis-Struktur prüfen')+'“, um die Aufgabe abzuschließen.':'✗ NOCH NICHT RICHTIG. '+result.message+' Verbessere deine Zeichnung und starte den Scanner erneut.';output.prepend(summary);if(onComplete)onComplete();return;}const atom=atoms[index++],data=lewisAtoms[atom.symbol],bond=countBondElectrons(this.graph,atom.id),free=sum(atom.free),total=bond+free,valid=total===data.targetElectrons;this.highlight=atom.id;this.render();const row=document.createElement('div');row.className='octet-count '+(valid?'octet-valid':'octet-invalid');row.innerHTML=`<strong>${data.name} (${slotNames[atom.slot]})</strong><div class="scanner-electron-tally" aria-label="${bond} Bindungselektronen und ${free} freie Elektronen">${Array.from({length:bond},()=>'<i class="count-dot bonded" aria-hidden="true"></i>').join('')}${Array.from({length:free},()=>'<i class="count-dot free" aria-hidden="true"></i>').join('')}</div><span>Bindungen: ${bond} Elektronen + freie Elektronen: ${free}</span><b>Gesamt: ${total} / ${data.targetElectrons}</b><span>${valid?'✓ RICHTIG: '+(atom.symbol==='H'?'Erste Schale':'Außenschale')+' vollständig':total<data.targetElectrons?'✗ NOCH NICHT RICHTIG: Es fehlen '+(data.targetElectrons-total)+' Elektronen.':'✗ NOCH NICHT RICHTIG: Es sind '+(total-data.targetElectrons)+' Elektronen zu viel.'}</span>`;output.appendChild(row);later(step,650);};step();
      }
    }

    function tasksFor(kind){return kind==='build'?buildTasks:kind==='repair'?repairTasks.map(t=>t.id):state.challengeIds;}
    function completedFor(kind){return kind==='build'?state.built:kind==='repair'?state.repairs:state.challengeDone;}
    function renderEditorTabs(kind){const tasks=tasksFor(kind),done=completedFor(kind),index=state.indices[kind]||0;$('#lewis-'+kind+'-tabs').innerHTML=tasks.map((id,i)=>`<button type="button" data-task="${i}" ${i>0&&!done.includes(tasks[i-1])?'disabled':''} ${kind!=='repair'&&i===index?'aria-current="step"':''}>${i+1} · ${kind==='repair'?'Fall':lewisMolecules[id].formula}${done.includes(id)?' ✓':''}</button>`).join('');}
    function openEditor(kind,index){const tasks=tasksFor(kind);if(!tasks.length)return;index=Math.max(0,Math.min(tasks.length-1,Number.isInteger(index)?index:0));if(index>0&&!completedFor(kind).includes(tasks[index-1]))index=0;state.indices[kind]=index;const id=tasks[index],repair=kind==='repair'?repairTasks.find(t=>t.id===id):null,molecule=repair?repair.molecule:id;editors[kind]?.dispose();const title=kind==='challenge'?'#lewis-challenge-task-title':'#lewis-'+kind+'-title';$(title).textContent=repair?repair.title:`Stelle ${lewisMolecules[molecule].formula} in der Lewis-Schreibweise dar.`;$('#lewis-'+kind+'-formula').textContent=lewisMolecules[molecule].formula;$('#lewis-'+kind+'-next').hidden=true;editors[kind]=new LewisEditor($('#lewis-'+kind+'-editor'),kind,molecule,kind+':'+id,repair?.initial||emptyGraph());renderEditorTabs(kind);}
    ['build','repair','challenge'].forEach(kind=>{$('#lewis-'+kind+'-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-task]');if(b&&!b.disabled){openEditor(kind,Number(b.dataset.task));persist();}});$('#lewis-'+kind+'-next').addEventListener('click',()=>{if(editors[kind]?.solved){openEditor(kind,(state.indices[kind]||0)+1);persist();}});});
    openEditor('build',state.indices.build);openEditor('repair',state.indices.repair);
    $('#lewis-build-continue').addEventListener('click',()=>{if(!allBuilt())return;state.builderContinued=true;persist();refresh();$('#lewis-pattern').scrollIntoView?.({behavior:'smooth',block:'start'});});
    if(Object.keys(state.pattern).length)state.builderContinued=true;

    let patternSelected=null;const patternAtoms=shuffle(Object.keys(lewisAtoms));let patternValues=shuffle([1,1,2,3,4]);for(let i=0;i<40&&patternValues.some((v,j)=>v===lewisAtoms[patternAtoms[j]].typicalBonds);i++)patternValues=shuffle(patternValues);if(patternValues.some((v,j)=>v===lewisAtoms[patternAtoms[j]].typicalBonds))patternValues=patternAtoms.map(s=>({H:2,Cl:3,O:4,N:1,C:1})[s]);
    function renderPattern(){$('#lewis-pattern-atoms').innerHTML=patternAtoms.map(s=>`<button type="button" data-pattern-atom="${s}" aria-pressed="${patternSelected===s}" ${state.pattern[s]?'disabled':''}><strong>${s}</strong><span>${lewisAtoms[s].valenceElectrons} Außenelektron${s==='H'?'':'en'}</span>${state.pattern[s]?'✓':''}</button>`).join('');const used={};Object.values(state.pattern).forEach(n=>used[n]=(used[n]||0)+1);$('#lewis-pattern-targets').innerHTML=patternValues.map(value=>{const taken=(used[value]||0)>0;if(taken)used[value]--;return `<button type="button" data-pattern-value="${value}" ${taken?'disabled':''}>meistens <strong>${value} ${value===1?'Bindung':'Bindungen'}</strong>${taken?' ✓':''}</button>`;}).join('');}
    $('#lewis-pattern-atoms').addEventListener('click',e=>{const b=e.target.closest('[data-pattern-atom]');if(b&&!b.disabled){patternSelected=b.dataset.patternAtom;renderPattern();tell($('#lewis-pattern-feedback'),'Atom ausgewählt. Tippe die passende Bindungszahl an.');}});
    $('#lewis-pattern-targets').addEventListener('click',e=>{const b=e.target.closest('[data-pattern-value]');if(!b||b.disabled)return;if(!patternSelected){tell($('#lewis-pattern-feedback'),'Wähle zuerst eine Atomkarte.');return;}const value=Number(b.dataset.patternValue);if(value!==lewisAtoms[patternSelected].typicalBonds){tell($('#lewis-pattern-feedback'),'Wie viele Elektronen fehlen diesem Atom zur vollen Außenschale?');return;}state.pattern[patternSelected]=value;patternSelected=null;tell($('#lewis-pattern-feedback'),'✓ Diese Bindungszahl passt zu unseren Beispielen.',true);persist();renderPattern();refresh();});renderPattern();
    function startChallenge(){if(!allPattern()||!allRepairs())return;if(state.challengeIds.length!==3||new Set(state.challengeIds).size!==3||state.challengeIds.some(k=>!challengeTasks.includes(k))){state.challengeIds=shuffle(challengeTasks);state.challengeDone=[];state.indices.challenge=0;persist();}openEditor('challenge',state.indices.challenge);}
    $('#lewis-new-challenge').addEventListener('click',()=>{const previous=state.challengeIds.join(',');let next=shuffle(challengeTasks);if(next.join(',')===previous)next=[...next.slice(1),next[0]];state.challengeIds=next;state.challengeDone=[];state.indices.challenge=0;for(const key of Object.keys(state.drafts))if(key.startsWith('challenge:'))delete state.drafts[key];for(const key of Object.keys(state.attempts))if(key.startsWith('challenge:'))delete state.attempts[key];persist();openEditor('challenge',0);refresh();$('#lewis-challenge').scrollIntoView?.({behavior:'smooth',block:'start'});});
    $('#lewis-reset').addEventListener('click',()=>{active=false;Object.values(editors).forEach(editor=>editor.dispose());try{const progress=BindungenProgress.loadProgress();delete progress.lewisLearning;BindungenProgress.saveProgress(progress);location.reload();}catch{active=true;tell($('#lewis-reset-feedback'),'Die Lewis-Aufgaben konnten nicht zurückgesetzt werden. Erlaube das Speichern von Websitedaten.');}});
    persist();refresh();
  }
  document.addEventListener('DOMContentLoaded',initLewisLearning);
})();
