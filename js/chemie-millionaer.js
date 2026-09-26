(()=>{
  const questions=[
    {category:'PSE',q:'Ein Element steht weit links im PSE und gibt leicht Elektronen ab. Was ist es wahrscheinlich?',a:['Metall','Nichtmetall','Edelgas','Halogen'],correct:0},
    {category:'BINDUNGSARTEN',q:'Welche Bindung entsteht typischerweise zwischen Metall und Nichtmetall?',a:['Atombindung','Ionenbindung','Metallbindung','Wasserstoffbrückenbindung'],correct:1},
    {category:'IONENBINDUNG',q:'Natrium gibt ein Elektron ab, Chlor nimmt eines auf. Was entsteht?',a:['Na− und Cl+','Na+ und Cl−','Na und Cl bleiben neutral','Na²+ und Cl²−'],correct:1},
    {category:'LEWIS',q:'Was braucht das O-Atom in H₂O zusätzlich zu den zwei O–H-Bindungen?',a:['Zwei freie Elektronenpaare','Ein freies Paar an jedem H','Eine Dreifachbindung','Zwei zusätzliche H-Atome'],correct:0},
    {category:'LEWIS',q:'Was bedeutet ein Strich außen am Elementsymbol?',a:['Freies Elektronenpaar','Ionenladung','Atomkern','Ein bindendes Elektronenpaar'],correct:0},
    {category:'ELEKTRONEGATIVITÄT',q:'In H–Cl zieht welches Atom die Bindungselektronen stärker an?',a:['H','Cl','Beide gleich stark','Keines der beiden'],correct:1},
    {category:'POLARITÄT',q:'Welche Bindung ist unpolar?',a:['H–Cl','O–H','Cl–Cl','H–F'],correct:2},
    {category:'REAKTIONSGLEICHUNGEN',q:'Welche Gleichung ist ausgeglichen?',a:['H₂ + Cl₂ → HCl','H₂ + Cl₂ → 2 HCl','2 H₂ + Cl₂ → HCl','H₂ + 2 Cl₂ → 2 HCl'],correct:1},
    {category:'METALLBINDUNG',q:'Was bewegt sich im Metallgitter durch den ganzen Stoff?',a:['Positive Atomrümpfe','Delokalisierte Elektronen','Elementsymbole','Nur die Atomkerne'],correct:1},
    {category:'TRANSFER',q:'Warum wird ein Metalllöffel am Griff warm?',a:['Atomrümpfe und Elektronen geben Energie weiter','Atomrümpfe verlassen das Metall','Nur die Farbe ändert sich','Das Metall nimmt neue Atome aus der Luft auf'],correct:0}
  ];
  const prizes=['100','250','500','1.000','2.500','5.000','10.000','25.000','50.000','100.000'];
  const progress=BindungenProgress.loadProgress();
  const allowed=Boolean(progress.metallOnlineTestBestanden&&progress.modules?.metallbindung?.millionaerFreigeschaltet);
  if(!allowed){
    const stage=document.querySelector('.millionaire-stage'),ladder=document.querySelector('.prize-ladder'),finish=document.querySelector('#finish');
    if(stage)stage.hidden=true;if(ladder)ladder.hidden=true;if(finish){finish.hidden=false;finish.innerHTML='<p class="step-label">QUIZ GESPERRT</p><h2>Dieses Bonusquiz ist noch gesperrt.</h2><p>Schließe zuerst den Abschlusstest ab und hole dir anschließend den Freischaltcode bei Frau Bachmann.</p><a class="btn btn-primary" href="metall-abschlusstest.html">Zum Abschlusstest</a>';}
    return;
  }
  let index=0,score=0,jokers={fifty:false,audience:false};
  const $=id=>document.querySelector(id),question=$('#question'),answers=$('#answers'),feedback=$('#feedback'),next=$('#next-question'),finish=$('#finish');
  function renderLadder(){ $('#prize-ladder').innerHTML=prizes.map((p,i)=>`<li class="${i===index?'current':''} ${i<score?'won':''}"><span>${i+1}</span><strong>${p} Punkte</strong></li>`).reverse().join(''); }
  function render(){const item=questions[index];$('#question-count').textContent=`Frage ${index+1} von ${questions.length}`;$('#prize').textContent=`${prizes[index]} Chemie-Punkte`;$('#category').textContent=item.category;question.textContent=item.q;answers.innerHTML=item.a.map((answer,i)=>`<button type="button" data-answer="${i}"><b>${String.fromCharCode(65+i)}</b>${answer}</button>`).join('');feedback.textContent='';next.hidden=true;renderLadder();}
  document.querySelector('.lifelines').addEventListener('click',event=>{const button=event.target.closest('[data-joker]');if(!button||jokers[button.dataset.joker])return;jokers[button.dataset.joker]=true;button.disabled=true;const item=questions[index];if(button.dataset.joker==='fifty'){const wrong=[0,1,2].filter(i=>i!==item.correct).sort(()=>Math.random()-.5).slice(0,1);wrong.forEach(i=>answers.querySelector(`[data-answer="${i}"]`).classList.add('eliminated'));feedback.textContent='50:50 entfernt eine falsche Antwort.';}else{feedback.textContent=`Das Publikum tippt mehrheitlich auf „${item.a[item.correct]}“.`;}});
  answers.addEventListener('click',event=>{const button=event.target.closest('[data-answer]');if(!button||button.classList.contains('eliminated'))return;const item=questions[index],correct=Number(button.dataset.answer)===item.correct;answers.querySelectorAll('button').forEach(b=>{b.disabled=true;if(Number(b.dataset.answer)===item.correct)b.classList.add('correct');});if(correct){score++;feedback.textContent='Richtig! Du steigst eine Gewinnstufe auf.';}else{button.classList.add('wrong');feedback.textContent=`Die richtige Antwort war: ${item.a[item.correct]}.`; }next.hidden=false;renderLadder();});
  next.addEventListener('click',()=>{index++;if(index<questions.length)render();else{document.querySelector('.millionaire-stage').hidden=true;document.querySelector('.prize-ladder').hidden=true;finish.hidden=false;$('#final-score').textContent=`Du hast ${score} von ${questions.length} Fragen richtig beantwortet und ${prizes[Math.max(0,score-1)]} Chemie-Punkte erreicht.`;}});
  $('#restart').addEventListener('click',()=>{index=0;score=0;jokers={fifty:false,audience:false};document.querySelectorAll('[data-joker]').forEach(button=>{button.disabled=false;});document.querySelector('.millionaire-stage').hidden=false;document.querySelector('.prize-ladder').hidden=false;finish.hidden=true;render();});
  render();
})();
