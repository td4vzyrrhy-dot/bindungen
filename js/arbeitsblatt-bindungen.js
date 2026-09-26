document.addEventListener('DOMContentLoaded',()=>{
  const TEACHER_CODE='BINDUNG';
  const form=document.querySelector('#worksheet-form'),inputs=[...form.querySelectorAll('input[data-answer]')],attempts=new Map();
  const psePeriods=[
    ['H','He'],
    ['Li','Be','B','C','N','O','F','Ne'],
    ['Na','Mg','Al','Si','P','S','Cl','Ar'],
    ['K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr'],
    ['Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe'],
    ['Cs','Ba','57–71','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn'],
    ['Fr','Ra','89–103','Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og']
  ];
  const pseSeries=[
    ['La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu'],
    ['Ac','Th','Pa','U','Np','Pu','Am','Cm','Bk','Cf','Es','Fm','Md','No','Lr']
  ];
  function renderWorksheetPse(){
    const host=document.querySelector('.worksheet-pse');
    if(!host)return;
    host.innerHTML='';
    host.classList.add('full-worksheet-pse');
    host.setAttribute('aria-label','Vollständiges Periodensystem mit allen 118 Elementen');
    psePeriods.forEach((period,rowIndex)=>period.forEach((symbol,index)=>{
      let column=index+1;
      if(rowIndex===0)column=index===0?1:18;
      if(rowIndex===1||rowIndex===2)column=index<2?index+1:index+11;
      const cell=document.createElement('span');
      cell.className='worksheet-pse-element'+(symbol.includes('–')?' series-placeholder':'');
      cell.style.setProperty('--worksheet-col',column);
      cell.style.setProperty('--worksheet-row',rowIndex+1);
      cell.textContent=symbol;
      host.appendChild(cell);
    }));
    pseSeries.forEach((series,index)=>series.forEach((symbol,columnIndex)=>{
      const cell=document.createElement('span');
      cell.className='worksheet-pse-element';
      cell.style.setProperty('--worksheet-col',columnIndex+3);
      cell.style.setProperty('--worksheet-row',index+8);
      cell.textContent=symbol;
      host.appendChild(cell);
    }));
  }
  const normalize=value=>value.trim().toLocaleLowerCase('de-DE').replace(/\s+/g,' ');
  const accepted=input=>input.dataset.answer.split('|').map(normalize);
  const isCorrect=input=>accepted(input).includes(normalize(input.value));
  function updateAnswered(){const count=inputs.filter(input=>normalize(input.value)).length;document.querySelector('#answered-count').textContent=count;document.querySelector('#total-count').textContent=inputs.length;document.querySelector('#worksheet-progress-fill').style.width=(count/inputs.length*100)+'%'}
  function clearHint(input){const hint=input.parentElement.querySelector('.input-hint');if(hint)hint.remove()}
  function markIncorrect(input){input.classList.add('incorrect');const count=(attempts.get(input)||0)+1;attempts.set(input,count);clearHint(input);const hint=document.createElement('small');hint.className='input-hint';hint.textContent=count>=2?input.dataset.hint:'Überprüfe diese Antwort noch einmal.';input.insertAdjacentElement('afterend',hint)}
  function saveWorksheetPass(){const progress=BindungenProgress.loadProgress();progress.arbeitsblattBindungenBestanden=true;BindungenProgress.saveProgress(progress)}
  function checkWorksheet(event){event.preventDefault();let points=0;inputs.forEach(input=>{clearHint(input);input.classList.remove('incorrect','correct');if(isCorrect(input)){points++;input.classList.add('correct')}else markIncorrect(input)});const percent=Math.round(points/inputs.length*100),result=document.querySelector('#worksheet-result');result.className='worksheet-result show '+(percent>=80?'passed':'retry');result.innerHTML='<strong>Dein Ergebnis: '+percent+' %</strong><span>'+points+' von '+inputs.length+' Punkten</span>';if(percent>=80){saveWorksheetPass();document.querySelector('#improve-answers').hidden=true;document.querySelector('#worksheet-success').hidden=false;document.querySelector('#worksheet-success').scrollIntoView({behavior:'smooth',block:'center'})}else{result.insertAdjacentHTML('beforeend','<p>Noch nicht ganz. Du hast '+percent+' % erreicht. Für die Freigabe brauchst du mindestens 80 %.</p>');document.querySelector('#improve-answers').hidden=false}}
  function checkTeacherCode(){const input=document.querySelector('#worksheet-teacher-code'),feedback=document.querySelector('#worksheet-code-feedback');if(normalize(input.value)===normalize(TEACHER_CODE)){feedback.className='teacher-code-feedback correct';feedback.textContent='✓ Code richtig. Die Ionenbindung wird geöffnet.';BindungenProgress.completeMission(2,'bindungscode');BindungenProgress.completeMission(3,'edelgasregel');setTimeout(()=>location.href='ionenbildung.html',450)}else{feedback.className='teacher-code-feedback wrong';feedback.textContent='Der Code stimmt noch nicht. Frage Frau Bachmann nach dem Code.';input.focus()}}
  inputs.forEach((input,index)=>{input.addEventListener('input',()=>{input.classList.remove('incorrect','correct');clearHint(input);updateAnswered()});input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();if(inputs[index+1])inputs[index+1].focus();else document.querySelector('#check-worksheet').focus()}})});
  form.addEventListener('submit',checkWorksheet);document.querySelector('#improve-answers').addEventListener('click',()=>{document.querySelector('.incorrect')?.focus();document.querySelector('#worksheet-result').scrollIntoView({behavior:'smooth',block:'center'})});document.querySelector('#unlock-ionic').addEventListener('click',checkTeacherCode);document.querySelector('#worksheet-teacher-code').addEventListener('keydown',event=>{if(event.key==='Enter')checkTeacherCode()});
  const storedProgress=BindungenProgress.loadProgress();
  if(new URLSearchParams(location.search).has('locked'))document.querySelector('#locked-note').hidden=false;
  if(storedProgress.arbeitsblattBindungenBestanden)document.querySelector('#worksheet-success').hidden=false;
  renderWorksheetPse();
  updateAnswered();
});
