// Smooth scrolling pour les liens d'ancrage
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
  
  // Effet sur le header lors du scroll (ajoute la classe "scrolled" après 50px)
  window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
  
  // Effets de survol pour les boutons de filtre
  document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.05)';
      button.style.transition = 'transform 0.3s ease';
    });
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });
  });
  
  // Animation de la barre de recherche lors du focus/blur
  const searchBar = document.querySelector('.search-bar');
  searchBar.addEventListener('focus', () => {
    searchBar.style.transform = 'scale(1.02)';
    searchBar.style.transition = 'transform 0.3s ease';
  });
  searchBar.addEventListener('blur', () => {
    searchBar.style.transform = 'scale(1)';
  });
  
  // Animation pour le bouton "Afficher plus"
  const moreButton = document.querySelector('.more-button');
  moreButton.addEventListener('mouseenter', () => {
    moreButton.style.transform = 'scale(1.05)';
    moreButton.style.transition = 'transform 0.3s ease';
  });
  moreButton.addEventListener('mouseleave', () => {
    moreButton.style.transform = 'scale(1)';
  });
  
  // Animation sur les liens du footer
  document.querySelectorAll('footer a').forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.color = '#0065FC';
      link.style.transition = 'color 0.3s ease';
    });
    link.addEventListener('mouseleave', () => {
      link.style.color = 'black';
    });
  });
  
  // Effet de survol sur les hébergements populaires
  document.querySelectorAll('.popular .card').forEach(accommodation => {
    accommodation.addEventListener('mouseenter', () => {
      accommodation.style.transform = 'scale(1.02)';
      accommodation.style.transition = 'transform 0.3s ease';
    });
    accommodation.addEventListener('mouseleave', () => {
      accommodation.style.transform = 'scale(1)';
    });
  });
  
  // Effet de survol sur les activités
  document.querySelectorAll('.activity-card').forEach(activity => {
    activity.addEventListener('mouseenter', () => {
      activity.style.transform = 'scale(1.02)';
      activity.style.transition = 'transform 0.3s ease';
    });
    activity.addEventListener('mouseleave', () => {
      activity.style.transform = 'scale(1)';
    });
  });
  
  // Effet fade-in du body lors du chargement de la page
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });
  
  // Animation des sections au scroll (fade-in)
  document.addEventListener("DOMContentLoaded", function() {
    const sections = document.querySelectorAll("section");
    sections.forEach(section => {
      section.style.opacity = "0";
      section.style.transition = "opacity 0.8s ease-in-out";
    });
  
    window.addEventListener("scroll", () => {
      sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < window.innerHeight - 100) {
          section.style.opacity = "1";
        }
      });
    });
  });
  
  // Curseur personnalisé en bleu
  const customCursor = document.getElementById("custom-cursor");
  // Assurez-vous que le curseur est en bleu
  customCursor.style.backgroundColor = "#0065FC";
  document.addEventListener("mousemove", e => {
    customCursor.style.left = e.pageX + "px";
    customCursor.style.top = e.pageY + "px";
  });
  
  // Effet d'agrandissement du curseur sur les éléments interactifs
  document.querySelectorAll('a, button, .card, .filter-button').forEach(el => {
    el.addEventListener("mouseenter", () => {
      customCursor.style.transform = "scale(2)";
    });
    el.addEventListener("mouseleave", () => {
      customCursor.style.transform = "scale(1)";
    });
  });
  