document.addEventListener('DOMContentLoaded',()=>{
  const TEACHER_CHECK_CODE='BINDUNG'; // Hier kann Frau Bachmann den Code leicht ändern.
  const names={Na:'Natrium',Cl:'Chlor',H:'Wasserstoff',Cu:'Kupfer',Mg:'Magnesium',O:'Sauerstoff',Ca:'Calcium',F:'Fluor',Al:'Aluminium',C:'Kohlenstoff',N:'Stickstoff',Fe:'Eisen'};
  const labels={metal:'Metall',nonmetal:'Nichtmetall',ionic:'Ionenbindung',covalent:'Atombindung',metallic:'Metallbindung'};
  const bindingInfo={
    ionic:'Diese Bindungsart ist typischerweise zwischen einem Metall und einem Nichtmetall zu erwarten. Wie sie entsteht, untersuchst du in einem späteren Lernabschnitt.',
    covalent:'Diese Bindungsart ist typischerweise zwischen zwei Nichtmetallen zu erwarten. Ihr genauer Aufbau wird später untersucht.',
    metallic:'Diese Bindungsart ist zwischen Metallatomen zu erwarten. Später erfährst du, wie sie mit den Eigenschaften von Metallen zusammenhängt.'
  };
  const examples=[
    {elements:['Na','Cl'],types:['metal','nonmetal'],binding:'ionic',text:'Zwischen einem Metall und einem Nichtmetall entsteht in diesem Modell eine Ionenbindung.',note:'Wie diese Bindung entsteht, untersuchst du später.'},
    {elements:['H','Cl'],types:['nonmetal','nonmetal'],binding:'covalent',text:'Zwischen zwei Nichtmetallen entsteht eine Atombindung.'},
    {elements:['Cu','Cu'],types:['metal','metal'],binding:'metallic',text:'Zwischen Metallatomen entsteht eine Metallbindung.'}
  ];
  const bindingQuestions=[
    {elements:['Na','Cl'],types:['metal','nonmetal'],binding:'ionic'},{elements:['Mg','O'],types:['metal','nonmetal'],binding:'ionic'},{elements:['Ca','F'],types:['metal','nonmetal'],binding:'ionic'},{elements:['Al','O'],types:['metal','nonmetal'],binding:'ionic'},
    {elements:['H','Cl'],types:['nonmetal','nonmetal'],binding:'covalent'},{elements:['C','O'],types:['nonmetal','nonmetal'],binding:'covalent'},{elements:['N','H'],types:['nonmetal','nonmetal'],binding:'covalent'},{elements:['O','O'],types:['nonmetal','nonmetal'],binding:'covalent'},{elements:['C','H'],types:['nonmetal','nonmetal'],binding:'covalent'},
    {elements:['Cu','Cu'],types:['metal','metal'],binding:'metallic'},{elements:['Fe','Fe'],types:['metal','metal'],binding:'metallic'},{elements:['Al','Al'],types:['metal','metal'],binding:'metallic'},{elements:['Mg','Mg'],types:['metal','metal'],binding:'metallic'}
  ];
  const discoveryPart=document.querySelector('#discovery-part'),rulesPart=document.querySelector('#rules-part'),quizPart=document.querySelector('#quiz-part'),finishPart=document.querySelector('#binding-finish');
  const exampleStage=document.querySelector('#example-stage'),nextExample=document.querySelector('#next-example');
  let exampleIndex=0,selectedToken=null,solvedRules=0,quizPool=[],questionIndex=0,correctTypes=[false,false];
  const savedBinding=BindungenProgress.loadProgress().modules?.bindungscode||{},quizState=savedBinding.quizState||{};
  function saveQuizState(changes){const progress=BindungenProgress.loadProgress(),module=progress.modules.bindungscode||{};module.quizState=Object.assign({},module.quizState||{},changes);progress.modules.bindungscode=module;BindungenProgress.saveProgress(progress)}

  function combination(types){return types.map(type=>labels[type].toUpperCase()).join(' + ')}
  function restoreBindingTasks(progress){
    const currentProgress=progress||window.BindungenProgress.getProgress();
    const tasks=currentProgress?.modules?.bindungscode?.tasks||{};
    console.log('[Bindungscode Restore DEBUG] Progress:',window.BindungenProgress.getProgress());
    console.log('[Bindungscode Restore DEBUG] Tasks:',tasks);
    Object.entries(tasks).forEach(([task,data])=>{
      if(!data?.completed)return;
      if(task.startsWith('rule-')){
        discoveryPart.hidden=true;
        rulesPart.hidden=false;
        const binding=task.slice(5),slot=document.querySelector('.rule-slot[data-rule="'+binding+'"]');
        if(slot&&!slot.classList.contains('solved')){slot.classList.add('solved',binding);const label=slot.querySelector('em');if(label)label.textContent=labels[binding]+' ✓';const token=document.querySelector('[data-binding="'+binding+'"]');if(token)token.disabled=true;solvedRules++;console.log('[Progress Restore] Aufgabe wiederhergestellt: bindungscode/'+task)}
      }
    });
    if(solvedRules===3)document.querySelector('#decoded-card').hidden=false;
  }
  function elementCard(symbol,type,index,interactive=false){return '<article class="atom-card '+type+'"><div class="atom-symbol">'+symbol+'</div><strong>'+names[symbol]+'</strong>'+(interactive?'<div class="type-buttons"><button data-type-index="'+index+'" data-type-answer="metal">Metall</button><button data-type-index="'+index+'" data-type-answer="nonmetal">Nichtmetall</button></div>':'<span>'+labels[type]+'</span>')+'</article>'}

  function showDiscoveryExample(){
    const item=examples[exampleIndex];
    document.querySelector('#example-progress').textContent='Beispiel '+(exampleIndex+1)+' von 3';
    exampleStage.innerHTML='<div class="atom-pair">'+elementCard(item.elements[0],item.types[0],0)+'<span class="pair-plus">+</span>'+elementCard(item.elements[1],item.types[1],1)+'</div><div class="example-result"><strong>'+combination(item.types)+'</strong><span class="result-arrow">→</span><button class="example-binding-info '+item.binding+'" data-binding-info="'+item.binding+'">'+labels[item.binding].toUpperCase()+' ⓘ</button><p>'+item.text+'</p>'+(item.note?'<small>'+item.note+'</small>':'')+'</div>';
    nextExample.textContent=exampleIndex===2?'Muster erkannt?':'Nächstes Beispiel';
  }

  function checkBindingRule(binding,slot){
    const feedback=document.querySelector('#rule-feedback');
    console.log('[Bindungscode DEBUG] Regelprüfung:',{binding,rule:slot?.dataset?.rule,slot});
    if(!binding)return;
    if(binding!==slot.dataset.rule){feedback.className='binding-feedback show wrong';feedback.textContent='Noch nicht. Schau dir die drei Beispiele noch einmal an.';slot.classList.add('wrong');setTimeout(()=>slot.classList.remove('wrong'),500);return}
    if(slot.classList.contains('solved'))return;
    slot.classList.add('solved',binding);slot.querySelector('em').textContent=labels[binding]+' ✓';
    console.log('[Bindungscode DEBUG] Erfolgreicher Pfad rule-'+binding+' erreicht');
    BindungenProgress.completeTask('bindungscode','rule-'+binding);
    const token=document.querySelector('[data-binding="'+binding+'"]');token.disabled=true;token.classList.remove('selected');selectedToken=null;solvedRules++;
    feedback.className='binding-feedback show correct';feedback.textContent='Richtig zugeordnet.';
    if(solvedRules===3)document.querySelector('#decoded-card').hidden=false;
  }

  function createBindingQuestionPool(){
    const groups=['ionic','covalent','metallic'].map(binding=>bindingQuestions.filter(q=>q.binding===binding).sort(()=>Math.random()-.5));
    const chosen=groups.flatMap(group=>group.slice(0,2));
    const remaining=bindingQuestions.filter(question=>!chosen.includes(question)).sort(()=>Math.random()-.5).slice(0,2);
    return [...chosen,...remaining].sort(()=>Math.random()-.5);
  }

  function updateBindingProgress(done=questionIndex){
    document.querySelector('#binding-progress').textContent='Aufgabe '+Math.min(questionIndex+1,8)+' von 8';
    document.querySelector('#binding-dots').innerHTML=Array.from({length:8},(_,i)=>'<span class="binding-dot '+(i<done?'done':'')+'">'+(i<done?'●':'○')+'</span>').join('');
  }

  function showBindingQuestion(){
    if(questionIndex>=8){finishBindingQuiz();return}
    correctTypes=[false,false];const item=quizPool[questionIndex];updateBindingProgress();
    document.querySelector('#binding-question').innerHTML='<div class="quiz-step" id="type-step"><p class="step-label">SCHRITT 1</p><h3>Wer trifft aufeinander?</h3><div class="atom-pair">'+elementCard(item.elements[0],item.types[0],0,true)+'<span class="pair-plus">+</span>'+elementCard(item.elements[1],item.types[1],1,true)+'</div></div><div class="quiz-step binding-choice-step" id="binding-step" hidden><p class="step-label">SCHRITT 2</p><strong class="known-combination">'+combination(item.types)+'</strong><h3>Welche Bindung erwartest du?</h3><div class="binding-answer-grid"><button data-binding-answer="ionic">IONENBINDUNG</button><button data-binding-answer="covalent">ATOMBINDUNG</button><button data-binding-answer="metallic">METALLBINDUNG</button></div></div>';
    const savedTasks=BindungenProgress.loadProgress().modules?.bindungscode?.tasks||{};
    [0,1].forEach(index=>{if(savedTasks['type-'+questionIndex+'-'+index]?.completed){const button=document.querySelector('[data-type-index="'+index+'"][data-type-answer="'+item.types[index]+'"]');if(button){button.classList.add('correct');button.parentElement.querySelectorAll('button').forEach(option=>option.disabled=true);correctTypes[index]=true}}});
    if(correctTypes.every(Boolean))document.querySelector('#binding-step').hidden=false;
    if(savedTasks['quiz-'+questionIndex]?.completed){document.querySelector('[data-binding-answer="'+item.binding+'"]')?.classList.add('correct');document.querySelectorAll('[data-binding-answer]').forEach(button=>button.disabled=true);document.querySelector('#next-binding-question').hidden=false}
    const feedback=document.querySelector('#quiz-feedback');feedback.className='binding-feedback';feedback.textContent='';
    document.querySelectorAll('[data-type-answer]').forEach(button=>button.addEventListener('click',()=>checkElementType(Number(button.dataset.typeIndex),button.dataset.typeAnswer,button)));
    document.querySelectorAll('[data-binding-answer]').forEach(button=>button.addEventListener('click',()=>checkBindingAnswer(button.dataset.bindingAnswer,button)));
  }

  function checkElementType(index,answer,button){
    const item=quizPool[questionIndex],feedback=document.querySelector('#quiz-feedback');
    if(answer!==item.types[index]){feedback.className='binding-feedback show wrong';feedback.textContent='Schau noch einmal auf die Position des Elements im Periodensystem.';button.classList.add('wrong');setTimeout(()=>button.classList.remove('wrong'),450);return}
    correctTypes[index]=true;button.parentElement.querySelectorAll('button').forEach(item=>item.disabled=true);button.classList.add('correct');
    BindungenProgress.completeTask('bindungscode','type-'+questionIndex+'-'+index);saveQuizState({questionIndex});
    feedback.className='binding-feedback show correct';feedback.textContent='Richtig eingeordnet.';
    if(correctTypes.every(Boolean))document.querySelector('#binding-step').hidden=false;
  }

  function checkBindingAnswer(answer,button){
    const item=quizPool[questionIndex],feedback=document.querySelector('#quiz-feedback');
    if(answer!==item.binding){feedback.className='binding-feedback show wrong';feedback.innerHTML='Prüfe zuerst: Metall oder Nichtmetall?<br><strong>'+combination(item.types)+'</strong>';button.classList.add('wrong');setTimeout(()=>button.classList.remove('wrong'),450);return}
    button.classList.add('correct');document.querySelectorAll('[data-binding-answer]').forEach(item=>item.disabled=true);
    BindungenProgress.completeTask('bindungscode','quiz-'+questionIndex);saveQuizState({questionIndex,completedIds:[...(quizState.completedIds||[]),questionIndex]});
    feedback.className='binding-feedback show correct';feedback.textContent='Richtig! '+combination(item.types)+' → '+labels[item.binding]+'.';
    updateBindingProgress(questionIndex+1);document.querySelector('#next-binding-question').hidden=false;
  }

  function startBindingQuiz(){rulesPart.hidden=true;quizPart.hidden=false;const savedIds=Array.isArray(quizState.questionIds)?quizState.questionIds:[];quizPool=savedIds.length?savedIds.map(id=>bindingQuestions[id]).filter(Boolean):createBindingQuestionPool();questionIndex=Math.min(Number(quizState.questionIndex)||0,Math.max(0,quizPool.length-1));showBindingQuestion();quizPart.scrollIntoView({behavior:'smooth',block:'start'});if(!savedIds.length)saveQuizState({questionIds:quizPool.map(item=>bindingQuestions.indexOf(item)),questionIndex:0,completedIds:[]})}
  function finishBindingQuiz(){quizPart.hidden=true;finishPart.hidden=false;saveQuizState({completedIds:quizPool.map((_,index)=>index)});finishPart.scrollIntoView({behavior:'smooth',block:'center'})}

  function showBindingInfo(binding){
    const dialog=document.querySelector('#binding-info-dialog');
    document.querySelector('#binding-info-title').textContent=labels[binding];
    document.querySelector('#binding-info-text').textContent=bindingInfo[binding];
    document.querySelector('#binding-info-accent').className='binding-info-accent '+binding;
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  }

  nextExample.addEventListener('click',()=>{if(exampleIndex<2){exampleIndex++;showDiscoveryExample()}else{discoveryPart.hidden=true;rulesPart.hidden=false;rulesPart.scrollIntoView({behavior:'smooth',block:'start'})}});
  document.querySelectorAll('.binding-token').forEach(token=>{token.addEventListener('click',()=>{document.querySelectorAll('.binding-token').forEach(item=>item.classList.remove('selected'));token.classList.add('selected');selectedToken=token.dataset.binding});token.addEventListener('dragstart',event=>event.dataTransfer.setData('text/plain',token.dataset.binding))});
  document.querySelectorAll('.rule-slot').forEach(slot=>{slot.addEventListener('click',()=>checkBindingRule(selectedToken,slot));slot.addEventListener('dragover',event=>event.preventDefault());slot.addEventListener('drop',event=>{event.preventDefault();checkBindingRule(event.dataTransfer.getData('text/plain'),slot)})});
  document.querySelector('#start-binding-quiz').addEventListener('click',startBindingQuiz);
  document.querySelector('#next-binding-question').addEventListener('click',()=>{questionIndex++;saveQuizState({questionIndex});showBindingQuestion()});
  document.querySelector('#complete-binding').addEventListener('click',()=>{BindungenProgress.completeMission(2,'bindungscode');location.href='arbeitsblatt-bindungen.html'});
  function checkTeacherCode(){
    const input=document.querySelector('#teacher-check-code');
    const feedback=document.querySelector('#teacher-code-feedback');
    if(input.value.trim().toUpperCase()===TEACHER_CHECK_CODE){
      feedback.className='teacher-code-feedback correct';feedback.textContent='✓ Code richtig. Du kannst weiterarbeiten.';
      setTimeout(()=>{document.querySelector('.teacher-check-card').hidden=true},500);
    }else{
      feedback.className='teacher-code-feedback wrong';feedback.textContent='Der Code stimmt noch nicht. Frage Frau Bachmann nach dem Code.';
      input.classList.add('wrong');setTimeout(()=>input.classList.remove('wrong'),500);input.focus();
    }
  }
  document.querySelector('#confirm-teacher-check').addEventListener('click',checkTeacherCode);
  document.querySelector('#teacher-check-code').addEventListener('keydown',event=>{if(event.key==='Enter')checkTeacherCode()});
  document.addEventListener('click',event=>{const trigger=event.target.closest('[data-binding-info]');if(trigger)showBindingInfo(trigger.dataset.bindingInfo)});
  document.querySelector('#close-binding-info').addEventListener('click',()=>{const dialog=document.querySelector('#binding-info-dialog');if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open')});
  showDiscoveryExample();
  if(window.BindungenProgressReady)window.BindungenProgressReady.then(restoreBindingTasks);else document.addEventListener('bindungen-progress-ready',event=>restoreBindingTasks(event.detail),{once:true});
});
