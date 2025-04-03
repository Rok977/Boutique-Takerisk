document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector('.nav-container');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      nav.classList.add('visible');
    } else {
      nav.classList.remove('visible');
    }
  });
  
  // Animation du logo au chargement
  setTimeout(() => {
    if (window.scrollY > 20) {
      nav.classList.add('visible');
    }
  }, 100);
});