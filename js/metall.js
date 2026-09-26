/* Metallbindung: Modelle, Verständnisfragen und bestehender Kursfortschritt. */
(()=>{'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 if(!BindungenProgress.loadProgress().metallbindungFreigeschaltet){location.replace('atombindung-abschlusstest.html');return;}
 const main=document.querySelector('[data-metal-mission]');if(!main)return;
 const mission=Number(main.dataset.metalMission),key='metallLernen'+mission;
 const saved=BindungenProgress.loadProgress()[key]||{};
 const state={answers:{...(saved.answers||{})},formed:!!saved.formed,voltage:!!saved.voltage,shifted:!!saved.shifted};
 const quizzes=[...main.querySelectorAll('[data-quiz]')];
 function save(){const p=BindungenProgress.loadProgress();p[key]=state;BindungenProgress.saveProgress(p)}
 function update(){
  const solved=quizzes.filter(q=>state.answers[q.dataset.quiz]===q.dataset.correct).length;
  const explored=mission===9?state.formed:state.voltage&&state.shifted;
  const done=solved===quizzes.length&&explored;
  document.querySelector('#metal-progress').textContent=solved+' / '+quizzes.length+' Verständnisfragen gelöst · Modell'+(explored?' erkundet':' noch erkunden');
  document.querySelector('#metal-finish').hidden=!done;
  document.querySelector('.metal-finish-hint').hidden=done;
  if(done){const p=BindungenProgress.loadProgress();if(!p.completedMissions.includes(mission))BindungenProgress.completeMission(mission,mission===9?'metallbindung':'metalle')}
 }
 function paintAnswer(q){const correct=state.answers[q.dataset.quiz]===q.dataset.correct;if(!correct)return;
  q.querySelectorAll('[data-answer]').forEach(b=>{b.disabled=true;b.classList.toggle('is-correct',b.dataset.answer===q.dataset.correct)});
  const feedback=q.querySelector('.metal-feedback');feedback.className='metal-feedback is-success';feedback.textContent='✓ Richtig. '+q.dataset.explanation;
 }
 quizzes.forEach(q=>{paintAnswer(q);q.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>{
  q.querySelectorAll('button').forEach(x=>x.classList.remove('is-wrong'));
  if(b.dataset.answer===q.dataset.correct){state.answers[q.dataset.quiz]=b.dataset.answer;BindungenProgress.completeTask('metallbindung',q.dataset.quiz);save();paintAnswer(q);update()}
  else{b.classList.add('is-wrong');const f=q.querySelector('.metal-feedback');f.className='metal-feedback is-error';f.textContent='Noch nicht. '+q.dataset.explanation+' Versuche es erneut.'}
 }))});
 const NS='http://www.w3.org/2000/svg';
 function el(tag,attrs,text){const x=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>x.setAttribute(k,v));if(text)x.textContent=text;return x}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const models=[...document.querySelectorAll('[data-model]')].map(host=>{
  const m={host,kind:host.dataset.model,cores:[],electrons:[],paused:reduced,on:false,shift:0,formed:host.dataset.model!=='bond'||state.formed};
  for(let i=0;i<15;i++){
   const x=85+(i%5)*120,y=60+Math.floor(i/5)*90;
   const g=el('g',{transform:`translate(${x} ${y})`});
   const ring=el('circle',{r:39,class:'atom-ring'});g.append(ring,el('circle',{r:25,class:'core'}));const label=el('text',{class:'core-label'},'+');g.append(label);host.querySelector('.cores').append(g);m.cores.push({g,x,y,ring,label});
   const eg=el('g',{});eg.append(el('circle',{r:10,class:'electron'}),el('text',{class:'electron-label'},'−'));host.querySelector('.electrons').append(eg);
   m.electrons.push({g:eg,x:x+35,y:y,vx:25+Math.random()*25,vy:(Math.random()-.5)*65});
  }
  return m;
 });
 function draw(m){m.cores.forEach((c,i)=>{c.g.setAttribute('transform',`translate(${c.x+(i<5?m.shift:0)} ${c.y})`);c.ring.style.display=m.formed?'none':'';c.label.textContent=m.formed?'+':'Na'});m.electrons.forEach(e=>e.g.setAttribute('transform',`translate(${e.x} ${e.y})`))}
 function pauseLabel(button,m){button.textContent=m.paused?'Animation fortsetzen':'Animation pausieren';button.setAttribute('aria-pressed',String(m.paused))}
 document.querySelectorAll('[data-pause]').forEach(b=>{const m=models.find(m=>m.host.closest('section')===b.closest('section'));pauseLabel(b,m);b.addEventListener('click',()=>{m.paused=!m.paused;pauseLabel(b,m)})});
 const bond=models.find(m=>m.kind==='bond');
 function bondText(){document.querySelector('#bond-status').textContent='15 positive Atomrümpfe + 15 delokalisierte Elektronen: Das Metall bleibt insgesamt neutral.';document.querySelector('#delocalize').textContent='✓ Metallmodell gebildet';document.querySelector('#delocalize').disabled=true}
 if(bond){if(state.formed)bondText();document.querySelector('#delocalize').addEventListener('click',()=>{bond.formed=true;state.formed=true;bond.electrons.forEach((e,i)=>{e.x=35+(i*137)%590;e.y=25+(i*71)%250});bondText();draw(bond);save();update()})}
 const current=models.find(m=>m.kind==='current');
 if(current)document.querySelector('#voltage').addEventListener('click',event=>{current.on=!current.on;event.currentTarget.setAttribute('aria-pressed',String(current.on));event.currentTarget.textContent=current.on?'Spannung ausschalten':'Spannung einschalten';document.querySelector('#current-status').textContent=current.on?'Spannung an: Zur ungeordneten Bewegung kommt eine gerichtete Elektronendrift nach rechts zum Pluspol hinzu.':'Spannung aus: ungeordnete Bewegung, kein gerichteter Elektronenstrom.';if(current.on){state.voltage=true;save();update()}});
 const shift=models.find(m=>m.kind==='shift');
 if(shift)document.querySelector('#shift').addEventListener('input',event=>{shift.shift=Number(event.target.value);draw(shift);document.querySelector('#shift-status').textContent=shift.shift?'Die obere Schicht ist verschoben. Die Anziehung zwischen Atomrümpfen und Elektronengas bleibt erhalten.':'Die Schichten liegen in ihrer Ausgangslage.';if(shift.shift>=20&&!state.shifted){state.shifted=true;save();update()}});
 models.forEach(draw);let last=0;
 function frame(time){const dt=Math.min((time-last)/1000,.04);last=time;
  models.forEach(m=>{if(m.paused||!m.formed||document.hidden)return;m.electrons.forEach(e=>{e.x+=(e.vx+(m.on?100:0))*dt;e.y+=e.vy*dt;if(m.on){if(e.x>645)e.x=15}else if(e.x>645||e.x<15){e.x=Math.max(15,Math.min(645,e.x));e.vx*=-1}if(e.y>285||e.y<15){e.y=Math.max(15,Math.min(285,e.y));e.vy*=-1}});draw(m)});requestAnimationFrame(frame)
 }
 // Start electrons with both horizontal directions; drift is additional to random motion.
 models.forEach(m=>m.electrons.forEach((e,i)=>{if(i%2)e.vx*=-1}));
 update();requestAnimationFrame(frame);
});
})();
