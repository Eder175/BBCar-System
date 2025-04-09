// Função para exibir notificações
function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    document.body.appendChild(notification);

    // Estilizar a notificação (adicionaremos o CSS depois)
    notification.style.position = "fixed";
    notification.style.top = "20px";
    notification.style.right = "20px";
    notification.style.background = "#4CAF50";
    notification.style.color = "white";
    notification.style.padding = "10px 20px";
    notification.style.borderRadius = "5px";
    notification.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
    notification.style.zIndex = "1000";

    // Remover a notificação após 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Exibir notificação ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    showNotification("Bem-vindo ao Dashboard BBcar!");
});

// Integrar com o botão "Analisar Vendas"
document.addEventListener("DOMContentLoaded", () => {
    const analisarVendasBtn = document.getElementById("analisar-vendas");
    if (analisarVendasBtn) {
        analisarVendasBtn.addEventListener("click", () => {
            showNotification("Análise de vendas concluída!");
        });
    }
});