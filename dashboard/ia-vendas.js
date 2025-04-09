document.getElementById("analisar-vendas").addEventListener("click", () => {
    // Carrega as vendas do localStorage (simulação de vendas reais)
    const vendas = JSON.parse(localStorage.getItem("vendas")) || [
        { carro: "Carro 1", valor: 20000, data: "2025-04-01" },
        { carro: "Carro 2", valor: 30000, data: "2025-04-02" }
    ];

    // Calcula métricas
    const totalVendas = vendas.reduce((total, venda) => total + venda.valor, 0);
    const mediaVenda = totalVendas / vendas.length;

    // Análise avançada
    const vendasRecentes = vendas.filter(venda => {
        const vendaDate = new Date(venda.data);
        const today = new Date();
        const diffDays = (today - vendaDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 30; // Vendas dos últimos 30 dias
    });

    const ticketMedioRecente = vendasRecentes.length > 0
        ? vendasRecentes.reduce((total, venda) => total + venda.valor, 0) / vendasRecentes.length
        : 0;

    // Sugestões baseadas em análise
    let sugestao = "";
    if (mediaVenda < 25000) {
        sugestao = "Sugestão: Ofereça promoções para aumentar o ticket médio.";
    } else if (ticketMedioRecente > mediaVenda * 1.2) {
        sugestao = "Sugestão: Aproveite o aumento recente no ticket médio para focar em clientes de alta renda.";
    } else {
        sugestao = "Sugestão: Mantenha a estratégia atual, mas explore novos mercados.";
    }

    // Exibe os resultados
    document.getElementById("resultado-analise").innerHTML = `
        <p>Total vendido: € ${totalVendas.toFixed(2)}</p>
        <p>Preço médio (geral): € ${mediaVenda.toFixed(2)}</p>
        <p>Preço médio (últimos 30 dias): € ${ticketMedioRecente.toFixed(2)}</p>
        <p>${sugestao}</p>
    `;
});