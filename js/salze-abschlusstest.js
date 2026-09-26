document.addEventListener('DOMContentLoaded',()=>{
  const form=document.querySelector('#salt-test-form');
  const questions=[...document.querySelectorAll('.salt-test-question')];
  const practiceDownloads=document.querySelector('#salt-test-success .optional-practice-downloads');
  const savedProgress=BindungenProgress.loadProgress();
  if(savedProgress.salzOnlineTestBestanden)document.querySelector('#salt-test-success').hidden=false;
  practiceDownloads.insertAdjacentHTML('beforeend','<a class="btn btn-secondary" href="Arbeitsblatt_Ionenbildung_3.pdf" download="Arbeitsblatt_Ionenbildung_3.pdf">Arbeitsblatt Ionenbildung 3 herunterladen</a><a class="btn btn-secondary" href="Arbeitsblatt_Ionenbildung_4.pdf" download="Arbeitsblatt_Ionenbildung_4.pdf">Arbeitsblatt Ionenbildung 4 herunterladen</a>');
  document.querySelector('#salt-test-success .salt-optional-practice p:not(.step-label)').textContent='Lade dir eines oder mehrere Arbeitsblätter herunter und bearbeite sie.';
  const normalize=value=>value.trim().toLocaleLowerCase('de-DE').replace(/[.!?]+$/,'').replace(/\s+/g,' ');
  const normalizeEquation=value=>value.trim()
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g,char=>'₀₁₂₃₄₅₆₇₈₉'.indexOf(char))
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g,char=>'⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(char))
    .replace(/⁺/g,'+').replace(/[⁻−–]/g,'-').replace(/[→⟶⇒]/g,'->')
    .replace(/\s+/g,'').replace(/(?:-->|=>|=)/g,'->')
    .replace(/(^|->|\+)1(?=[A-Z])/g,'$1');
  const answerValue=question=>{
    const written=question.querySelector('input[type="text"], select');
    if(written)return written.value;
    return [...question.querySelectorAll('input:checked')].map(input=>input.value).sort().join(',');
  };
  const isCorrect=question=>{
    if(question.dataset.equation){
      const value=normalizeEquation(answerValue(question));
      return question.dataset.correct.split('|').some(answer=>normalizeEquation(answer)===value);
    }
    const value=normalize(answerValue(question));
    if(question.dataset.ionPair){
      const notation=value.replace(/⁺/g,'+').replace(/[⁻−]/g,'-').replace(/²/g,'2');
      const ions=notation.split(/\s*(?:und|,|;|\/|&|\s\+\s)\s*|(?<=[+-])\s+(?=[a-z])/).map(ion=>ion.replace(/\s/g,''));
      if(ions.length===2&&ions.sort().join(',')===question.dataset.ionPair.split(',').sort().join(','))return true;
    }
    return question.dataset.correct.split('|').map(normalize).includes(value);
  };
  document.querySelector('#salt-test-total').textContent=questions.length;
  const updateProgress=()=>{const answered=questions.filter(question=>normalize(answerValue(question))).length;document.querySelector('#salt-test-answered').textContent=answered;document.querySelector('#salt-test-progress-fill').style.width=(answered/questions.length*100)+'%'};
  form.addEventListener('input',event=>{event.target.closest('.salt-test-question')?.classList.remove('incorrect','correct');updateProgress()});
  form.addEventListener('change',event=>{event.target.closest('.salt-test-question')?.classList.remove('incorrect','correct');updateProgress()});
  form.addEventListener('submit',event=>{
    event.preventDefault();let points=0;
    questions.forEach(question=>{const correct=isCorrect(question);question.classList.remove('incorrect','correct');question.classList.add(correct?'correct':'incorrect');if(correct)points++});
    const percent=Math.round(points/questions.length*100),result=document.querySelector('#salt-test-result');
    result.className='worksheet-result show '+(percent>=80?'passed':'retry');
    result.innerHTML='<strong>Dein Ergebnis: '+percent+' %</strong><span>'+points+' von '+questions.length+' Aufgaben richtig</span>';
    const nextButton=document.querySelector('#salt-result-next');
    if(percent>=80){const progress=BindungenProgress.loadProgress();progress.salzOnlineTestBestanden=true;progress.salzAbschlussVersion=3;BindungenProgress.saveProgress(progress);nextButton.hidden=false;result.insertAdjacentHTML('beforeend','<p>Bestanden! Sieh dir dein Ergebnis in Ruhe an und klicke anschließend auf „Weiter“.</p>');result.scrollIntoView({behavior:'smooth',block:'center'})}else{nextButton.hidden=true;result.insertAdjacentHTML('beforeend','<p>Verbessere die rot markierten Aufgaben. Für die Freigabe brauchst du mindestens 80 %.</p>');document.querySelector('.salt-test-question.incorrect')?.scrollIntoView({behavior:'smooth',block:'center'})}
  });
  const checkCode=()=>{const input=document.querySelector('#salt-sheet-code'),feedback=document.querySelector('#salt-sheet-code-feedback');if(input.value.trim().toUpperCase()==='SALZ'){feedback.className='teacher-code-feedback correct';feedback.textContent='✓ Code richtig. Die Atombindung wird geöffnet.';BindungenProgress.completeMission(6,'salze');setTimeout(()=>location.href='atombindung.html',500)}else{feedback.className='teacher-code-feedback wrong';feedback.textContent='Der Code stimmt noch nicht. Frage Frau Bachmann nach dem Code.';input.classList.add('wrong');setTimeout(()=>input.classList.remove('wrong'),500);input.focus()}};
  document.querySelector('#confirm-salt-sheet-code').addEventListener('click',checkCode);
  document.querySelector('#salt-sheet-code').addEventListener('keydown',event=>{if(event.key==='Enter')checkCode()});
  document.querySelector('#salt-result-next').addEventListener('click',()=>{document.querySelector('#salt-test-success').hidden=false});
  updateProgress();
});
