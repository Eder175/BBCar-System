document.addEventListener("DOMContentLoaded", () => {
    const affiliatesTable = document.getElementById("affiliates-table");
    const cliquesElement = document.getElementById("cliques");
    const conversoesElement = document.getElementById("conversoes");
    const ganhosElement = document.getElementById("ganhos");
    const affiliateLinkElement = document.getElementById("affiliate-link");

    // Carrega os afiliados do localStorage
    let affiliates = JSON.parse(localStorage.getItem("affiliates")) || [];

    // Função para atualizar as métricas
    function updateMetrics() {
        let totalCliques = 0;
        let totalConversoes = 0;
        let totalGanhos = 0;

        affiliates.forEach(affiliate => {
            totalCliques += affiliate.cliques;
            totalConversoes += affiliate.conversoes;
            totalGanhos += affiliate.ganhos;
        });

        cliquesElement.textContent = totalCliques;
        conversoesElement.textContent = totalConversoes;
        ganhosElement.textContent = totalGanhos.toFixed(2);

        // Atualiza a tabela de afiliados
        affiliatesTable.innerHTML = "";
        affiliates.forEach(affiliate => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${affiliate.id}</td>
                <td>${affiliate.name}</td>
                <td>${affiliate.email}</td>
                <td>${affiliate.cliques}</td>
                <td>${affiliate.conversoes}</td>
                <td>€ ${affiliate.ganhos.toFixed(2)}</td>
            `;
            affiliatesTable.appendChild(row);
        });

        // Atualiza o link de afiliado (exemplo fixo por enquanto)
        affiliateLinkElement.textContent = `https://bbcar.com/loja?ref=${affiliates.length > 0 ? affiliates[0].id : "12345"}`;
    }

    // Atualiza as métricas a cada 5 segundos
    setInterval(updateMetrics, 5000);
    updateMetrics();
});