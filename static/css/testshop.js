document.addEventListener("DOMContentLoaded", () => {
    // Gestion des filtres
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        // Ici vous pourriez ajouter la logique pour filtrer les produits
      });
    });
    
    // Gestion du tri
    const sortSelect = document.getElementById('sort');
    sortSelect.addEventListener('change', () => {
      // Ici vous pourriez ajouter la logique pour trier les produits
      console.log('Tri sélectionné:', sortSelect.value);
    });
    
    // Gestion de l'ajout au panier
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const productName = button.closest('.product-card').querySelector('.product-name').textContent;
        
        // Mettre à jour le compteur du panier
        const cartCounter = document.getElementById('cart-counter');
        let currentCount = parseInt(cartCounter.textContent);
        cartCounter.textContent = currentCount + 1;
        
        // Animation
        button.textContent = 'Ajouté !';
        setTimeout(() => {
          button.textContent = 'Ajouter au panier';
        }, 2000);
        
        console.log(`Produit ajouté: ${productName}`);
      });
    });
    
    // Gestion de la wishlist
    const wishlistButtons = document.querySelectorAll('.add-to-wishlist');
    wishlistButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const icon = button.querySelector('i');
        icon.classList.toggle('far');
        icon.classList.toggle('fas');
        
        if (icon.classList.contains('fas')) {
          console.log('Produit ajouté à la wishlist');
        } else {
          console.log('Produit retiré de la wishlist');
        }
      });
    });
    
    // Gestion de la pagination
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    paginationButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (!button.classList.contains('active') && !button.classList.contains('next')) {
          paginationButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          // Ici vous pourriez charger la page correspondante
        }
      });
    });
  });