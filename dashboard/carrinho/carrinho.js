document.addEventListener("DOMContentLoaded", () => {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalElement = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");
    const clearCartBtn = document.getElementById("clear-cart-btn");

    // Carrega os itens do carrinho
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Função para atualizar o carrinho
    function updateCart() {
        cartItemsContainer.innerHTML = "";
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price;
            const itemElement = document.createElement("div");
            itemElement.className = "cart-item";
            itemElement.innerHTML = `
                <p>${item.name} - € ${item.price.toFixed(2)}</p>
                <button onclick="removeFromCart(${index})">Remover</button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        cartTotalElement.textContent = total.toFixed(2);
    }

    // Função para remover item do carrinho
    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCart();
    };

    // Função para limpar o carrinho
    clearCartBtn.addEventListener("click", () => {
        cart = [];
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCart();
        alert("Carrinho limpo com sucesso!");
    });

    // Função para finalizar compra
    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Seu carrinho está vazio!");
            return;
        }

        // Simula uma venda
        const vendas = JSON.parse(localStorage.getItem("vendas")) || [];
        cart.forEach(item => {
            vendas.push({
                carro: item.name,
                valor: item.price,
                data: new Date().toISOString().split("T")[0]
            });
        });
        localStorage.setItem("vendas", JSON.stringify(vendas));

        // Limpa o carrinho
        cart = [];
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCart();
        alert("Compra finalizada com sucesso!");
    });

    // Atualiza o carrinho na inicialização
    updateCart();
});