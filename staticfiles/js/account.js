document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ account.js chargé !");
    
    // ✅ Gestion de l'affichage des formulaires de modification
    const editButtons = document.querySelectorAll(".edit-btn");

    editButtons.forEach(button => {
        button.addEventListener("click", function () {
            let formId = this.getAttribute("data-form");
            let form = document.getElementById(formId);
            let textElement = this.previousElementSibling; // Texte affiché avant le formulaire

            console.log("🛠 Bouton cliqué :", this);
            console.log("🔍 Formulaire ciblé :", form);

            if (!form) {
                console.error("❌ Erreur : Formulaire introuvable pour ID :", formId);
                return;
            }

            if (form.style.display === "none" || form.style.display === "") {
                form.style.display = "block"; // ✅ Afficher le formulaire
                if (textElement) textElement.style.display = "none"; // ✅ Cacher le texte actuel
                this.textContent = "Annuler"; // ✅ Changer le texte du bouton
            } else {
                form.style.display = "none";
                if (textElement) textElement.style.display = "block";
                this.textContent = "Modifier"; // ✅ Remettre le bouton à "Modifier"
            }
        });
    });

    // ✅ Gestion de la mise à jour AJAX des champs (email, adresse, etc.)
    const editLinks = document.querySelectorAll(".edit-link");

    editLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const field = this.getAttribute("data-field");
            const fieldElement = document.getElementById(field);

            if (!fieldElement) {
                console.error("❌ Erreur : Élément introuvable pour le champ :", field);
                return;
            }

            const currentValue = fieldElement.innerText.trim();
            const newValue = prompt(`Entrez la nouvelle valeur pour ${field} :`, currentValue);

            if (newValue && newValue !== currentValue) {
                fetch("/account/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "X-CSRFToken": getCSRFToken()
                    },
                    body: `update_field=${field}&value=${encodeURIComponent(newValue)}`
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        fieldElement.innerText = newValue;
                    } else {
                        console.error("❌ Erreur serveur :", data.error);
                        alert("Erreur lors de la mise à jour : " + (data.error || "Erreur inconnue"));
                    }
                })
                .catch(error => {
                    console.error("❌ Problème de connexion :", error);
                    alert("Problème de connexion avec le serveur.");
                });
            }
        });
    });

    // ✅ Fonction pour récupérer le token CSRF
    function getCSRFToken() {
        let cookieValue = null;
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith("csrftoken=")) {
                cookieValue = decodeURIComponent(cookie.substring("csrftoken=".length));
                break;
            }
        }
        if (!cookieValue) console.error("❌ Erreur : Token CSRF introuvable !");
        return cookieValue;
    }
});
