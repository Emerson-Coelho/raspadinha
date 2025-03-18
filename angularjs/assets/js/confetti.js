/**
 * Wrapper para o canvas-confetti
 * Esta versão funciona com script tradicional, sem necessidade de módulos ES6
 */

// Verificar se o canvas-confetti já está disponível
if (typeof confetti === 'undefined') {
  console.error('Erro: canvas-confetti não está carregado. Certifique-se de incluir o script confetti.browser.min.js antes deste arquivo.');
}

// Wrapper para controlar o confetti
var confettiHelper = (function() {
  // Opções padrão para o confetti
  var defaultOptions = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    disableForReducedMotion: true
  };
  
  // Função para disparar confetti com opções personalizadas
  function fire(options) {
    if (typeof confetti === 'undefined') {
      console.error('Erro: canvas-confetti não está disponível');
      return;
    }
    
    var mergedOptions = Object.assign({}, defaultOptions, options || {});
    return confetti(mergedOptions);
  }
  
  // Dispara confetti de vitória
  function victory() {
    var duration = 3000;
    var end = Date.now() + duration;
    
    function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#14b8a6', '#0d9488']
      });
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#14b8a6', '#0d9488']
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }
    
    frame();
    
    // Explosão final
    setTimeout(function() {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10b981', '#14b8a6', '#0d9488', '#fcd34d', '#f59e0b']
      });
    }, duration - 300);
  }
  
  // Dispara explosão única de confetti
  function burst(options) {
    var burstOptions = {
      particleCount: 80,
      spread: 100,
      colors: ['#14b8a6', '#0d9488', '#fcd34d', '#f59e0b', '#d946ef']
    };
    
    return fire(Object.assign({}, burstOptions, options || {}));
  }
  
  // Confetti em cascata do topo
  function rain(duration) {
    var end = Date.now() + (duration || 2000);
    var colors = ['#14b8a6', '#0d9488', '#fcd34d', '#f59e0b'];
    
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 130,
        spread: 80,
        origin: { x: Math.random(), y: -0.1 },
        colors: colors
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }
  
  // Disparar várias vezes com atraso
  function multi(count, interval) {
    var fires = count || 3;
    var interval = interval || 500;
    var currentFire = 0;
    
    var timer = setInterval(function() {
      burst({
        particleCount: 60,
        origin: { 
          x: 0.2 + Math.random() * 0.6, 
          y: 0.5 + Math.random() * 0.1 
        }
      });
      
      currentFire++;
      
      if (currentFire >= fires) {
        clearInterval(timer);
      }
    }, interval);
  }
  
  // Limpar o canvas
  function reset() {
    if (typeof confetti.reset === 'function') {
      confetti.reset();
    }
  }
  
  // API pública
  return {
    fire: fire,
    victory: victory,
    burst: burst,
    rain: rain,
    multi: multi,
    reset: reset
  };
})();

// Adicionar ao escopo global
window.confettiHelper = confettiHelper; 