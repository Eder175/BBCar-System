// Função para enviar notificação de venda
function enviarNotificacao(venda) {
    let destinatarios = ["eder@email.com", "thiago@email.com"];
    let assunto = `Novo Carro Vendido: ${venda.modelo}`;
    let mensagem = `🚗 Um novo carro foi vendido!\n\nModelo: ${venda.modelo}\nPreço: € ${venda.preco}\nComprador: ${venda.comprador}\nData: ${venda.data}\n\nConfira os detalhes no Dashboard BBcar!`;

    destinatarios.forEach(email => {
        console.log(`📩 Enviando e-mail para: ${email}`);
        console.log(`Assunto: ${assunto}`);
        console.log(`Mensagem: ${mensagem}`);
    });

    alert("🚀 Venda registrada! Notificação enviada!");
}

// Simulação de venda registrada no sistema
document.addEventListener("DOMContentLoaded", function() {
    let botaoVender = document.getElementById("registrar-venda");
    if (botaoVender) {
        botaoVender.addEventListener("click", function() {
            let venda = {
                modelo: "Audi A3",
                preco: 22000,
                comprador: "Carlos Silva",
                data: new Date().toLocaleDateString()
            };
            enviarNotificacao(venda);
        });
    }
});