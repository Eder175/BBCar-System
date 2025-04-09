// Função para gerar links únicos para afiliados
function gerarLinkAfiliado(idAfiliado) {
    return `https://bbcar.com/loja?ref=${idAfiliado}`;
}

// Carrega o ID do afiliado do localStorage
const idAfiliado = localStorage.getItem("idAfiliado") || "12345"; // ID fictício se não houver
const linkAfiliado = gerarLinkAfiliado(idAfiliado);

// Carrega os dados dos afiliados
let afiliados = JSON.parse(localStorage.getItem("afiliados")) || [];
let currentAfiliado = afiliados.find(afiliado => afiliado.id === idAfiliado) || {
    clicks: 15,
    conversions: 5,
    earnings: 1500
};

// Atualiza as métricas automaticamente a cada 5 segundos
setInterval(() => {
    currentAfiliado.clicks += Math.floor(Math.random() * 5);
    currentAfiliado.conversions += Math.floor(Math.random() * 2);
    currentAfiliado.earnings += currentAfiliado.conversions * 50;

    // Atualiza o localStorage
    afiliados = afiliados.map(af => af.id === idAfiliado ? currentAfiliado : af);
    localStorage.setItem("afiliados", JSON.stringify(afiliados));

    document.getElementById("clicks").textContent = currentAfiliado.clicks;
    document.getElementById("conversions").textContent = currentAfiliado.conversions;
    document.getElementById("earnings").textContent = `€ ${currentAfiliado.earnings.toFixed(2)}`;
}, 5000);

// Exibe o link único e a tabela de afiliados no painel
document.addEventListener("DOMContentLoaded", () => {
    // Atualiza o link de afiliado
    const linkElement = document.getElementById("affiliate-link");
    if (linkElement) {
        linkElement.textContent = linkAfiliado;
        linkElement.href = linkAfiliado;
    }

    // Atualiza as métricas iniciais
    document.getElementById("clicks").textContent = currentAfiliado.clicks;
    document.getElementById("conversions").textContent = currentAfiliado.conversions;
    document.getElementById("earnings").textContent = `€ ${currentAfiliado.earnings.toFixed(2)}`;

    // Exibe a tabela de afiliados
    const tableBody = document.getElementById("affiliates-table-body");
    if (tableBody) {
        tableBody.innerHTML = "";
        afiliados.forEach(afiliado => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${afiliado.id}</td>
                <td>${afiliado.name}</td>
                <td>${afiliado.email}</td>
                <td>${afiliado.clicks}</td>
                <td>${afiliado.conversions}</td>
                <td>€ ${afiliado.earnings.toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });
    }
});