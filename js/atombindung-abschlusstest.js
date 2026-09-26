(() => {
  const normalizeEquation=value=>value.trim()
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g,char=>'₀₁₂₃₄₅₆₇₈₉'.indexOf(char))
    .replace(/[→⟶⇒]/g,'->').replace(/[−–]/g,'-').replace(/\s+/g,'')
    .replace(/(?:-->|=>|=)/g,'->').replace(/(^|->|\+)1(?=[A-Z])/g,'$1');
  const isCorrect=(value,expected,equation=false)=>expected.split('|').some(answer=>equation?normalizeEquation(value)===normalizeEquation(answer):value.trim()===answer);
  const evaluate=answers=>{const answered=answers.filter(a=>a.value.trim()).length;const correct=answers.map(a=>a.parts?a.parts.every(p=>isCorrect(p.value,p.expected,p.equation)):isCorrect(a.value,a.expected,a.equation));const points=correct.filter(Boolean).length;return {answered,correct,points,percent:Math.round(points/answers.length*100),passed:answers.length>0&&points/answers.length>=0.8};};
  window.CovalentTest={normalizeEquation,isCorrect,evaluate};
  document.addEventListener('DOMContentLoaded',()=>{
    const form=document.querySelector('#covalent-test-form');
    if(!form)return;
    const downloads=document.querySelector('#covalent-test-success .optional-practice-downloads');
    if(downloads&&!downloads.querySelector('[data-download="atombindung"]')){
      const link=document.createElement('a');
      link.className='btn btn-secondary';link.href='Arbeitsblatt_Atombindung.pdf';link.download='Arbeitsblatt_Atombindung.pdf';link.dataset.download='atombindung';link.textContent='Arbeitsblatt Atombindung herunterladen';downloads.appendChild(link);
    }
    const questions=[...form.querySelectorAll('[data-question]')];
    const result=document.querySelector('#covalent-test-result'),success=document.querySelector('#covalent-test-success');
    const nextButton=document.querySelector('#covalent-result-next');
    const savedProgress=BindungenProgress.loadProgress();
    let currentPassed=Boolean(savedProgress.atombindungOnlineTestBestanden);
    if(currentPassed){success.hidden=false;nextButton.hidden=true;}
    nextButton.addEventListener('click',()=>{
      if(!currentPassed)return;
      success.hidden=false;
      nextButton.setAttribute('aria-expanded','true');
      document.querySelector('#covalent-teacher-title').focus();
    });
    const codeButton=document.querySelector('#metall-teacher-confirm');
    if(codeButton)codeButton.addEventListener('click',()=>{
      const input=document.querySelector('#metall-teacher-code'),feedback=document.querySelector('#metall-code-feedback'),link=document.querySelector('#metallbindung-link');
      if(input.value.trim().toUpperCase()==='ATOM'){
        const progress=BindungenProgress.loadProgress();progress.metallbindungFreigeschaltet=true;BindungenProgress.saveProgress(progress);
        feedback.className='teacher-code-feedback correct';feedback.textContent='✓ Code richtig. Die Metallbindung ist freigeschaltet.';link.hidden=false;codeButton.disabled=true;input.disabled=true;
      }else{feedback.className='teacher-code-feedback wrong';feedback.textContent='Der Code stimmt noch nicht. Frage Frau Bachmann nach dem Code.';input.classList.add('wrong');setTimeout(()=>input.classList.remove('wrong'),500);input.focus();}
    });
    const answers=()=>questions.map(q=>{
      const fields=[...q.querySelectorAll('[data-answer]')];
      if(fields.length){
        const parts=fields.map(field=>({value:field.value,expected:field.dataset.answer,equation:field.dataset.normalize==='formula'}));
        return {parts,value:parts.every(p=>p.value.trim())?'complete':''};
      }
      if(q.dataset.type==='multiple')return {value:[...q.querySelectorAll('input:checked')].map(input=>input.value).sort().join(','),expected:q.dataset.correct};
      return {value:q.querySelector('input[type="text"]')?.value??q.querySelector('input:checked')?.value??'',expected:q.dataset.correct,equation:!!q.dataset.equation};
    });
    function updateProgress(){const {answered}=evaluate(answers());document.querySelector('#covalent-test-answered').textContent=answered;document.querySelector('#covalent-test-progress-fill').style.width=answered/questions.length*100+'%';}
    function changed(event){const question=event.target.closest('[data-question]');if(!question)return;question.classList.remove('correct','incorrect');question.querySelector('.test-answer-feedback')?.remove();result.className='worksheet-result';result.textContent='';if(!savedProgress.atombindungOnlineTestBestanden){success.hidden=true;currentPassed=false;}nextButton.hidden=true;nextButton.setAttribute('aria-expanded','false');updateProgress();}
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
      if(!savedProgress.atombindungOnlineTestBestanden){success.hidden=true;currentPassed=score.passed;}nextButton.hidden=!score.passed;nextButton.setAttribute('aria-expanded','false');
      if(score.passed){const progress=BindungenProgress.loadProgress();progress.atombindungOnlineTestBestanden=true;progress.atombindungAbschlussVersion=1;progress.atombindungTestBestesErgebnis=Math.max(progress.atombindungTestBestesErgebnis||0,score.percent);BindungenProgress.saveProgress(progress);}
      result.scrollIntoView({behavior:'smooth',block:'center'});
    });
    updateProgress();
  });
})();
