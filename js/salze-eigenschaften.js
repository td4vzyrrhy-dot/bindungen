document.addEventListener('DOMContentLoaded',()=>{
  let selectedProperty=null;
  const matches=new Set();
  const feedback=document.querySelector('#evaluation-matching-feedback');
  const showFeedback=(text,correct=false)=>{feedback.className='salt-feedback show '+(correct?'correct':'wrong');feedback.textContent=text};
  document.querySelectorAll('[data-evaluation-property]').forEach(button=>button.addEventListener('click',()=>{
    if(button.classList.contains('matched'))return;
    document.querySelectorAll('[data-evaluation-property]').forEach(item=>item.classList.remove('selected'));
    button.classList.add('selected');selectedProperty=button.dataset.evaluationProperty;
  }));
  document.querySelectorAll('[data-evaluation-target]').forEach(button=>button.addEventListener('click',()=>{
    if(button.classList.contains('matched'))return;
    if(!selectedProperty){showFeedback('Wähle zuerst eine Eigenschaft aus.');return}
    if(selectedProperty!==button.dataset.evaluationTarget){showFeedback('Noch nicht. Vergleiche Eigenschaft und Erklärung noch einmal.');return}
    matches.add(selectedProperty);button.classList.add('matched');document.querySelector('[data-evaluation-property="'+selectedProperty+'"]').classList.add('matched');document.querySelectorAll('[data-evaluation-property]').forEach(item=>item.classList.remove('selected'));selectedProperty=null;
    if(matches.size===4){showFeedback('✓ Alle Eigenschaften sind richtig zugeordnet.',true);document.querySelector('#evaluation-notebook').hidden=false;document.querySelector('#evaluation-notebook').scrollIntoView({behavior:'smooth',block:'center'})}else showFeedback('Richtig zugeordnet.',true);
  }));
  document.querySelector('#evaluation-start-check').addEventListener('click',()=>{const progress=BindungenProgress.loadProgress();progress.salzZuordnungAbgeschlossen=true;progress.salzEigenschaftenVersion=2;BindungenProgress.saveProgress(progress);location.href='salze.html?mini=1#salt-check'});
});
