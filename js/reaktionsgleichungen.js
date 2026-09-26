document.addEventListener('DOMContentLoaded',()=>{
  const button=document.querySelector('#show-reaction-solution');
  const solution=document.querySelector('#reaction-solution');
  button.addEventListener('click',()=>{
    solution.hidden=!solution.hidden;
    button.setAttribute('aria-expanded',String(!solution.hidden));
    button.textContent=solution.hidden?'Fertig – Lösung zum Vergleichen anzeigen':'Lösung wieder ausblenden';
    if(!solution.hidden)solution.scrollIntoView({behavior:'smooth',block:'start'});
  });
});
