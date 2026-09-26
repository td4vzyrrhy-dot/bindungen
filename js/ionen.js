document.addEventListener('DOMContentLoaded',()=>{
  const root=document.querySelector('#ionic-station');if(!root)return;
  const atoms={Na:{name:'Natrium',shells:[2,8,1],valence:1},Cl:{name:'Chlor',shells:[2,8,7],valence:7},Mg:{name:'Magnesium',shells:[2,8,2],valence:2},O:{name:'Sauerstoff',shells:[2,6],valence:6}};
  const psePeriods=[
    ['H',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,'He'],
    ['Li','Be',null,null,null,null,null,null,null,null,null,null,'B','C','N','O','F','Ne'],
    ['Na','Mg',null,null,null,null,null,null,null,null,null,null,'Al','Si','P','S','Cl','Ar'],
    ['K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr'],
    ['Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe'],
    ['Cs','Ba','57–71','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn'],
    ['Fr','Ra','89–103','Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og']
  ];
  const pseSeries=[['La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu'],['Ac','Th','Pa','U','Np','Pu','Am','Cm','Bk','Cf','Es','Fm','Md','No','Lr']];
  const state={valence:{Na:false,Cl:false},assignment:{given:false,received:false},magnesium:{Mg:false,O:false},electronSelected:false,miniIndex:0};
  const savedIonic=BindungenProgress.loadProgress().modules?.ionenbindung?.learningState||{};
  Object.assign(state,savedIonic);state.valence=Object.assign({Na:false,Cl:false},state.valence);state.assignment=Object.assign({given:false,received:false},state.assignment);state.magnesium=Object.assign({Mg:false,O:false},state.magnesium);
  function persistIonic(){const progress=BindungenProgress.loadProgress();progress.modules.ionenbindung=progress.modules.ionenbindung||{};progress.modules.ionenbindung.learningState={...JSON.parse(JSON.stringify(state)),lattice:lattice.map(row=>[...row]),latticeState:{count:latticeState.count,complete:latticeState.complete,available:[...latticeState.available]}};BindungenProgress.saveProgress(progress)}
  function completeIonicTask(taskId){BindungenProgress.completeTask('ionenbindung',taskId);persistIonic()}
  /* ==========================================
     IONENGITTER – BAUE DEN SALZKRISTALL
     ========================================== */
  const lattice=Array.from({length:4},()=>Array(5).fill(null));
  const latticeState={selected:null,available:new Set(),count:1,mistakes:0,patternPaused:false,patternCell:null,complete:false};
  const miniQuestions=[
    {q:'Was entsteht, wenn ein Atom Elektronen abgibt?',a:'positive',options:[['positive','ein positiv geladenes Ion'],['negative','ein negativ geladenes Ion'],['neutral','ein neutrales Atom']]},
    {q:'Was bedeutet Elektronenabgabe?',a:'loses',options:[['loses','Das Atom verliert Elektronen.'],['gains','Das Atom nimmt Elektronen auf.'],['protons','Das Atom gibt Protonen ab.']]},
    {q:'Was bedeutet Elektronenaufnahme?',a:'gains',options:[['loses','Das Atom verliert Elektronen.'],['gains','Das Atom nimmt Elektronen auf.'],['none','Die Elektronenzahl bleibt gleich.']]},
    {q:'Wie viele Elektronen gibt Natrium ab und wie viele nimmt Chlor auf?',a:'one-each',options:[['one-each','Natrium gibt 1 Elektron ab, Chlor nimmt 1 Elektron auf.'],['two-each','Natrium gibt 2 Elektronen ab, Chlor nimmt 2 Elektronen auf.'],['reversed','Natrium nimmt 1 Elektron auf, Chlor gibt 1 Elektron ab.']]},
    {q:'Wie nennt man ein positiv geladenes Ion?',a:'cation',options:[['anion','Anion'],['cation','Kation'],['lattice','Ionengitter']]},
    {q:'Wie nennt man ein negativ geladenes Ion?',a:'anion',options:[['cation','Kation'],['anion','Anion'],['atom','Atomkern']]},
    {q:'Warum ziehen sich Na⁺ und Cl⁻ an?',a:'opposite',options:[['same','weil sie gleich geladen sind'],['opposite','weil sie entgegengesetzt geladen sind'],['random','weil sie zufällig zusammentreffen']]},
    {q:'Wie nennt man die regelmäßige Anordnung vieler Ionen?',a:'lattice',options:[['molecule','Molekül'],['shell','Elektronenschale'],['lattice','Ionengitter']]}
  ];
  function renderFullPsePosition(host){
    const highlight=host.closest('.ionic-atom-card').querySelector('h3 span').textContent.trim();
    host.innerHTML='';
    psePeriods.forEach((period,row)=>period.forEach((symbol,column)=>{if(!symbol)return;const cell=document.createElement('span');cell.className='mini-pse-cell'+(symbol===highlight?' highlight':'')+(symbol.includes('–')?' placeholder-cell':'');cell.style.setProperty('--mini-col',column+1);cell.style.setProperty('--mini-row',row+1);cell.textContent=symbol;host.appendChild(cell)}));
    pseSeries.forEach((series,index)=>series.forEach((symbol,column)=>{const cell=document.createElement('span');cell.className='mini-pse-cell'+(symbol===highlight?' highlight':'');cell.style.setProperty('--mini-col',column+3);cell.style.setProperty('--mini-row',index+8);cell.textContent=symbol;host.appendChild(cell)}));
    host.setAttribute('aria-label','Vollständiges Periodensystem. '+highlight+' ist hervorgehoben.');
  }
  document.querySelectorAll('.pse-position-map').forEach(renderFullPsePosition);
  function reveal(id){const el=document.querySelector(id);el.hidden=false;el.scrollIntoView({behavior:'smooth',block:'center'})}
  function feedback(id,text,correct=false){const el=document.querySelector(id);el.className='ionic-feedback show '+(correct?'correct':'wrong');el.textContent=text}
  function restoreIonicTasks(progress){
    const tasks=progress?.modules?.ionenbindung?.tasks||{};
    Object.keys(atoms).forEach(symbol=>{if(!tasks['valence-'+symbol]?.completed)return;const group=document.querySelector('[data-valence="'+symbol+'"]');const button=[...(group?.querySelectorAll('button')||[])].find(item=>Number(item.textContent)===atoms[symbol].valence);if(button){button.classList.add('correct');group.querySelectorAll('button').forEach(item=>item.disabled=true);state.valence[symbol]=true;console.log('[Progress Restore] Aufgabe wiederhergestellt: ionenbindung/valence-'+symbol)}});
    if(Object.values(state.valence).every(Boolean))reveal('#noble-section');
    if(state.assignment.given&&state.assignment.received)reveal('#attraction-section');
    if(tasks['electron-transfer']?.completed){document.querySelector('#na-electron')?.classList.add('transferred');document.querySelector('#cl-target')?.classList.add('filled');reveal('#ions-section')}
    if(tasks['attraction']?.completed)reveal('#lattice-section');
    if(tasks['lattice-final']?.completed)reveal('#magnesium-section');
    if(state.magnesium.Mg&&state.magnesium.O)document.querySelector('#magnesium-result').hidden=false;
    if(state.miniIndex>0){document.querySelector('#magnesium-section').hidden=true;reveal('#mini-check-section');showMiniQuestion()}
    if(Array.isArray(savedIonic.lattice)&&savedIonic.lattice.length===4){
      savedIonic.lattice.forEach((row,r)=>row.forEach((ion,c)=>{lattice[r][c]=ion}));
      latticeState.count=Number(savedIonic.latticeState?.count)||lattice.flat().filter(Boolean).length||1;
      latticeState.complete=Boolean(savedIonic.latticeState?.complete);
      latticeState.available=new Set(savedIonic.latticeState?.available||[]);
      renderLatticeGrid();updateCrystalProgress();
    }
  }
  function renderShellModel(host,shells){host.innerHTML='<span class="shell-nucleus">'+host.dataset.shellAtom+'</span>'+shells.map((count,index)=>'<span class="electron-shell" style="--shell:'+(index+1)+'"></span>'+Array.from({length:count},(_,i)=>'<i class="shell-electron '+(index===shells.length-1?'outer':'')+'" style="--shell:'+(index+1)+';--angle:'+(i/count*360)+'deg"></i>').join('')).join('')}
  document.querySelectorAll('[data-shell-atom]').forEach(host=>renderShellModel(host,atoms[host.dataset.shellAtom].shells));
  function renderTransferShell(host){
    const symbol=host.dataset.transferAtom,shells=atoms[symbol].shells;
    let content='<span class="shell-nucleus">'+symbol+'</span>';
    shells.forEach((count,shellIndex)=>{
      content+='<span class="electron-shell" style="--shell:'+(shellIndex+1)+'"></span>';
      for(let index=0;index<count;index++){
        // Reserve eight equally spaced positions on chlorine's outer shell.
        // Offset sodium's movable electron from the electrons on the inner shell.
        const angle=symbol==='Cl'&&shellIndex===2?index*45:
          symbol==='Na'&&shellIndex===2?22.5:index/count*360;
        const style='--shell:'+(shellIndex+1)+';--angle:'+angle+'deg';
        const isMovable=symbol==='Na'&&shellIndex===2&&index===0;
        content+=isMovable?'<button class="shell-electron outer movable-electron" id="na-electron" style="'+style+'" aria-label="Außenelektron von Natrium">e⁻</button>':'<i class="shell-electron '+(shellIndex===shells.length-1?'outer':'')+'" style="'+style+'"></i>';
      }
    });
    if(symbol==='Cl')content+='<button class="shell-electron electron-vacancy" id="cl-target" style="--shell:3;--angle:315deg" aria-label="Freie Position auf der Chlor-Außenschale">+</button>';
    host.innerHTML=content;
  }
  document.querySelectorAll('[data-transfer-atom]').forEach(renderTransferShell);

  document.querySelectorAll('[data-valence] button').forEach(button=>button.addEventListener('click',()=>{
    const symbol=button.parentElement.dataset.valence;
    if(Number(button.textContent)!==atoms[symbol].valence){feedback('#valence-feedback','Schau nur auf die äußerste besetzte Schale.');return}
    state.valence[symbol]=true;button.classList.add('correct');button.parentElement.querySelectorAll('button').forEach(b=>b.disabled=true);BindungenProgress.completeTask('ionenbindung','valence-'+symbol);persistIonic();
    if(Object.values(state.valence).every(Boolean)){feedback('#valence-feedback','Richtig! Natrium besitzt 1 Außenelektron, Chlor besitzt 7 Außenelektronen.',true);reveal('#noble-section')}
  }));
  document.querySelectorAll('[data-giver]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.giver!=='Na'){feedback('#noble-feedback','Schau darauf, welches Atom nur ein einzelnes Außenelektron besitzt.');return}state.assignment.given=true;button.classList.add('correct');document.querySelector('#giver-question').querySelectorAll('button').forEach(b=>b.disabled=true);document.querySelector('#receiver-question').hidden=false;persistIonic();feedback('#noble-feedback','Richtig. Natrium könnte sein einzelnes Außenelektron abgeben.',true)}));
  document.querySelectorAll('[data-receiver]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.receiver!=='Cl'){feedback('#noble-feedback','Welchem Atom fehlt nur noch ein Elektron auf der Außenschale?');return}state.assignment.received=true;button.classList.add('correct');document.querySelector('#receiver-question').querySelectorAll('button').forEach(b=>b.disabled=true);persistIonic();feedback('#noble-feedback','Richtig. Chlor kann dieses Elektron aufnehmen.',true);reveal('#transfer-section')}));

  const electron=document.querySelector('#na-electron'),target=document.querySelector('#cl-target');
  function selectElectron(){state.electronSelected=true;electron.classList.add('selected');persistIonic();feedback('#transfer-feedback','Elektron ausgewählt. Tippe jetzt auf die freie Position bei Chlor.',true)}
  function transferElectron(){if(!state.electronSelected){feedback('#transfer-feedback','Tippe zuerst das Außenelektron bei Natrium an.');return}const from=electron.getBoundingClientRect(),to=target.getBoundingClientRect();const flying=document.createElement('span');flying.className='flying-electron';flying.textContent='e⁻';flying.style.left=from.left+'px';flying.style.top=from.top+'px';document.body.appendChild(flying);electron.classList.add('transferred');target.classList.add('filled');completeIonicTask('electron-transfer');requestAnimationFrame(()=>{flying.style.left=(to.left+to.width/2-from.width/2)+'px';flying.style.top=(to.top+to.height/2-from.height/2)+'px'});setTimeout(()=>{flying.remove()},800);feedback('#transfer-feedback','Natrium gibt ein Elektron ab. Chlor nimmt ein Elektron auf.',true);setTimeout(()=>reveal('#ions-section'),900)}
  electron.addEventListener('click',selectElectron);electron.addEventListener('pointerdown',selectElectron);target.addEventListener('click',transferElectron);

  document.querySelectorAll('[data-assignment]').forEach(button=>button.addEventListener('click',()=>{const row=button.dataset.assignment,correct=row==='given'?'positive':'negative';if(button.dataset.answer!==correct){feedback('#assignment-feedback','Noch nicht. Überlege, wie sich die Anzahl der Elektronen verändert hat.');return}state.assignment[row]=true;button.classList.add('correct');button.parentElement.querySelectorAll('button').forEach(b=>b.disabled=true);completeIonicTask('charge-'+row);if(Object.values(state.assignment).every(Boolean)){feedback('#assignment-feedback','Genau! Elektronen abgeben → positiv. Elektronen aufnehmen → negativ.',true);reveal('#attraction-section')}}));
  document.querySelectorAll('[data-attraction] button').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.answer!=='attract'){feedback('#attraction-feedback','Noch nicht. Denke an entgegengesetzte Ladungen.');return}button.classList.add('correct');button.parentElement.querySelectorAll('button').forEach(b=>b.disabled=true);document.querySelector('#attraction-demo').classList.add('attracted');completeIonicTask('attraction');feedback('#attraction-feedback','Positive und negative Ionen ziehen sich aufgrund ihrer entgegengesetzten Ladungen an. Diese elektrische Anziehung ist die Grundlage der Ionenbindung.',true);setTimeout(()=>{initIonLatticeBuilder();reveal('#lattice-section')},900)}));

  function cellKey(row,column){return row+'-'+column}
  function expectedIon(row,column){return (row+column)%2===0?'Na':'Cl'}
  function getDirectNeighbours(row,column){return [[row-1,column],[row+1,column],[row,column-1],[row,column+1]].filter(([r,c])=>r>=0&&r<4&&c>=0&&c<5).map(([r,c])=>lattice[r][c]).filter(Boolean)}
  function unlockAdjacentCells(row,column){[[row-1,column],[row+1,column],[row,column-1],[row,column+1]].forEach(([r,c])=>{if(r>=0&&r<4&&c>=0&&c<5&&!lattice[r][c])latticeState.available.add(cellKey(r,c))})}
  function updateCrystalProgress(){document.querySelector('#crystal-count').textContent=latticeState.count+' / 20 Ionen';document.querySelector('#crystal-progress-fill').style.width=(latticeState.count/20*100)+'%'}
  function renderLatticeGrid(){
    const grid=document.querySelector('#lattice-grid');grid.innerHTML='';
    lattice.forEach((row,rowIndex)=>row.forEach((ion,columnIndex)=>{const cell=document.createElement('button');const key=cellKey(rowIndex,columnIndex);cell.type='button';cell.dataset.row=rowIndex;cell.dataset.column=columnIndex;cell.className='lattice-cell '+(ion?'placed '+(ion==='Na'?'ion-sodium':'ion-chloride'):latticeState.available.has(key)?'available':'locked');if(latticeState.patternCell===key)cell.classList.add('pattern-target');cell.innerHTML=ion?(ion==='Na'?'Na<sup>+</sup>':'Cl<sup>−</sup>'):'?';cell.disabled=!ion&&!latticeState.available.has(key);cell.addEventListener('click',()=>selectLatticeCell(rowIndex,columnIndex));grid.appendChild(cell)}));
  }
  function initIonLatticeBuilder(){
    lattice.forEach(row=>row.fill(null));lattice[2][2]='Na';Object.assign(latticeState,{selected:null,count:1,mistakes:0,patternPaused:false,patternCell:null,complete:false});latticeState.available=new Set();unlockAdjacentCells(2,2);document.querySelectorAll('[data-ion-choice]').forEach(button=>button.classList.remove('ion-selected'));['#pattern-question','#lattice-zoom','#crystal-reveal','#lattice-final-question','#lattice-summary'].forEach(id=>document.querySelector(id).hidden=true);document.querySelector('#auto-grow-crystal').hidden=true;feedback('#lattice-builder-feedback','Wähle ein Ion und anschließend einen freien Platz.');renderLatticeGrid();updateCrystalProgress();
  }
  function selectIon(type){if(latticeState.patternPaused||latticeState.complete)return;latticeState.selected=type;document.querySelectorAll('[data-ion-choice]').forEach(button=>button.classList.toggle('ion-selected',button.dataset.ionChoice===type));document.querySelector('#picker-instruction').textContent=(type==='Na'?'Na⁺':'Cl⁻')+' ausgewählt. Wo möchtest du es platzieren?'}
  function canPlaceIon(row,column,ionType){const neighbours=getDirectNeighbours(row,column);return neighbours.length>0&&neighbours.every(neighbour=>neighbour!==ionType)}
  function animateRepulsion(cell,ionType){cell.disabled=true;cell.className='lattice-cell placed '+(ionType==='Na'?'ion-sodium':'ion-chloride')+' ion-repel';cell.innerHTML=ionType==='Na'?'Na<sup>+</sup>':'Cl<sup>−</sup>';setTimeout(renderLatticeGrid,650)}
  function animateAttraction(cell){cell.classList.add('ion-correct');setTimeout(()=>cell.classList.remove('ion-correct'),550)}
  function selectLatticeCell(row,column){
    const key=cellKey(row,column);if(latticeState.patternPaused||latticeState.complete||!latticeState.available.has(key)||lattice[row][column])return;if(!latticeState.selected){feedback('#lattice-builder-feedback','Wähle zuerst Na⁺ oder Cl⁻.');return}const cell=document.querySelector('[data-row="'+row+'"][data-column="'+column+'"]');if(!canPlaceIon(row,column,latticeState.selected)){latticeState.mistakes++;animateRepulsion(cell,latticeState.selected);feedback('#lattice-builder-feedback',latticeState.mistakes>1?'Diese beiden Ionen wollen nicht nebeneinander bleiben. Gleichnamige Ladungen stoßen sich ab.':'Diese beiden Ionen wollen nicht nebeneinander bleiben. Überlege: Was passiert zwischen gleichnamigen Ladungen?');return}lattice[row][column]=latticeState.selected;latticeState.available.delete(key);latticeState.count++;completeIonicTask('lattice-'+key);unlockAdjacentCells(row,column);renderLatticeGrid();animateAttraction(document.querySelector('[data-row="'+row+'"][data-column="'+column+'"]'));feedback('#lattice-builder-feedback','Das funktioniert! Entgegengesetzte Ladungen ziehen sich an.',true);updateCrystalProgress();if(latticeState.count===9)showPatternQuestion();else if(latticeState.count===20)completeIonLattice()
  }
  function showPatternQuestion(){latticeState.patternPaused=true;latticeState.patternCell=[...latticeState.available][0];renderLatticeGrid();document.querySelector('#pattern-question').hidden=false;document.querySelector('#pattern-question').scrollIntoView({behavior:'smooth',block:'center'})}
  function checkPatternAnswer(answer){const [row,column]=latticeState.patternCell.split('-').map(Number);if(answer!==expectedIon(row,column)){feedback('#lattice-builder-feedback','Noch nicht. Schau dir dein gebautes Gitter noch einmal an.');return}lattice[row][column]=answer;latticeState.available.delete(latticeState.patternCell);latticeState.count++;completeIonicTask('lattice-pattern');unlockAdjacentCells(row,column);latticeState.patternPaused=false;latticeState.patternCell=null;document.querySelector('#pattern-question').hidden=true;document.querySelector('#auto-grow-crystal').hidden=false;feedback('#lattice-builder-feedback','Genau! Du hast das Muster erkannt.',true);renderLatticeGrid();updateCrystalProgress()}
  function autoGrowCrystal(){document.querySelector('#auto-grow-crystal').hidden=true;latticeState.complete=true;const empty=[];lattice.forEach((row,r)=>row.forEach((ion,c)=>{if(!ion)empty.push([r,c])}));let index=0;const timer=setInterval(()=>{if(index>=empty.length){clearInterval(timer);completeIonLattice();return}const [row,column]=empty[index++];lattice[row][column]=expectedIon(row,column);latticeState.count++;renderLatticeGrid();const cell=document.querySelector('[data-row="'+row+'"][data-column="'+column+'"]');cell.classList.add('ion-correct');updateCrystalProgress()},170)}
  function renderZoomGrid(rows,columns){const grid=document.querySelector('#lattice-zoom-grid');grid.style.setProperty('--zoom-columns',columns);grid.innerHTML=Array.from({length:rows*columns},(_,i)=>{const row=Math.floor(i/columns),column=i%columns,type=expectedIon(row,column);return '<span class="'+(type==='Na'?'ion-sodium':'ion-chloride')+'">'+(type==='Na'?'Na<sup>+</sup>':'Cl<sup>−</sup>')+'</span>'}).join('')}
  function completeIonLattice(){latticeState.complete=true;document.querySelector('.lattice-workspace').classList.add('built');feedback('#lattice-builder-feedback','Schau genau hin …',true);const zoom=document.querySelector('#lattice-zoom');zoom.hidden=false;renderZoomGrid(4,5);setTimeout(()=>renderZoomGrid(6,7),700);setTimeout(()=>renderZoomGrid(8,9),1500);setTimeout(()=>{document.querySelector('#crystal-reveal').hidden=false;document.querySelector('#lattice-final-question').hidden=false;document.querySelector('#crystal-reveal').scrollIntoView({behavior:'smooth',block:'center'})},2400)}
  function checkLatticeFinalQuestion(answer,button){if(answer!=='C'){feedback('#lattice-final-feedback','Schau dir dein gebautes Gitter noch einmal an.');document.querySelector('#lattice-grid').classList.add('review');setTimeout(()=>document.querySelector('#lattice-grid').classList.remove('review'),800);return}button.classList.add('correct');button.parentElement.querySelectorAll('button').forEach(item=>item.disabled=true);completeIonicTask('lattice-final');feedback('#lattice-final-feedback','✓ Richtig! Du hast das Prinzip eines Ionengitters entdeckt.',true);document.querySelector('#lattice-summary').hidden=false;BindungenProgress.completeMission(5,'ionengitter');reveal('#magnesium-section')}
  document.querySelectorAll('[data-ion-choice]').forEach(button=>button.addEventListener('click',()=>selectIon(button.dataset.ionChoice)));
  document.querySelectorAll('[data-pattern-answer]').forEach(button=>button.addEventListener('click',()=>checkPatternAnswer(button.dataset.patternAnswer)));
  document.querySelector('#auto-grow-crystal').addEventListener('click',autoGrowCrystal);
  document.querySelectorAll('[data-lattice-final]').forEach(button=>button.addEventListener('click',()=>checkLatticeFinalQuestion(button.dataset.latticeFinal,button)));
  document.querySelector('#reset-lattice').addEventListener('click',()=>{document.querySelector('.lattice-workspace').classList.remove('built');initIonLatticeBuilder();document.querySelector('#lattice-section').scrollIntoView({behavior:'smooth',block:'start'})});
  document.querySelectorAll('[data-magnesium] button').forEach(button=>button.addEventListener('click',()=>{const symbol=button.parentElement.dataset.magnesium;if(button.textContent.trim()!=='2'){feedback('#magnesium-feedback','Schau auf die Außenschale und darauf, wie viele Elektronen bis zur vollen Schale fehlen.');return}state.magnesium[symbol]=true;button.classList.add('correct');button.parentElement.querySelectorAll('button').forEach(b=>b.disabled=true);completeIonicTask('magnesium-'+symbol);if(Object.values(state.magnesium).every(Boolean)){document.querySelector('#magnesium-result').hidden=false;feedback('#magnesium-feedback','Richtig! Magnesium gibt zwei Elektronen ab, Sauerstoff nimmt zwei Elektronen auf.',true)}}));
  document.querySelectorAll('[data-magnesium-ions]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.magnesiumIons!=='correct'){feedback('#magnesium-ion-feedback','Noch nicht. Elektronenabgabe führt zu einer positiven, Elektronenaufnahme zu einer negativen Ladung.');return}button.classList.add('correct');button.parentElement.querySelectorAll('button').forEach(item=>item.disabled=true);completeIonicTask('magnesium-ions');feedback('#magnesium-ion-feedback','✓ Richtig! Es entstehen Mg²⁺ und O²⁻.',true);document.querySelector('#start-mini-check').hidden=false}));

  function startIonMiniCheck(){document.querySelector('#magnesium-section').hidden=true;reveal('#mini-check-section');showMiniQuestion()}
  function showMiniQuestion(){const item=miniQuestions[state.miniIndex];document.querySelector('#mini-progress').textContent='Aufgabe '+(state.miniIndex+1)+' von '+miniQuestions.length;document.querySelector('#mini-dots').innerHTML=Array.from({length:miniQuestions.length},(_,i)=>'<span class="binding-dot '+(i<state.miniIndex?'done':'')+'">'+(i<state.miniIndex?'●':'○')+'</span>').join('');document.querySelector('#mini-question').innerHTML='<h3>'+item.q+'</h3><div class="stack-options">'+item.options.map(option=>'<button data-mini-answer="'+option[0]+'">'+option[1]+'</button>').join('')+'</div>';document.querySelector('#mini-feedback').className='ionic-feedback';document.querySelectorAll('[data-mini-answer]').forEach(button=>button.addEventListener('click',()=>checkMiniAnswer(button.dataset.miniAnswer,button)))}
  function checkMiniAnswer(answer,button){const item=miniQuestions[state.miniIndex];if(answer!==item.a){feedback('#mini-feedback','Noch nicht. Nutze die Regeln aus den vorherigen Abschnitten.');return}button.classList.add('correct');button.parentElement.querySelectorAll('button').forEach(item=>item.disabled=true);completeIonicTask('mini-'+state.miniIndex);feedback('#mini-feedback','✓ Richtig!',true);state.miniIndex++;persistIonic();if(state.miniIndex===miniQuestions.length){setTimeout(()=>{document.querySelector('#mini-check-section').hidden=true;reveal('#ionic-finish')},450)}else setTimeout(showMiniQuestion,450)}
  document.querySelector('#start-mini-check').addEventListener('click',startIonMiniCheck);
  document.querySelector('#complete-ionic').addEventListener('click',()=>{BindungenProgress.completeMission(4,'ionen');BindungenProgress.completeMission(5,'ionengitter');location.href='salze.html'});
  if(window.BindungenProgressReady)window.BindungenProgressReady.then(restoreIonicTasks);else document.addEventListener('bindungen-progress-ready',event=>restoreIonicTasks(event.detail),{once:true});
});
