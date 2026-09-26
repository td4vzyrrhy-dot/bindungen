(() => {
  const normalize = value => value.trim().replace(',', '.');
  const check = (value, expected) => normalize(value) === expected;
  const checkDiscovery = (value, expected) => {
    const answer = normalize(value);
    return /^[0-9]+(?:[.][0-9]+)?$/.test(expected)
      ? /^[0-9]+(?:[.][0-9]+)?$/.test(answer) && Number(answer) === Number(expected)
      : value.trim() === expected;
  };
  window.ElectronegativityPractice = {check, checkDiscovery};
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#en-discovery');
    if (!form) return;
    const fields = [...form.querySelectorAll('[data-discovery-answer]')];
    const result = document.querySelector('#en-discovery-result');
    const rule = document.querySelector('#en-discovery-rule');
    const clear = event => {
      if (!event.target.matches('[data-discovery-answer]')) return;
      event.target.removeAttribute('aria-invalid');
      event.target.closest('label').querySelector('.test-answer-feedback')?.remove();
      result.textContent = '';
      result.className = 'worksheet-result';
      rule.hidden = true;
    };
    form.addEventListener('input', clear);
    form.addEventListener('change', clear);
    form.addEventListener('submit', event => {
      event.preventDefault();
      let points = 0;
      fields.forEach(field => {
        const correct = checkDiscovery(field.value, field.dataset.discoveryAnswer);
        if (correct) points++;
        field.setAttribute('aria-invalid', String(!correct));
        const label = field.closest('label');
        label.querySelector('.test-answer-feedback')?.remove();
        const feedback = document.createElement('span');
        feedback.className = 'test-answer-feedback';
        feedback.textContent = correct ? '✓ Richtig.' : !field.value.trim()
          ? 'Bitte ergänze deine Antwort.'
          : field.dataset.hint || 'Vergleiche den ersten und letzten Wert in der angegebenen Richtung.';
        label.appendChild(feedback);
      });
      const complete = points === fields.length;
      rule.hidden = !complete;
      result.className = 'worksheet-result show ' + (complete ? 'passed' : 'retry');
      result.textContent = points + ' von ' + fields.length + ' Einträgen richtig. ' + (complete
        ? 'Du hast die Verläufe entdeckt! Vergleiche jetzt deinen Hefteintrag mit der Regel darunter.'
        : 'Prüfe die markierten Einträge in der heruntergeladenen Periodensystem.pdf und versuche es erneut.');
    });
  });
  const scoreMission = answers => answers.length > 0 && answers.every(answer => checkDiscovery(answer.value, answer.expected));
  window.ElectronegativityPractice.scoreMission = scoreMission;
  function restoreElectronegativityTasks(progress,missions,seals){
    const tasks=progress?.modules?.atombindung?.tasks||{};
    missions.forEach((mission,index)=>{if(!tasks['elektronegativitaet-'+index]?.completed)return;mission.classList.add('correct');mission.querySelectorAll('input,select,button').forEach(field=>field.disabled=true);console.log('[Progress Restore] Aufgabe wiederhergestellt: elektronegativitaet/elektronegativitaet-'+index)});
    const count=missions.filter(item=>item.classList.contains('correct')).length;seals.textContent=count+' von 5 Laborsiegeln';
  }
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#en-practice');
    if (!form) return;
    const missions = [...form.querySelectorAll('[data-mission]')];
    const result = document.querySelector('#en-result');
    const seals = document.querySelector('#en-seals');
    const restore=progress=>restoreElectronegativityTasks(progress,missions,seals);
    if(window.BindungenProgressReady)window.BindungenProgressReady.then(restore);else document.addEventListener('bindungen-progress-ready',event=>restore(event.detail),{once:true});
    const readAnswers = mission => {
      if (mission.dataset.multiple) {
        return [{value: [...mission.querySelectorAll('input:checked')].map(field => field.value).sort().join(','), expected: mission.dataset.answer}];
      }
      if (mission.dataset.radio) {
        return [{value: mission.querySelector('input:checked')?.value || '', expected: mission.dataset.answer}];
      }
      return [...mission.querySelectorAll('[data-answer]')].map(field => ({
        value: field.dataset.radio ? field.querySelector('input:checked')?.value || '' : field.value,
        expected: field.dataset.answer
      }));
    };
    const clear = event => {
      const mission = event.target.closest('[data-mission]');
      if (!mission) return;
      mission.classList.remove('correct', 'incorrect');
      mission.querySelector('.test-answer-feedback')?.remove();
      result.textContent = '';
      result.className = 'worksheet-result';
      const confirmed = missions.filter(item => item.classList.contains('correct')).length;
      seals.textContent = confirmed + ' von 5 Laborsiegeln · Änderungen bitte erneut prüfen';
    };
    form.addEventListener('input', clear);
    form.addEventListener('change', clear);
    form.addEventListener('submit', event => {
      event.preventDefault();
      let points = 0;
      missions.forEach(mission => {
        const answers = readAnswers(mission);
        const correct = scoreMission(answers);
        if (correct) points++;
        mission.classList.toggle('correct', correct);
        mission.classList.toggle('incorrect', !correct);
        mission.querySelector('.test-answer-feedback')?.remove();
        const feedback = document.createElement('p');
        feedback.className = 'test-answer-feedback';
        feedback.textContent = correct ? '✓ Laborsiegel verdient! ' + mission.dataset.explanation
          : answers.some(answer => !answer.value.trim()) ? 'Ergänze zuerst alle Antworten in diesem Auftrag.'
          : 'Noch kein Siegel. ' + mission.dataset.hint;
        mission.appendChild(feedback);
      });
      const complete = points === missions.length;
      seals.textContent = points + ' von 5 Laborsiegeln';
      result.className = 'worksheet-result show ' + (complete ? 'passed' : 'retry');
      result.textContent = complete
        ? 'Alle fünf Laborsiegel gesammelt! Du kannst EN-Werte vergleichen, Bindungen einordnen und Teilladungen zuweisen.'
        : points + ' von 5 Aufträgen vollständig richtig. Nutze die Hinweise und verbessere die übrigen Aufträge.';
      if (complete) {
        missions.forEach((mission,index)=>BindungenProgress.completeTask('atombindung','elektronegativitaet-'+index));
        const progress = BindungenProgress.loadProgress();
        progress.elektronegativitaetAbgeschlossen = true;
        if (!progress.unlockedKnowledge.includes('elektronegativitaet')) progress.unlockedKnowledge.push('elektronegativitaet');
        BindungenProgress.saveProgress(progress);
      }
    });
  });
})();
