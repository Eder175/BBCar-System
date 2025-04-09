document.getElementById("analisar-vendas").addEventListener("click", () => {
    const vendas = [
        { carro: "Carro 1", valor: 20000, data: "2025-04-01" },
        { carro: "Carro 2", valor: 30000, data: "2025-04-02" }
    ];

    let totalVendas = vendas.reduce((total, venda) => total + venda.valor, 0);
    let mediaVenda = totalVendas / vendas.length;

    let sugestao = mediaVenda < 25000
        ? "Sugestão: Ofereça promoções para aumentar o ticket médio."
        : "Sugestão: Foque em clientes de alta renda.";

    document.getElementById("resultado-analise").innerHTML = `
        <p>Total vendido: € ${totalVendas}</p>
        <p>Preço médio: € ${mediaVenda}</p>
        <p>${sugestao}</p>
    `;
});