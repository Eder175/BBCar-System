// Função para gerar links únicos para afiliados
function gerarLinkAfiliado(idAfiliado) {
    return `https://bbcar.com/loja?ref=${idAfiliado}`;
}

// ID do afiliado (simulação de exemplo, será carregado após cadastro no futuro)
const idAfiliado = localStorage.getItem("idAfiliado") || "12345"; // Se não estiver logado, usa ID fictício
const linkAfiliado = gerarLinkAfiliado(idAfiliado);

// Atualizações dinâmicas de métricas
let clicks = 15;
let conversions = 5;
let earnings = 1500;

// Atualiza as métricas automaticamente a cada 5 segundos
setInterval(() => {
    clicks += Math.floor(Math.random() * 5);
    conversions += Math.floor(Math.random() * 2);
    earnings += conversions * 50;

    document.getElementById("clicks").textContent = clicks;
    document.getElementById("conversions").textContent = conversions;
    document.getElementById("earnings").textContent = `€ ${earnings.toFixed(2)}`;
}, 5000);

// Exibe o link único no painel
document.addEventListener("DOMContentLoaded", () => {
    const linkElement = document.getElementById("affiliate-link");
    if (linkElement) {
        linkElement.textContent = linkAfiliado;
        linkElement.href = linkAfiliado; // Torna o link clicável
    }
});