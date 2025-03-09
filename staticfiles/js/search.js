document.getElementById("search-input").addEventListener("input", function() {
    let query = this.value.trim();
    if (query.length > 1) {  // Lancer la recherche après 2 lettres tapées
        fetch(`/search/?q=${query}`)
            .then(response => response.json())
            .then(data => {
                let resultsDiv = document.getElementById("search-results");
                resultsDiv.innerHTML = "";  // Nettoyer les anciens résultats
                data.results.forEach(item => {
                    let div = document.createElement("div");
                    div.innerHTML = `<a href="/shop/${item.id}/">${item.name}</a>`;
                    resultsDiv.appendChild(div);
                });
            });
    } else {
        document.getElementById("search-results").innerHTML = "";
    }
});
