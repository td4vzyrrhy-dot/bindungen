(() => {
  const normalizeEquation=value=>value.trim()
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g,char=>'₀₁₂₃₄₅₆₇₈₉'.indexOf(char))
    .replace(/[→⟶⇒]/g,'->').replace(/[−–]/g,'-').replace(/\s+/g,'')
    .replace(/(?:-->|=>|=)/g,'->').replace(/(^|->|\+)1(?=[A-Z])/g,'$1');
  const normalizeText=value=>value.trim().toLocaleLowerCase('de-DE').replace(/\s+/g,' ').replace(/[.!?]+$/,'');
  const isCorrect=(value,expected,equation=false)=>expected.split('|').some(answer=>equation?normalizeEquation(value)===normalizeEquation(answer):normalizeText(value)===normalizeText(answer));
  const evaluate=answers=>{const answered=answers.filter(a=>a.value.trim()).length;const correct=answers.map(a=>a.parts?a.parts.every(p=>isCorrect(p.value,p.expected,p.equation)):isCorrect(a.value,a.expected,a.equation));const points=correct.filter(Boolean).length;return {answered,correct,points,percent:Math.round(points/answers.length*100),passed:answers.length>0&&points/answers.length>=0.8};};
  window.MetalTest={normalizeEquation,isCorrect,evaluate};
  document.addEventListener('DOMContentLoaded',()=>{
    const form=document.querySelector('#metal-test-form');
    if(!form)return;
    const spoonQuestion=form.querySelector('[data-question="q6"]');
    spoonQuestion?.querySelector('label:first-of-type')?.remove();
    const spoonLabel=spoonQuestion?.querySelector('label span');
    if(spoonLabel)spoonLabel.textContent=spoonLabel.textContent.replace(/^Außerdem geben die Atomrümpfe Energie weiter, indem sie …/,'Die Atomrümpfe …');
    const questions=[...form.querySelectorAll('[data-question]')];
    const result=document.querySelector('#metal-test-result'),success=document.querySelector('#metal-test-success');
    const nextButton=document.querySelector('#metal-result-next');
    const savedProgress=BindungenProgress.loadProgress();
    let currentPassed=Boolean(savedProgress.metallOnlineTestBestanden);
    if(currentPassed){success.hidden=false;nextButton.hidden=true;}
    function renderMillionaireAccess(){
      let box=success.querySelector('#millionaire-unlock');
      const progress=BindungenProgress.loadProgress();
      const unlocked=Boolean(progress.modules?.metallbindung?.millionaerFreigeschaltet);
      if(unlocked){
        if(!success.querySelector('#crossover-link')){const link=document.createElement('a');link.id='crossover-link';link.className='btn btn-primary';link.href='chemie-millionaer.html';link.textContent='Weiter → Chemie-Millionär';success.appendChild(link);}
        box?.remove();return;
      }
      if(box)return;
      box=document.createElement('div');box.id='millionaire-unlock';box.className='teacher-code-entry millionaire-unlock-card';
      box.innerHTML='<p class="step-label">🔒 BONUSQUIZ</p><h3>Bereit für die letzte Herausforderung?</h3><p>Nach dem großen Abschlusstest erhältst du von Frau Bachmann den Freischaltcode für das Bonusquiz.</p><label for="millionaire-code">Freischaltcode</label><input id="millionaire-code" type="text" autocomplete="off" spellcheck="false"><button class="btn btn-primary" id="millionaire-unlock-button" type="button">Freischalten</button><p id="millionaire-code-feedback" class="teacher-code-feedback" role="status"></p>';
      success.appendChild(box);
      box.querySelector('#millionaire-unlock-button').addEventListener('click',()=>{
        const input=box.querySelector('#millionaire-code'),feedback=box.querySelector('#millionaire-code-feedback');
        if(input.value.trim()!=='Super'){feedback.textContent='Der Code stimmt noch nicht.';feedback.className='teacher-code-feedback wrong';return;}
        const nextProgress=BindungenProgress.loadProgress();nextProgress.modules.metallbindung=nextProgress.modules.metallbindung||{};nextProgress.modules.metallbindung.millionaerFreigeschaltet=true;BindungenProgress.saveProgress(nextProgress);renderMillionaireAccess();
      });
    }
    if(currentPassed)renderMillionaireAccess();
    nextButton.addEventListener('click',()=>{
      if(!currentPassed)return;
      success.hidden=false;
      renderMillionaireAccess();
      nextButton.setAttribute('aria-expanded','true');
      document.querySelector('#metal-teacher-title').focus();
    });
    const resultBack=document.querySelector('#metal-result-back');
    resultBack?.addEventListener('click',()=>{if(!savedProgress.metallOnlineTestBestanden)success.hidden=true;nextButton.setAttribute('aria-expanded','false');nextButton.focus();});
    const answers=()=>questions.map(q=>{
      const fields=[...q.querySelectorAll('[data-answer]')];
      if(fields.length){
        const parts=fields.map(field=>({value:field.value,expected:field.dataset.answer,equation:field.dataset.normalize==='formula'}));
        return {parts,value:parts.every(p=>p.value.trim())?'complete':''};
      }
      if(q.dataset.type==='multiple')return {value:[...q.querySelectorAll('input:checked')].map(input=>input.value).sort().join(','),expected:q.dataset.correct};
      return {value:q.querySelector('input[type="text"]')?.value??q.querySelector('input:checked')?.value??'',expected:q.dataset.correct,equation:!!q.dataset.equation};
    });
    function updateProgress(){const {answered}=evaluate(answers());document.querySelector('#metal-test-answered').textContent=answered;document.querySelector('#metal-test-progress-fill').style.width=answered/questions.length*100+'%';}
    function changed(event){const question=event.target.closest('[data-question]');if(!question)return;question.classList.remove('correct','incorrect');question.querySelector('.test-answer-feedback')?.remove();result.className='worksheet-result';result.textContent='';if(!savedProgress.metallOnlineTestBestanden){success.hidden=true;currentPassed=false;}nextButton.hidden=true;nextButton.setAttribute('aria-expanded','false');updateProgress();}
    form.addEventListener('input',changed);form.addEventListener('change',changed);
    form.addEventListener('submit',event=>{
      event.preventDefault();const currentAnswers=answers();const score=evaluate(currentAnswers);
      questions.forEach((q,index)=>{q.classList.toggle('correct',score.correct[index]);q.classList.toggle('incorrect',!score.correct[index]);q.querySelector('.test-answer-feedback')?.remove();const hint=document.createElement('p');hint.className='test-answer-feedback';hint.textContent=score.correct[index]?'✓ Richtig':currentAnswers[index].value.trim()?'✗ Noch nicht richtig. Verbessere deine Antwort.':'✗ Bitte beantworte diese Aufgabe.';q.appendChild(hint);});
      result.className='worksheet-result show '+(score.passed?'passed':'retry');
      result.innerHTML='<strong>Dein Ergebnis: '+score.percent+' %</strong><span>'+score.points+' von '+questions.length+' Aufgaben richtig</span>';
      const message=document.createElement('p');
      message.textContent=score.passed
        ? 'Bestanden! Sieh dir dein Ergebnis in Ruhe an und klicke anschließend auf „Weiter“.'
        : score.answered<questions.length
          ? 'Ergänze fehlende Antworten oder verbessere Fehler und prüfe erneut. Für die Freigabe brauchst du mindestens 80 %.'
          : 'Verbessere die rot markierten Aufgaben. Für die Freigabe brauchst du mindestens 80 %.';
      result.appendChild(message);
      if(!savedProgress.metallOnlineTestBestanden){success.hidden=true;currentPassed=score.passed;}nextButton.hidden=!score.passed;nextButton.setAttribute('aria-expanded','false');
      if(score.passed){const progress=BindungenProgress.loadProgress();progress.metallOnlineTestBestanden=true;progress.metallAbschlussVersion=1;progress.metallTestBestesErgebnis=Math.max(progress.metallTestBestesErgebnis||0,score.percent);BindungenProgress.saveProgress(progress);}
      result.scrollIntoView({behavior:'smooth',block:'center'});
    });
    updateProgress();
  });
})();
