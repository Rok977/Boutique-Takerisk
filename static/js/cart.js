document.addEventListener("DOMContentLoaded", function () {
    function updateTotal() {
        let total = 0;
        document.querySelectorAll(".cart-item").forEach(item => {
            const price = parseFloat(item.querySelector(".item-price").textContent);
            const quantity = parseInt(item.querySelector(".item-qty").value);
            total += price * quantity;
        });
        document.getElementById("cart-total").textContent = total.toFixed(2);
    }

    document.querySelectorAll(".increase-qty").forEach(button => {
        button.addEventListener("click", function () {
            let input = this.previousElementSibling;
            let newValue = parseInt(input.value) + 1;
            input.value = newValue;
            updateTotal();
        });
    });

    document.querySelectorAll(".decrease-qty").forEach(button => {
        button.addEventListener("click", function () {
            let input = this.nextElementSibling;
            if (parseInt(input.value) > 1) {
                let newValue = parseInt(input.value) - 1;
                input.value = newValue;
                updateTotal();
            }
        });
    });

    updateTotal();
});
