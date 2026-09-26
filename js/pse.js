document.addEventListener('DOMContentLoaded',()=>{
  const grid=document.querySelector('#pse-grid');
  const periods=[
    ['H',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,'He'],
    ['Li','Be',null,null,null,null,null,null,null,null,null,null,'B','C','N','O','F','Ne'],
    ['Na','Mg',null,null,null,null,null,null,null,null,null,null,'Al','Si','P','S','Cl','Ar'],
    ['K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr'],
    ['Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe'],
    ['Cs','Ba','La–Lu','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn'],
    ['Fr','Ra','Ac–Lr','Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og']
  ];
  const savedPse=BindungenProgress.loadProgress().modules?.pse||{};
  const patternState=savedPse.patternState||{},locationState=savedPse.locationState||{};
  function savePseState(changes){const progress=BindungenProgress.loadProgress(),module=progress.modules.pse||{};Object.assign(module,changes);progress.modules.pse=module;BindungenProgress.saveProgress(progress)}
  const lanthanides=['La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu'];
  const actinides=['Ac','Th','Pa','U','Np','Pu','Am','Cm','Bk','Cf','Es','Fm','Md','No','Lr'];
  const interactive=new Set(['H','C','N','O','Na','Mg','Al','Si','Cl','Fe','Cu','Ca']);
  const nonmetals=new Set(['H','He','C','N','O','F','Ne','P','S','Cl','Ar','Se','Br','Kr','I','Xe','At','Rn','Ts','Og']);
  const semimetals=new Set(['B','Si','Ge','As','Sb','Te','Po']);
  const typeOf=symbol=>nonmetals.has(symbol)?'nonmetal':semimetals.has(symbol)?'semi':'metal';
  const elementNames={H:'Wasserstoff',He:'Helium',Li:'Lithium',Be:'Beryllium',B:'Bor',C:'Kohlenstoff',N:'Stickstoff',O:'Sauerstoff',F:'Fluor',Ne:'Neon',Na:'Natrium',Mg:'Magnesium',Al:'Aluminium',Si:'Silicium',P:'Phosphor',S:'Schwefel',Cl:'Chlor',Ar:'Argon',K:'Kalium',Ca:'Calcium',Sc:'Scandium',Ti:'Titan',V:'Vanadium',Cr:'Chrom',Mn:'Mangan',Fe:'Eisen',Co:'Cobalt',Ni:'Nickel',Cu:'Kupfer',Zn:'Zink',Ga:'Gallium',Ge:'Germanium',As:'Arsen',Se:'Selen',Br:'Brom',Kr:'Krypton',Rb:'Rubidium',Sr:'Strontium',Y:'Yttrium',Zr:'Zirconium',Nb:'Niob',Mo:'Molybdän',Tc:'Technetium',Ru:'Ruthenium',Rh:'Rhodium',Pd:'Palladium',Ag:'Silber',Cd:'Cadmium',In:'Indium',Sn:'Zinn',Sb:'Antimon',Te:'Tellur',I:'Iod',Xe:'Xenon',Cs:'Caesium',Ba:'Barium',La:'Lanthan',Ce:'Cer',Pr:'Praseodym',Nd:'Neodym',Pm:'Promethium',Sm:'Samarium',Eu:'Europium',Gd:'Gadolinium',Tb:'Terbium',Dy:'Dysprosium',Ho:'Holmium',Er:'Erbium',Tm:'Thulium',Yb:'Ytterbium',Lu:'Lutetium',Hf:'Hafnium',Ta:'Tantal',W:'Wolfram',Re:'Rhenium',Os:'Osmium',Ir:'Iridium',Pt:'Platin',Au:'Gold',Hg:'Quecksilber',Tl:'Thallium',Pb:'Blei',Bi:'Bismut',Po:'Polonium',At:'Astat',Rn:'Radon',Fr:'Francium',Ra:'Radium',Ac:'Actinium',Th:'Thorium',Pa:'Protactinium',U:'Uran',Np:'Neptunium',Pu:'Plutonium',Am:'Americium',Cm:'Curium',Bk:'Berkelium',Cf:'Californium',Es:'Einsteinium',Fm:'Fermium',Md:'Mendelevium',No:'Nobelium',Lr:'Lawrencium',Rf:'Rutherfordium',Db:'Dubnium',Sg:'Seaborgium',Bh:'Bohrium',Hs:'Hassium',Mt:'Meitnerium',Ds:'Darmstadtium',Rg:'Röntgenium',Cn:'Copernicium',Nh:'Nihonium',Fl:'Flerovium',Mc:'Moscovium',Lv:'Livermorium',Ts:'Tenness',Og:'Oganesson'};
  periods.forEach((period,row)=>period.forEach((symbol,column)=>{
    if(!symbol||symbol==='La–Lu'||symbol==='Ac–Lr'||interactive.has(symbol))return;
    const cell=document.createElement('button');
    cell.type='button';cell.className='overview-element periodic-choice';cell.dataset.type=typeOf(symbol);cell.dataset.symbol=symbol;cell.dataset.name=elementNames[symbol];
    cell.style.setProperty('--group',column+1);cell.style.setProperty('--period',row+1);
    cell.innerHTML='<span>'+symbol+'</span><small>'+elementNames[symbol]+'</small>';cell.setAttribute('aria-label',elementNames[symbol]+' ('+symbol+')');grid.appendChild(cell);
  }));
  [lanthanides,actinides].forEach((series,index)=>series.forEach((symbol,column)=>{
    const cell=document.createElement('button');cell.type='button';cell.className='overview-element series-element periodic-choice';
    cell.dataset.type=typeOf(symbol);cell.dataset.symbol=symbol;cell.dataset.name=elementNames[symbol];cell.style.setProperty('--group',column+3);
    cell.style.setProperty('--period',index+8);cell.innerHTML='<span>'+symbol+'</span><small>'+elementNames[symbol]+'</small>';cell.setAttribute('aria-label',elementNames[symbol]+' ('+symbol+')');grid.appendChild(cell);
  }));
  document.querySelectorAll('.discovery-element').forEach(element=>element.classList.add('periodic-choice'));
  const elements=[...document.querySelectorAll('.periodic-choice')];
  if(!elements.length)return;

  const colorKey=document.querySelector('#pse-color-key');
  const popover=document.querySelector('#element-popover');
  const selectedLabel=document.querySelector('#selected-element');
  const feedback=document.querySelector('#feedback');
  const counters={metal:document.querySelector('#metal-counter'),nonmetal:document.querySelector('#nonmetal-counter'),semi:document.querySelector('#semi-counter')};
  const patternTask=document.querySelector('#pattern-task');
  const patternFeedback=document.querySelector('#pattern-feedback');
  const stair=document.querySelector('#pse-stair');
  const hydrogenNote=document.querySelector('#hydrogen-note');
  const takeaway=document.querySelector('#takeaway');
  const notebookDialog=document.querySelector('#notebook-dialog');
  const stationHeading=document.querySelector('.station-heading');
  const locationQuestion=document.querySelector('#location-question');
  const locationProgress=document.querySelector('#location-progress');
  const locationDots=document.querySelector('#location-dots');
  const locationControls=document.querySelector('#location-controls');
  const locationFeedback=document.querySelector('#location-feedback');
  const nextLocationButton=document.querySelector('#next-location');
  const locationFinish=document.querySelector('#location-finish');
  let selectedElement=null;
  const found={metal:0,nonmetal:0,semi:0};
  const targets={metal:8,nonmetal:8,semi:5};
  let locationPool=[];
  let locationIndex=0;
  let locationActive=false;
  const locationElements=[
    {symbol:'Na',category:'metal'},{symbol:'Mg',category:'metal'},{symbol:'Al',category:'metal'},{symbol:'Ca',category:'metal'},{symbol:'Fe',category:'metal'},{symbol:'Cu',category:'metal'},
    {symbol:'B',category:'semi'},{symbol:'Si',category:'semi'},{symbol:'Ge',category:'semi'},
    {symbol:'H',category:'nonmetal',special:true},{symbol:'C',category:'nonmetal'},{symbol:'N',category:'nonmetal'},{symbol:'O',category:'nonmetal'},{symbol:'Cl',category:'nonmetal'}
  ];

  function restorePseTasks(progress){
    const tasks=progress?.modules?.pse?.tasks||{};
    Object.entries(tasks).forEach(([task,data])=>{
      if(!data?.completed)return;
      if(task.startsWith('element-')){
        const symbol=task.slice(8),element=elements.find(item=>item.dataset.symbol===symbol);
        if(!element||element.classList.contains('solved'))return;
        element.classList.add('solved',element.dataset.type);
        found[element.dataset.type]=Math.min(targets[element.dataset.type],found[element.dataset.type]+1);
        counters[element.dataset.type].textContent=found[element.dataset.type];
        console.log('[Progress Restore] Aufgabe wiederhergestellt: pse/'+task);
      }else if(task==='pattern'){
        patternTask.hidden=false;grid.classList.add('fully-revealed');document.querySelectorAll('.periodic-choice').forEach(element=>element.classList.add('map-revealed'));stair.classList.add('show');hydrogenNote.hidden=false;
        patternTask.querySelectorAll('input[type="checkbox"]').forEach(input=>{input.checked=Array.isArray(patternState.checked)&&patternState.checked.includes(input.value)});
        console.log('[Progress Restore] Aufgabe wiederhergestellt: pse/pattern');
      }else if(task.startsWith('location-')){
        console.log('[Progress Restore] Aufgabe wiederhergestellt: pse/'+task);
      }
    });
    if(Array.isArray(locationState.pool)&&locationState.pool.length===8&&locationState.completed!==true&&!locationActive){
      startLocationQuiz(true);
    }
  }

  function showFeedback(host,message,type='notice'){
    host.className='gentle-feedback show '+type;
    host.textContent=message;
  }

  function selectElement(element){
    if(locationActive)return;
    if(grid.classList.contains('fully-revealed')||element.classList.contains('solved'))return;
    elements.forEach(item=>item.classList.remove('selected'));
    element.classList.add('selected');
    selectedElement=element;
    selectedLabel.textContent=element.dataset.name+' ('+element.dataset.symbol+')';
    popover.hidden=false;
    feedback.className='gentle-feedback';
    popover.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  function classifyElement(choice){
    if(!selectedElement)return;
    if(choice===selectedElement.dataset.type){
      selectedElement.classList.add('solved',selectedElement.dataset.type);
      selectedElement.classList.remove('selected');
      found[choice]=Math.min(targets[choice],found[choice]+1);
      counters[choice].textContent=found[choice];
      showFeedback(feedback,'Richtig – du hast '+selectedElement.dataset.name+' eingeordnet.','success');
      const solvedSymbol=selectedElement.dataset.symbol;
      selectedElement=null;
      popover.hidden=true;
      BindungenProgress.completeTask('pse','element-'+solvedSymbol);
      if(Object.keys(targets).every(type=>found[type]>=targets[type])){
        grid.classList.add('fully-revealed');
        elements.forEach(element=>element.classList.add('map-revealed'));
        colorKey.hidden=false;
        patternTask.hidden=false;
        grid.closest('.pse-scroll').scrollIntoView({behavior:'smooth',block:'start'});
      }
    }else{
      const attemptedElement=selectedElement;
      attemptedElement.classList.remove('wrong');
      void attemptedElement.offsetWidth;
      attemptedElement.classList.add('wrong');
      showFeedback(feedback,'Schau noch einmal auf seine Position im Periodensystem.');
      setTimeout(()=>attemptedElement.classList.remove('wrong'),650);
    }
  }

  function checkPattern(){
    const checked=[...patternTask.querySelectorAll('input:checked')].map(input=>input.value);
    const correct=checked.length===2&&checked.includes('metals-left')&&checked.includes('nonmetals-right');
    if(!correct){showFeedback(patternFeedback,'Fast. Betrachte noch einmal, wo sich die bereits eingefärbten Elemente häufen.');return}
    BindungenProgress.completeTask('pse','pattern');
    savePseState({patternState:{checked}});
    showFeedback(patternFeedback,'Genau – du hast das Muster der Elementlandkarte erkannt.','success');
    grid.classList.add('fully-revealed');
    document.querySelectorAll('.periodic-choice').forEach(element=>element.classList.add('map-revealed'));
    stair.classList.add('show');
    hydrogenNote.hidden=false;
    if(typeof notebookDialog.showModal==='function')notebookDialog.showModal();
    else notebookDialog.setAttribute('open','');
  }

  function createQuestionPool(){
    const hydrogen=locationElements.find(element=>element.symbol==='H');
    const others=locationElements.filter(element=>element.symbol!=='H').sort(()=>Math.random()-.5).slice(0,7);
    return [hydrogen,...others].sort(()=>Math.random()-.5);
  }

  function updateLocationProgress(){
    locationProgress.textContent='Aufgabe '+(locationIndex+1)+' von 8';
    locationDots.innerHTML=Array.from({length:8},(_,index)=>'<span class="location-dot '+(index<locationIndex?'done':'')+'">'+(index<locationIndex?'●':'○')+'</span>').join('');
  }

  function highlightElement(symbol){
    elements.forEach(element=>element.classList.remove('element-highlight'));
    const target=elements.find(element=>element.dataset.symbol===symbol);
    if(target)target.classList.add('element-highlight');
  }

  function showNextLocationQuestion(){
    if(locationIndex>=locationPool.length){finishLocationQuiz();return}
    updateLocationProgress();
    highlightElement(locationPool[locationIndex].symbol);
    locationFeedback.className='location-feedback';
    locationFeedback.textContent='';
    nextLocationButton.hidden=true;
    document.querySelectorAll('[data-location-answer]').forEach(button=>{button.disabled=false;button.classList.remove('correct','wrong')});
  }

  function showLocationFeedback(correct,message){
    locationFeedback.className='location-feedback show '+(correct?'feedback-correct':'feedback-wrong');
    locationFeedback.innerHTML=message;
  }

  function explanationFor(element){
    const special={Na:'Natrium liegt links im Periodensystem und gehört zu den Metallen.',Fe:'Eisen liegt im großen Metallbereich in der Mitte des Periodensystems.',Si:'Silicium liegt an der Grenze zwischen Metall- und Nichtmetallbereich und gehört zu den Halbmetallen.',O:'Sauerstoff liegt rechts oben und gehört zu den Nichtmetallen.'};
    if(element.symbol==='H')return '<strong>Sonderfall erkannt!</strong><br>Wasserstoff steht links im Periodensystem, gehört aber trotzdem zu den Nichtmetallen.';
    if(special[element.symbol])return special[element.symbol];
    if(element.category==='metal')return elementNames[element.symbol]+' liegt im Metallbereich links oder in der Mitte des Periodensystems.';
    if(element.category==='semi')return elementNames[element.symbol]+' liegt im Grenzbereich und gehört zu den Halbmetallen.';
    return elementNames[element.symbol]+' liegt im Nichtmetallbereich des Periodensystems.';
  }

  function checkElementCategory(answer,button){
    const current=locationPool[locationIndex];
    if(answer===current.category){
      BindungenProgress.completeTask('pse','location-'+current.symbol);
      savePseState({locationState:{pool:locationPool.map(item=>item.symbol),index:locationIndex+1,completed:false}});
      button.classList.add('correct');
      document.querySelectorAll('[data-location-answer]').forEach(item=>item.disabled=true);
      locationDots.innerHTML=Array.from({length:8},(_,index)=>'<span class="location-dot '+(index<=locationIndex?'done':'')+'">'+(index<=locationIndex?'●':'○')+'</span>').join('');
      showLocationFeedback(true,'<strong>✓ Richtig!</strong><br>'+explanationFor(current));
      nextLocationButton.hidden=false;
    }else{
      button.classList.remove('wrong');void button.offsetWidth;button.classList.add('wrong');
      const hints={metal:'Schau auf den großen Bereich links und in der Mitte des PSE.',nonmetal:'Schau besonders auf den Bereich rechts oben.',semi:'Achte auf den Grenzbereich zwischen Metallen und Nichtmetallen.'};
      const hint=current.symbol==='H'?'Achtung: Nicht nur die Position entscheidet. Wasserstoff ist eine Ausnahme.':hints[current.category];
      showLocationFeedback(false,'<strong>Noch nicht.</strong><br>'+hint);
      setTimeout(()=>button.classList.remove('wrong'),550);
    }
  }

  function startLocationQuiz(restoring=false){
    const savedPool=Array.isArray(locationState.pool)?locationState.pool.map(symbol=>locationElements.find(item=>item.symbol===symbol)).filter(Boolean):[];
    locationPool=savedPool.length===8&&locationState.completed!==true?savedPool:createQuestionPool();locationIndex=savedPool.length===8&&locationState.completed!==true?Math.min(Number(locationState.index)||0,7):0;locationActive=true;
    if(!restoring)savePseState({locationState:{pool:locationPool.map(item=>item.symbol),index:locationIndex,completed:false}});
    takeaway.hidden=true;patternTask.hidden=true;hydrogenNote.hidden=true;colorKey.hidden=true;
    stationHeading.hidden=true;popover.hidden=true;feedback.className='gentle-feedback';
    locationQuestion.hidden=false;locationControls.hidden=false;
    grid.classList.remove('fully-revealed');grid.classList.add('location-mode');
    stair.classList.remove('show');
    showNextLocationQuestion();
    document.querySelector('.discovery-card').scrollIntoView({behavior:'smooth',block:'start'});
  }

  function finishLocationQuiz(){
    locationActive=false;locationQuestion.hidden=true;locationControls.hidden=true;
    elements.forEach(element=>element.classList.remove('element-highlight'));
    grid.classList.remove('location-mode');grid.classList.add('fully-revealed');
    elements.forEach(element=>element.classList.add('map-revealed'));
    stair.classList.add('show');colorKey.hidden=false;locationFinish.hidden=false;
    locationFinish.scrollIntoView({behavior:'smooth',block:'center'});
  }

  elements.forEach(element=>element.addEventListener('click',()=>selectElement(element)));
  document.querySelectorAll('[data-choice]').forEach(button=>button.addEventListener('click',()=>classifyElement(button.dataset.choice)));
  document.querySelector('#check-pattern').addEventListener('click',checkPattern);
  document.querySelector('#close-notebook').addEventListener('click',()=>{
    if(typeof notebookDialog.close==='function')notebookDialog.close();
    else notebookDialog.removeAttribute('open');
    takeaway.hidden=false;
    takeaway.scrollIntoView({behavior:'smooth',block:'center'});
  });
  document.querySelector('#finish').addEventListener('click',startLocationQuiz);
  document.querySelectorAll('[data-location-answer]').forEach(button=>button.addEventListener('click',()=>checkElementCategory(button.dataset.locationAnswer,button)));
  nextLocationButton.addEventListener('click',()=>{locationIndex++;savePseState({locationState:{pool:locationPool.map(item=>item.symbol),index:locationIndex,completed:false}});showNextLocationQuestion()});
  document.querySelector('#complete-location').addEventListener('click',()=>{
    BindungenProgress.completeMission(1,'pse');
    savePseState({locationState:{pool:locationPool.map(item=>item.symbol),index:locationPool.length,completed:true}});
    location.href='bindungscode.html';
  });
  if(window.BindungenProgressReady)window.BindungenProgressReady.then(restorePseTasks);
  else document.addEventListener('bindungen-progress-ready',event=>restorePseTasks(event.detail),{once:true});
});
