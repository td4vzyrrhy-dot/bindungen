/* ==========================================
   EIGENSCHAFTEN VON SALZEN
   ========================================== */
document.addEventListener('DOMContentLoaded',()=>{
  const root=document.querySelector('#salt-properties');if(!root)return;
  const savedSaltProgress=BindungenProgress.loadProgress();
  if(savedSaltProgress.salzOnlineTestBestanden)document.querySelector('#salt-teacher-check')?.removeAttribute('hidden');
  const savedSaltState=savedSaltProgress.modules?.salze?.learningState||{};
  const experimentsReviewed=Boolean(savedSaltProgress.salzVersucheAusgewertet&&savedSaltProgress.salzVersucheVersion===2);
  const state={crystal:experimentsReviewed,solubility:experimentsReviewed,conductivity:experimentsReviewed,reason:experimentsReviewed,brittle:experimentsReviewed,matches:new Set(),selectedProperty:null,checkIndex:0,finalTestIndex:0,...savedSaltState};
  state.matches=new Set(Array.isArray(savedSaltState.matches)?savedSaltState.matches:[]);
  function persistSaltState(){const progress=BindungenProgress.loadProgress();progress.modules.salze=progress.modules.salze||{};progress.modules.salze.learningState={crystal:state.crystal,solubility:state.solubility,conductivity:state.conductivity,reason:state.reason,brittle:state.brittle,matches:[...state.matches],checkIndex:state.checkIndex,finalTestIndex:state.finalTestIndex};BindungenProgress.saveProgress(progress)}
  if(savedSaltProgress.modules?.salze?.tasks?.experiments?.completed)console.log('[Progress Restore] Aufgabe wiederhergestellt: salze/experiments');
  const mini=[
    {q:'Warum besitzen Salze oft regelmäßige Kristallformen?',a:'regular',o:[['regular','wegen der regelmäßigen Anordnung der Ionen'],['round','weil alle Ionen kugelförmig sind'],['water','wegen des Wassers']]},
    {q:'Kann festes Kochsalz Strom leiten?',a:'no',o:[['yes','ja'],['no','nein'],['always','nur bei hoher Spannung']]},
    {q:'Warum leitet Kochsalzlösung Strom?',a:'mobile',o:[['mobile','weil sich Ionen bewegen können'],['new','weil Wasser Elektronen erzeugt'],['neutral','weil die Ionen neutral werden']]},
    {q:'Warum ist ein Salzkristall spröde?',a:'repel',o:[['soft','weil er aus weichen Teilchen besteht'],['repel','weil gleichnamige Ionen nebeneinander geraten und sich abstoßen'],['vanish','weil Ionen bei Belastung verschwinden']]},
    {q:'Welche Struktur bestimmt viele Eigenschaften eines Salzes?',a:'lattice',o:[['molecule','ein einzelnes Teilchenpaar'],['lattice','das Ionengitter'],['shell','die Elektronenschale']]}
  ];
  const finalTest=[
    {q:'Warum besitzen Salze häufig regelmäßige, kantige Kristallformen?',a:'lattice',o:[['lattice','Die Ionen sind regelmäßig im Ionengitter angeordnet.'],['round','Alle Ionen sind kugelförmig.'],['water','Im Kristall befindet sich Wasser.']]},
    {q:'Was geschieht im Ionengitter, wenn ein Salzkristall durch eine Kraft zerbricht?',a:'repel',o:[['melt','Die Ionen schmelzen sofort.'],['repel','Gleichnamig geladene Ionen geraten nebeneinander und stoßen sich ab.'],['neutral','Alle Ionen werden neutral.']]},
    {q:'Warum leitet festes Salz keinen elektrischen Strom?',a:'fixed',o:[['none','Salz enthält keine geladenen Teilchen.'],['fixed','Die Ionen sind an feste Plätze im Gitter gebunden.'],['cold','Festes Salz ist zu kalt.']]},
    {q:'Warum kann eine Salzlösung elektrischen Strom leiten?',a:'mobile',o:[['electrons','Das Wasser erzeugt neue Elektronen.'],['mobile','Die gelösten Ionen sind frei beweglich und transportieren Ladung.'],['crystals','In der Lösung wachsen Kristalle.']]},
    {q:'Welche Aussage beschreibt die Sprödigkeit eines Salzes richtig?',a:'breaks',o:[['bends','Ein Salzkristall lässt sich dauerhaft biegen.'],['breaks','Ein Salzkristall bricht bei ausreichend großer Belastung.'],['soft','Ein Salzkristall ist weich.']]},
    {q:'Welche drei Eigenschaften wurden untersucht?',a:'three',o:[['three','Kristallform, Sprödigkeit und elektrische Leitfähigkeit'],['other','Farbe, Geruch und Siedetemperatur'],['metal','Glanz, Magnetismus und Verformbarkeit']]}
  ];
  let finalTestIndex=Number(state.finalTestIndex)||0;
  const showFeedback=(id,text,correct=false)=>{const el=document.querySelector(id);el.className='salt-feedback show '+(correct?'correct':'wrong');el.textContent=text};
  const reveal=id=>{const el=document.querySelector(id);el.hidden=false;el.scrollIntoView({behavior:'smooth',block:'center'})};
  const observationFields=[
    ['#crystal-station','crystal','Beschreibe Form und Aussehen der Salzkristalle mit eigenen Worten.'],
    ['#solubility-station','solubility','Beschreibe, was du nach dem Einrühren des Salzes beobachtest.'],
    ['#conductivity-station','conductivity','Halte fest, bei welchen Stoffproben die Anzeige reagiert oder ausbleibt.'],
    ['#brittleness-station','brittleness','Beschreibe, wie sich Form und Größe der Salzkristalle durch den Druck verändern. Werden sie flach oder entstehen kleinere Bruchstücke?']
  ];
  function addObservationFields(){
    observationFields.forEach(([stationId,name,prompt])=>{
      const station=document.querySelector(stationId),card=station?.querySelector('.experiment-card');
      if(!card)return;
      const label=document.createElement('label');
      label.className='experiment-observation';
      label.innerHTML='<strong>Deine Beobachtung</strong><span>'+prompt+'</span><textarea data-experiment-note="'+name+'" rows="4" placeholder="Ich beobachte …"></textarea>';
      card.insertAdjacentElement('afterend',label);
      label.querySelector('textarea').value=savedSaltProgress.salzVersuchsbeobachtungen?.[name]||'';
    });
    ['#crystal-station','#solubility-station'].forEach(stationId=>{
      const question=document.querySelector(stationId+' .observation-question');
      question?.querySelector('h3')?.remove();
      question?.querySelector('.stack-options')?.remove();
      question?.querySelector('.salt-feedback')?.remove();
    });
    document.querySelector('#conductivity-station .conductivity-table')?.remove();
    document.querySelector('#conductivity-feedback')?.remove();
    const resultAction=document.createElement('div');
    resultAction.className='experiment-result-action';
    resultAction.innerHTML='<p id="experiment-result-status">Trage zuerst deine Beobachtungen zu allen vier Versuchen ein.</p><button class="btn btn-primary" id="show-experiment-results" type="button" disabled>Ergebnisse und Erklärungen anzeigen</button>';
    document.querySelector('#brittleness-station').insertAdjacentElement('afterend',resultAction);
    document.querySelectorAll('[data-experiment-note]').forEach(field=>field.addEventListener('input',checkObservationFields));
    document.querySelector('#show-experiment-results').addEventListener('click',showExperimentResults);
  }
  function checkObservationFields(){
    const fields=[...document.querySelectorAll('[data-experiment-note]')],complete=fields.length===observationFields.length&&fields.every(field=>field.value.trim().length>0);
    fields.forEach(field=>field.closest('.experiment-observation').classList.toggle('completed',field.value.trim().length>0));
    state.crystal=Boolean(document.querySelector('[data-experiment-note="crystal"]')?.value.trim());
    state.solubility=Boolean(document.querySelector('[data-experiment-note="solubility"]')?.value.trim());
    state.conductivity=Boolean(document.querySelector('[data-experiment-note="conductivity"]')?.value.trim());
    checkResearchComplete();
    const button=document.querySelector('#show-experiment-results'),status=document.querySelector('#experiment-result-status');
    button.disabled=!complete;
    status.textContent=complete?'Alle Beobachtungen sind eingetragen. Du kannst jetzt vergleichen.':'Trage zuerst deine Beobachtungen zu allen vier Versuchen ein.';
  }
  function showExperimentResults(){
    const fields=[...document.querySelectorAll('[data-experiment-note]')];
    if(fields.length!==observationFields.length||fields.some(field=>!field.value.trim()))return;
    const observations=Object.fromEntries(fields.map(field=>[field.dataset.experimentNote,field.value.trim()]));
    const progress=BindungenProgress.loadProgress();
    progress.salzVersucheAusgewertet=true;
    progress.salzVersucheVersion=2;
    progress.salzVersuchsbeobachtungen=observations;
    persistSaltState();
    BindungenProgress.completeTask('salze','experiments');
    BindungenProgress.saveProgress(progress);
    location.href='salze-versuchsauswertung.html';
  }
  function makeLattice(host,count=8){host.innerHTML=Array.from({length:count},(_,i)=>{const sodium=(i+Math.floor(i/4))%2===0;return '<i class="'+(sodium?'sodium':'chloride')+'">'+(sodium?'Na<sup>+</sup>':'Cl<sup>−</sup>')+'</i>'}).join('')}
  document.querySelectorAll('[data-small-lattice],[data-simulation-lattice],[data-brittle-row]').forEach((host,index)=>makeLattice(host,host.hasAttribute('data-brittle-row')?8:8));
  document.querySelectorAll('[data-crystal]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.crystal!=='correct'){showFeedback('#crystal-feedback','Schau dir die Salzkörner noch einmal genau mit der Lupe an.');return}button.classList.add('correct');state.crystal=true;showFeedback('#crystal-feedback','Richtig. Salze bilden Kristalle mit regelmäßigen Formen.',true);checkResearchComplete()}));
  document.querySelectorAll('[data-solubility]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.solubility!=='correct'){showFeedback('#solubility-feedback','Beobachte, ob die Salzkörner nach dem Rühren noch sichtbar sind.');return}button.classList.add('correct');state.solubility=true;showFeedback('#solubility-feedback','Richtig. Kochsalz ist in Wasser löslich.',true);checkResearchComplete()}));
  document.querySelector('#check-conductivity').addEventListener('click',()=>{const values=Object.fromEntries([...document.querySelectorAll('[data-conductivity]')].map(select=>[select.dataset.conductivity,select.value]));if(values.solid==='off'&&values.water==='off'&&values.solution==='on'){state.conductivity=true;showFeedback('#conductivity-feedback','Spannend: Festes Salz leitet nicht – die Salzlösung schon.',true);checkResearchComplete()}else showFeedback('#conductivity-feedback','Noch nicht. Vergleiche genau, bei welcher Probe die Anzeige reagiert.')});
  document.querySelectorAll('[data-voltage]').forEach(button=>button.addEventListener('click',()=>{const type=button.dataset.voltage;if(type==='solid'){document.querySelector('.fixed-ions').classList.add('voltage-on');document.querySelector('#solid-lamp').textContent='○';document.querySelector('#solid-current').textContent='Die Ionen sind gebunden.'}else{document.querySelector('.moving-ions').classList.add('voltage-on');document.querySelector('#solution-lamp').textContent='●';document.querySelector('#solution-lamp').classList.add('on');document.querySelector('#solution-current').textContent='Die Ionen können sich bewegen.'}}));
  document.querySelectorAll('[data-conductivity-reason]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.conductivityReason!=='correct'){showFeedback('#conductivity-reason-feedback','Noch nicht. Vergleiche die Beweglichkeit der Ionen in beiden Modellen.');return}button.classList.add('correct');state.reason=true;showFeedback('#conductivity-reason-feedback','Genau. Bewegliche Ionen können elektrische Ladung transportieren.',true);checkResearchComplete()}));
  document.querySelector('#apply-force').addEventListener('click',()=>{document.querySelector('#brittleness-simulation').classList.add('shifted');setTimeout(()=>document.querySelector('#brittleness-simulation').classList.add('crystal-break'),800);setTimeout(()=>reveal('#force-explanation'),1200)});
  document.querySelectorAll('[data-brittleness]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.brittleness!=='correct'){showFeedback('#brittleness-feedback','Schau dir an, welche Ladungen nach der Verschiebung nebeneinander liegen.');return}button.classList.add('correct');state.brittle=true;showFeedback('#brittleness-feedback','Richtig. Die Abstoßung gleichnamiger Ladungen kann das Ionengitter spalten.',true);checkResearchComplete()}));
  document.querySelectorAll('[data-property]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-property]').forEach(item=>item.classList.remove('selected'));button.classList.add('selected');state.selectedProperty=button.dataset.property}));
  document.querySelectorAll('[data-property-target]').forEach(button=>button.addEventListener('click',()=>{if(!state.selectedProperty){showFeedback('#matching-feedback','Wähle zuerst links eine Eigenschaft.');return}if(state.selectedProperty!==button.dataset.propertyTarget){showFeedback('#matching-feedback','Noch nicht. Suche die Erklärung auf Teilchenebene.');return}state.matches.add(state.selectedProperty);button.classList.add('matched');document.querySelector('[data-property="'+state.selectedProperty+'"]').classList.add('matched');state.selectedProperty=null;document.querySelectorAll('[data-property]').forEach(item=>item.classList.remove('selected'));showFeedback('#matching-feedback','Richtig zugeordnet.',true);checkResearchComplete()}));
  function checkResearchComplete(){persistSaltState();if(state.crystal&&state.solubility&&state.conductivity&&state.reason&&state.brittle&&state.matches.size===4)reveal('#salt-summary')}
  function showMini(){const item=mini[state.checkIndex];document.querySelector('#salt-check-progress').textContent='Aufgabe '+(state.checkIndex+1)+' von 5';document.querySelector('#salt-check-dots').innerHTML=Array.from({length:5},(_,i)=>'<span class="binding-dot '+(i<state.checkIndex?'done':'')+'">'+(i<state.checkIndex?'●':'○')+'</span>').join('');document.querySelector('#salt-check-question').innerHTML='<h3>'+item.q+'</h3><div class="stack-options">'+item.o.map(option=>'<button data-salt-mini="'+option[0]+'">'+option[1]+'</button>').join('')+'</div>';document.querySelector('#salt-check-feedback').className='salt-feedback';document.querySelectorAll('[data-salt-mini]').forEach(button=>button.addEventListener('click',()=>checkMini(button.dataset.saltMini,button)))}
  function checkMini(answer,button){if(answer!==mini[state.checkIndex].a){showFeedback('#salt-check-feedback','Noch nicht. Denke an den Aufbau und die Beweglichkeit der Ionen.');return}button.classList.add('correct');button.parentElement.querySelectorAll('button').forEach(item=>item.disabled=true);showFeedback('#salt-check-feedback','✓ Richtig!',true);state.checkIndex++;if(state.checkIndex===5)setTimeout(()=>{document.querySelector('#reaction-transition').hidden=false;document.querySelector('#reaction-transition').scrollIntoView({behavior:'smooth',block:'start'})},500);else setTimeout(showMini,450)}
  function showFinalTest(){const item=finalTest[finalTestIndex];document.querySelector('#salt-final-progress').textContent='Aufgabe '+(finalTestIndex+1)+' von '+finalTest.length;document.querySelector('#salt-final-dots').innerHTML=finalTest.map((_,index)=>'<span class="binding-dot '+(index<finalTestIndex?'done':'')+'">'+(index<finalTestIndex?'●':'○')+'</span>').join('');document.querySelector('#salt-final-question').innerHTML='<h3>'+item.q+'</h3><div class="stack-options">'+item.o.map(option=>'<button data-salt-final="'+option[0]+'">'+option[1]+'</button>').join('')+'</div>';document.querySelector('#salt-final-feedback').className='salt-feedback';document.querySelectorAll('[data-salt-final]').forEach(button=>button.addEventListener('click',()=>checkFinalTest(button.dataset.saltFinal,button)))}
  function checkFinalTest(answer,button){if(answer!==finalTest[finalTestIndex].a){button.classList.add('wrong');showFeedback('#salt-final-feedback','Noch nicht richtig. Lies die Erklärungen zu den Eigenschaften noch einmal aufmerksam.');setTimeout(()=>button.classList.remove('wrong'),600);return}button.classList.add('correct');button.parentElement.querySelectorAll('button').forEach(item=>item.disabled=true);showFeedback('#salt-final-feedback','✓ Richtig!',true);finalTestIndex++;state.finalTestIndex=finalTestIndex;persistSaltState();if(finalTestIndex===finalTest.length)setTimeout(()=>{const progress=BindungenProgress.loadProgress();progress.salzOnlineTestBestanden=true;progress.salzAbschlussVersion=2;BindungenProgress.saveProgress(progress);document.querySelector('#salt-teacher-check').hidden=false},500);else setTimeout(showFinalTest,500)}
  function checkSaltTeacherCode(){const input=document.querySelector('#salt-teacher-code'),feedback=document.querySelector('#salt-code-feedback');if(input.value.trim().toUpperCase()==='SALZ'){feedback.className='teacher-code-feedback correct';feedback.textContent='✓ Code richtig. Du kannst mit der Atombindung weiterarbeiten.';BindungenProgress.completeMission(6,'salze');setTimeout(()=>location.href='atombindung.html',500)}else{feedback.className='teacher-code-feedback wrong';feedback.textContent='Der Code stimmt noch nicht. Frage Frau Bachmann nach dem Code.';input.classList.add('wrong');setTimeout(()=>input.classList.remove('wrong'),500);input.focus()}}
  document.querySelector('#start-salt-check').addEventListener('click',()=>{const dialog=document.querySelector('#salt-check-dialog');if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','')});
  document.querySelector('#confirm-salt-note').addEventListener('click',()=>{const dialog=document.querySelector('#salt-check-dialog');if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');document.querySelector('#salt-summary').hidden=true;reveal('#salt-check');showMini()});
  addObservationFields();
  state.matches.forEach(property=>{
    document.querySelector('[data-property="'+property+'"]')?.classList.add('matched');
    document.querySelector('[data-property-target="'+property+'"]')?.classList.add('matched');
  });
  if(state.crystal)document.querySelector('[data-experiment-note="crystal"]')?.closest('.experiment-observation')?.classList.add('completed');
  if(state.solubility)document.querySelector('[data-experiment-note="solubility"]')?.closest('.experiment-observation')?.classList.add('completed');
  if(state.conductivity)document.querySelector('[data-experiment-note="conductivity"]')?.closest('.experiment-observation')?.classList.add('completed');
  if(state.brittle)document.querySelector('[data-experiment-note="brittle"]')?.closest('.experiment-observation')?.classList.add('completed');
  checkObservationFields();

  if(savedSaltProgress.salzZuordnungAbgeschlossen)document.querySelector('#matching-section').hidden=true;
  const saltMiniRequested=new URLSearchParams(location.search).get('mini')==='1';
  const saltPropertiesCompleted=savedSaltProgress.salzZuordnungAbgeschlossen&&savedSaltProgress.salzEigenschaftenVersion===2;
  if(saltMiniRequested&&saltPropertiesCompleted){
    ['#crystal-station','#solubility-station','#conductivity-station','#brittleness-station','#matching-section','.experiment-result-action','#salt-summary'].forEach(selector=>{const element=document.querySelector(selector);if(element)element.hidden=true});
    document.querySelector('#salt-check').hidden=false;
    showMini();
  }
  document.querySelector('#confirm-salt-code').addEventListener('click',checkSaltTeacherCode);
  document.querySelector('#salt-teacher-code').addEventListener('keydown',event=>{if(event.key==='Enter')checkSaltTeacherCode()});
});
