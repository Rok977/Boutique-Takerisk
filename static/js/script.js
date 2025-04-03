// ✅ Script complet avec navbar fonctionnelle

document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ script.js chargé !");

  // ========================
  // 🔹 RESET GSAP ANIMATIONS 🔹
  // ========================
  if (typeof gsap !== 'undefined') {
    gsap.set('.nav-container', { clearProps: 'all' });
  }

  // ========================
  // 🔹 FONCTIONS UTILITAIRES 🔹
  // ========================
  function getCSRFToken() {
    let csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
    if (csrfTokenMeta) {
      return csrfTokenMeta.getAttribute("content");
    } else {
      let csrfForm = document.querySelector("#csrf-form input[name='csrfmiddlewaretoken']");
      return csrfForm ? csrfForm.value : null;
    }
  }

  // ========================
  // 🔹 GESTION DE NAVBAR (CORRIGÉ) 🔹
  // ========================
  function handleNavbar() {
    const nav = document.querySelector('.nav-container');
    if (!nav) {
      console.error("❌ Navbar introuvable");
      return;
    }

    const threshold = 20;
    let lastScroll = window.scrollY;
    let ticking = false;

    function updateNavbar() {
      const currentScroll = window.scrollY;
    
      // ✅ S'il n'y a PAS de scroll possible, on affiche la navbar direct
      if (document.body.scrollHeight <= window.innerHeight) {
        nav.classList.add('visible');
        return;
      }
    
      if (currentScroll <= threshold) {
        nav.classList.remove('visible');
      } else if (currentScroll > lastScroll) {
        nav.classList.add('visible');
      }
    
      lastScroll = currentScroll;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    }, { passive: true });

    // Initialisation
    updateNavbar();
  }

  // ========================
  // 🔹 GESTION DE COMPTE 🔹
  // ========================
  const editButtons = document.querySelectorAll(".edit-btn");
  editButtons.forEach(button => {
    button.addEventListener("click", function () {
      let formId = this.getAttribute("data-form");
      let form = document.getElementById(formId);
      let textElement = this.previousElementSibling;

      if (!form) {
        console.error("❌ Erreur : Formulaire introuvable !");
        return;
      }

      form.style.display = (form.style.display === "none" || form.style.display === "") ? "block" : "none";
      if (textElement)
        textElement.style.display = (form.style.display === "block") ? "none" : "block";
      this.textContent = (form.style.display === "block") ? "Annuler" : "Modifier";
    });
  });

  // ========================
  // 🔹 GESTION DU PANIER 🔹
  // ========================
  function updateCartCounter() {
    fetch("/cart/count/")
      .then(response => response.json())
      .then(data => {
        let cartCounter = document.getElementById("cart-counter");
        if (cartCounter) {
          cartCounter.textContent = data.count;
        } else {
          console.warn("❌ Erreur : Élément #cart-counter introuvable !");
        }
      })
      .catch(error => console.error("❌ Erreur mise à jour panier :", error));
  }

  function updateTotal() {
    let total = 0;
    document.querySelectorAll(".cart-item").forEach(item => {
      const price = parseFloat(item.querySelector(".item-price").textContent);
      const quantity = parseInt(item.querySelector(".item-qty").value) || 1;
      total += price * quantity;
    });
    document.getElementById("cart-total").textContent = total.toFixed(2);
  }

  function updateCart(productId, quantity) {
    fetch(`/update-cart/${productId}/${quantity}/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": getCSRFToken(),
        "X-Requested-With": "XMLHttpRequest"
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.status !== "success") {
          alert("❌ Erreur : " + data.message);
        }
      })
      .catch(error => {
        console.error("❌ Erreur AJAX :", error);
        alert("❌ Une erreur est survenue.");
      });
  }

  function changeQuantity(button, increment) {
    let input = increment ? button.previousElementSibling : button.nextElementSibling;
    let newValue = parseInt(input.value) + (increment ? 1 : -1);
    if (newValue < 1) return;
    input.value = newValue;
    updateTotal();

    let productId = button.closest(".cart-item").getAttribute("data-product-id");
    updateCart(productId, newValue);
  }

  // ========================
  // 🔹 GESTION DES ÉVÉNEMENTS 🔹
  // ========================
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("add-to-cart")) {
      event.preventDefault();
      let productId = event.target.getAttribute("data-product-id");

      if (!productId) {
        alert("Erreur : ID du produit introuvable !");
        return;
      }

      let csrfToken = getCSRFToken();
      if (!csrfToken) {
        alert("❌ Erreur : Impossible de récupérer le token CSRF !");
        return;
      }

      console.log(`🛒 Tentative d'ajout du produit ${productId} au panier...`);

      fetch(`/add-to-cart/${productId}/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfToken,
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === "success") {
            alert("✅ Produit ajouté au panier !");
            console.log("✅ Réponse AJAX :", data);
            updateCartCounter();
          } else {
            alert("❌ Erreur : " + data.message);
          }
        })
        .catch(error => {
          console.error("❌ Erreur AJAX :", error);
          alert("❌ Une erreur est survenue.");
        });
    }

    if (event.target.classList.contains("remove-item")) {
      let cartItem = event.target.closest(".cart-item");
      let productId = cartItem.getAttribute("data-product-id");

      fetch(`/remove-from-cart/${productId}/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": getCSRFToken(),
          "X-Requested-With": "XMLHttpRequest"
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === "success") {
            cartItem.remove();
            updateTotal();
          } else {
            alert("❌ Erreur : " + data.message);
          }
        })
        .catch(error => {
          console.error("❌ Erreur AJAX :", error);
          alert("❌ Une erreur est survenue.");
        });
    }
  });

  document.querySelectorAll(".increase-qty").forEach(button => {
    button.addEventListener("click", function () {
      changeQuantity(this, true);
    });
  });

  document.querySelectorAll(".decrease-qty").forEach(button => {
    button.addEventListener("click", function () {
      changeQuantity(this, false);
    });
  });

  // ========================
  // 🔹 GESTION DES FILTRES 🔹
  // ========================
  function applyFilters() {
    let filters = { category: [], color: [], size: [] };
    document.querySelectorAll(".filter-btn.active").forEach(button => {
      let type = button.getAttribute("data-filter");
      let value = button.getAttribute("data-value");
      if (!filters[type]) filters[type] = [];
      filters[type].push(value);
    });

    fetch(`/filter-products/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": getCSRFToken(),
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(filters)
    })
      .then(response => response.json())
      .then(data => updateProductList(data.products))
      .catch(error => console.error("❌ Erreur AJAX :", error));
  }

  function updateProductList(products) {
    let productList = document.getElementById("products-list");
    if (!productList) return;
    productList.innerHTML = products.length === 0 ? "<p>Aucun produit trouvé.</p>" : "";
    products.forEach(product => {
      productList.innerHTML += `
        <div class="product-card">
          <a href="/product/${product.id}/">
            <img src="${product.image}" alt="${product.name}">
          </a>
          <h3><a href="/product/${product.id}/">${product.name}</a></h3>
          <p class="price">${product.price}€</p>
          <p>Couleur: ${product.color}</p>
          <p>Taille: ${product.size}</p>
          <button class="buy-btn add-to-cart" data-product-id="${product.id}">Ajouter au panier</button>
        </div>`;
    });
  }

  document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", function () {
      this.classList.toggle("active");
      applyFilters();
    });
  });

  // ========================
  // 🔹 ACCORDÉON 🔹
  // ========================
  document.querySelectorAll(".accordion-header").forEach(header => {
    header.addEventListener("click", function () {
      let content = this.nextElementSibling;
      let isOpen = content.style.display === "block";
      document.querySelectorAll(".accordion-content").forEach(c => c.style.display = "none");
      content.style.display = isOpen ? "none" : "block";
    });
  });

  // ========================
  // 🔹 INITIALISATION 🔹
  // ========================
  handleNavbar(); // Initialisation de la navbar
  updateCartCounter(); // Mise à jour du compteur de panier

  console.log("✅ Toutes les fonctions ont été initialisées !");
});