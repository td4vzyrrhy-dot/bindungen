(function(){
  const AUTH_KEY='chemieBindungenDevAuth';
  const CLASS_CODE='CHEMIE9B';
  const normalizeCode=code=>String(code||'').trim().toUpperCase();
  function getCurrentStudent(){try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'null')}catch{return null}}
  function localStudent(){return {loggedIn:true,classCode:CLASS_CODE,studentId:CLASS_CODE,mode:'local'}}
  try{const current=getCurrentStudent();if(current?.mode==='firebase'||current?.uid)localStorage.setItem(AUTH_KEY,JSON.stringify(localStudent()))}catch{}
  async function loginWithStudentCode(code){const studentCode=normalizeCode(code);if(!studentCode)throw new Error('Bitte gib einen Zugangscode ein.');if(studentCode!==CLASS_CODE)throw new Error('Dieser Klassencode ist nicht gültig.');const student=localStudent();localStorage.setItem(AUTH_KEY,JSON.stringify(student));console.log('[Auth Local] Klassencode akzeptiert');return student}
  async function logout(){localStorage.removeItem(AUTH_KEY);console.log('[Auth Local] Sitzung beendet – Lernstand bleibt auf diesem Tablet gespeichert')}
  function isLoggedIn(){const student=getCurrentStudent();return Boolean(student?.loggedIn===true&&student.classCode===CLASS_CODE)}
  function requireLogin(){/* Später aktivieren: if(!isLoggedIn()) location.replace('index.html?login=required'); */return isLoggedIn()}
  window.BindungenAuth={loginWithStudentCode,logout,isLoggedIn,getCurrentStudent,requireLogin};
})();
