document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ script.js chargé !");

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
            if (textElement) textElement.style.display = (form.style.display === "block") ? "none" : "block";
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
    
    // Met à jour au chargement
    updateCartCounter();
    
    // Rafraîchir après chaque ajout au panier
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("add-to-cart")) {
            setTimeout(updateCartCounter, 500);  // Mise à jour après ajout
        }
    });

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
                    "X-Requested-With": "XMLHttpRequest", // Correction de l'en-tête
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({})
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert("✅ Produit ajouté au panier !");
                    console.log("✅ Réponse AJAX :", data);
                    updateCartCounter(); // ✅ Mise à jour du compteur immédiatement après l'ajout
                } else {
                    alert("❌ Erreur : " + data.message);
                }
            })
            .catch(error => {
                console.error("❌ Erreur AJAX :", error);
                alert("❌ Une erreur est survenue.");
            });
        }
    }); // <-- Fermeture correcte de la fonction

    // ========================
    // 🔹 MODIFIER LA QUANTITÉ D'UN PRODUIT 🔹
    // ========================
    function changeQuantity(button, increment) {
        let input = increment ? button.previousElementSibling : button.nextElementSibling;
        let newValue = parseInt(input.value) + (increment ? 1 : -1);
        if (newValue < 1) return;
        input.value = newValue;
        updateTotal();

        let productId = button.closest(".cart-item").getAttribute("data-product-id");
        updateCart(productId, newValue);
    }

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
    // 🔹 SUPPRIMER UN PRODUIT DU PANIER 🔹
    // ========================
    document.querySelectorAll(".remove-item").forEach(button => {
        button.addEventListener("click", function () {
            let cartItem = this.closest(".cart-item");
            let productId = cartItem.getAttribute("data-product-id");

            fetch(`/remove-from-cart/${productId}/`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                    "X-Requested-With": "XMLHttpRequest" // Correction de l'en-tête
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
        });
    });

    // ========================
    // 🔹 MISE À JOUR DU TOTAL DU PANIER 🔹
    // ========================
    function updateTotal() {
        let total = 0;
        document.querySelectorAll(".cart-item").forEach(item => {
            const price = parseFloat(item.querySelector(".item-price").textContent);
            const quantity = parseInt(item.querySelector(".item-qty").value) || 1;
            total += price * quantity;
        });
        document.getElementById("cart-total").textContent = total.toFixed(2);
    }

    // ========================
    // 🔹 FONCTION POUR METTRE À JOUR LE PANIER 🔹
    // ========================
    function updateCart(productId, quantity) {
        fetch(`/update-cart/${productId}/${quantity}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCSRFToken(),
                "X-Requested-With": "XMLHttpRequest" // Correction de l'en-tête
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

    console.log("✅ script.js chargé !");

    // ========================
    // 🔹 GESTION DU PAIEMENT STRIPE 🔹
    // ========================
    const stripeForm = document.querySelector("#stripe-payment-form");
    if (stripeForm) {
        stripeForm.addEventListener("submit", function (event) {
            event.preventDefault();  // ✅ Empêche l’envoi standard du formulaire
    
            fetch(stripeForm.action, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                    "X-Requested-With": "XMLHttpRequest"
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.redirect_url) {
                    console.log("🔗 URL Stripe reçue :", data.redirect_url);
    
                    // ✅ Redirection forcée vers Stripe
                    window.location.replace(data.redirect_url);
                } else {
                    alert("❌ Erreur Stripe : " + (data.error || "Aucune URL de redirection reçue."));
                }
            })
            .catch(error => {
                console.error("❌ Erreur Stripe AJAX :", error);
                alert("❌ Impossible de traiter le paiement.");
            });
        });
    }
    
    // ========================
    // 🔹 FONCTION CSRF TOKEN 🔹
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
    // 🔹 GESTION DES POPUPS 🔹
    // ========================
    function setupPopup(triggerId, popupId) {
        const triggerButton = document.getElementById(triggerId);
        const popup = document.getElementById(popupId);
        const closeButton = popup ? popup.querySelector(".close-btn") : null;

        if (triggerButton && popup) {
            triggerButton.addEventListener("click", function () {
                popup.style.display = "flex";
                popup.style.opacity = "1";
                popup.style.visibility = "visible";
                popup.style.transform = "translate(-50%, -50%) scale(1)";
            });
        }

        if (closeButton && popup) {
            closeButton.addEventListener("click", function () {
                popup.style.opacity = "0";
                popup.style.visibility = "hidden";
                popup.style.transform = "translate(-50%, -50%) scale(0.9)";
                setTimeout(() => { popup.style.display = "none"; }, 500);
            });

            popup.addEventListener("click", function (event) {
                if (event.target === popup) {
                    popup.style.opacity = "0";
                    popup.style.visibility = "hidden";
                    popup.style.transform = "translate(-50%, -50%) scale(0.9)";
                    setTimeout(() => { popup.style.display = "none"; }, 500);
                }
            });
        }
    }

    setupPopup("openAuthPopup", "authPopup");
    setupPopup("openRegisterPopup", "registerPopup");

    // ========================
    // 🔹 EFFET DE FONDU AU CHANGEMENT DE PAGE 🔹
    // ========================
    const body = document.body;
    let blackScreen = document.createElement("div");
    blackScreen.id = "black-screen";
    document.body.appendChild(blackScreen);

    body.classList.add("fade");

    document.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", function (event) {
            const href = this.getAttribute("href");

            if (href && !href.startsWith("#") && !href.startsWith("mailto") && !href.startsWith("tel")) {
                event.preventDefault();
                blackScreen.classList.add("active");
                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            }
        });
    });

    window.addEventListener("pageshow", function (event) {
        if (event.persisted) {
            console.log("🔄 Retour en arrière détecté, suppression de l'effet de transition noir.");
            document.getElementById("black-screen").classList.remove("active");
        }
    });

    // ========================
    // 🔹 GESTION DES FILTRES AVEC BOUTONS 🔹
    // ========================
    const filterButtons = document.querySelectorAll(".filter-btn");

    filterButtons.forEach(button => {
        button.addEventListener("click", function () {
            this.classList.toggle("active"); // ✅ Active/désactive le bouton

            applyFilters(); // ✅ Met à jour les produits avec les nouveaux filtres
        });
    });

    function applyFilters() {
        let filters = {
            category: [],
            color: [],
            size: []
        };

        // ✅ Récupère les filtres activés
        document.querySelectorAll(".filter-btn.active").forEach(button => {
            let type = button.getAttribute("data-filter");
            let value = button.getAttribute("data-value");

            if (!filters[type]) {
                filters[type] = [];
            }
            filters[type].push(value);
        });

        console.log("🔍 Filtres appliqués :", filters);

        // ✅ Envoi des filtres via AJAX
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
        .then(data => {
            updateProductList(data.products);
        })
        .catch(error => {
            console.error("❌ Erreur AJAX :", error);
        });
    }

    function updateProductList(products) {
        let productList = document.getElementById("products-list");

        if (!productList) {
            console.error("❌ Erreur : L'élément #products-list est introuvable !");
            return;
        }

        productList.innerHTML = ""; // ✅ On vide la liste des produits

        if (products.length === 0) {
            productList.innerHTML = "<p>Aucun produit trouvé.</p>";
            return;
        }

        products.forEach(product => {
            let productCard = `
                <div class="product-card" data-category="${product.category}" data-color="${product.color}" data-size="${product.size}">
                    <a href="/product/${product.id}/">
                        <img src="${product.image}" alt="${product.name}">
                    </a>
                    <h3><a href="/product/${product.id}/">${product.name}</a></h3>
                    <p class="price">${product.price}€</p>
                    <p>Couleur: ${product.color}</p>
                    <p>Taille: ${product.size}</p>
                    <button class="buy-btn add-to-cart" data-product-id="${product.id}">Ajouter au panier</button>
                </div>`;
            productList.innerHTML += productCard;
        });

        console.log("✅ Produits mis à jour !");
    }

    // ========================
    // 🔹 GESTION DES FILTRES PAR URL (Mise à jour de l'URL) 🔹
    // ========================
    function updateURLFilters() {
        let params = new URLSearchParams(window.location.search);

        // ✅ Suppression des anciens filtres
        params.delete("category");
        params.delete("color");
        params.delete("size");

        // ✅ Ajout des nouveaux filtres activés
        document.querySelectorAll(".filter-btn.active").forEach(button => {
            let type = button.getAttribute("data-filter");
            let value = button.getAttribute("data-value");
            params.append(type, value);
        });

        // ✅ Mise à jour de l'URL sans recharger la page
        let newURL = window.location.pathname + "?" + params.toString();
        window.history.pushState({}, "", newURL);
        
        applyFilters(); // Recharge dynamiquement les produits avec les filtres sélectionnés
    }

    // ✅ Mise à jour des filtres à chaque activation/désactivation d'un bouton
    document.querySelectorAll(".filter-btn").forEach(button => {
        button.addEventListener("click", updateURLFilters);
    });

    // ✅ Appliquer les filtres de l'URL au chargement
    function applyURLFilters() {
        let params = new URLSearchParams(window.location.search);

        document.querySelectorAll(".filter-btn").forEach(button => {
            let type = button.getAttribute("data-filter");
            let value = button.getAttribute("data-value");

            if (params.has(type) && params.getAll(type).includes(value)) {
                button.classList.add("active"); // ✅ Active les boutons correspondant aux filtres dans l'URL
            }
        });

        applyFilters();
    }

    applyURLFilters(); // ✅ Appliquer les filtres au chargement de la page

    // ========================
    // 🔹 ACCORDEON  🔹
    // ========================
    document.querySelectorAll(".accordion-header").forEach(header => {
        header.addEventListener("click", function () {
            let content = this.nextElementSibling;

            if (content.style.display === "block") {
                content.style.display = "none"; // ✅ Ferme l'accordéon
            } else {
                document.querySelectorAll(".accordion-content").forEach(c => c.style.display = "none");
                content.style.display = "block"; // ✅ Ouvre l'accordéon actuel
            }
        });
    });

    // ========================
    // 🔹 SYNCHRONISATION DU PANIER 🔹
    // ========================
    function syncCartAfterLogin() {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (cart.length > 0) {
            fetch("/sync-cart/", {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ cart: cart })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    localStorage.removeItem("cart"); // Supprimer le panier local après synchronisation
                    updateCartCounter();
                }
            })
            .catch(error => {
                console.error("❌ Erreur AJAX :", error);
            });
        }
    }

    // Appeler cette fonction après une connexion réussie
    syncCartAfterLogin();

    // ========================
    // 🔹 ANIMATION D'INTRODUCTION 🔹
    // ========================
    const intro = document.querySelector(".glitch-container");
    intro.style.opacity = "0";
    intro.style.transform = "translateY(50px)";
    
    setTimeout(() => {
        intro.style.opacity = "1";
        intro.style.transform = "translateY(0)";
        intro.style.transition = "opacity 1s ease-out, transform 1s ease-out";
    }, 300);
});