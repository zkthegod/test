(function(){
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
  if(prefersDark.matches){ document.documentElement.style.background='#0f1220'; }
})();