document.addEventListener('DOMContentLoaded',()=>{
  const progress=BindungenProgress.loadProgress();
  const observations=progress.salzVersuchsbeobachtungen||{};
  const makeLattice=(host,count=8)=>{host.innerHTML=Array.from({length:count},(_,index)=>{const sodium=(index+Math.floor(index/4))%2===0;return '<i class="'+(sodium?'sodium':'chloride')+'">'+(sodium?'Na<sup>+</sup>':'Cl<sup>−</sup>')+'</i>'}).join('')};
  document.querySelectorAll('[data-saved-observation]').forEach(field=>{
    field.textContent=observations[field.dataset.savedObservation]||'Keine Beobachtung gespeichert.';
  });
  document.querySelectorAll('[data-evaluation-lattice],[data-evaluation-brittle-row]').forEach(host=>makeLattice(host));
  document.querySelectorAll('[data-evaluation-voltage]').forEach(button=>button.addEventListener('click',()=>{
    if(button.dataset.evaluationVoltage==='solid'){
      document.querySelector('.evaluation-card .fixed-ions').classList.add('voltage-on');
      document.querySelector('#evaluation-solid-current').textContent='Die Ionen bleiben an ihren Gitterplätzen.';
    }else{
      document.querySelector('.evaluation-card .moving-ions').classList.add('voltage-on');
      document.querySelector('#evaluation-solution-lamp').textContent='●';
      document.querySelector('#evaluation-solution-lamp').classList.add('on');
      document.querySelector('#evaluation-solution-current').textContent='Die beweglichen Ionen transportieren Ladung.';
    }
  }));
  document.querySelector('#evaluation-apply-force').addEventListener('click',()=>{
    const model=document.querySelector('#evaluation-brittleness');
    model.classList.add('shifted');
    setTimeout(()=>model.classList.add('crystal-break'),800);
  });
});
