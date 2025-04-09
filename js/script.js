document.addEventListener("DOMContentLoaded", function() {
    // Atualização de métricas no Dashboard
    let totalSales = 150; 
    let totalRevenue = 350000; 
    let activeCustomers = 89; 

    if (document.getElementById("total-sales")) {
        document.getElementById("total-sales").textContent = totalSales;
    }
    
    if (document.getElementById("total-revenue")) {
        document.getElementById("total-revenue").textContent = "€ " + totalRevenue.toLocaleString();
    }

    if (document.getElementById("active-customers")) {
        document.getElementById("active-customers").textContent = activeCustomers;
    }

    if (document.getElementById("cars-for-sale")) {
        document.getElementById("cars-for-sale").textContent = 120;
    }

    if (document.getElementById("monthly-sales")) {
        document.getElementById("monthly-sales").textContent = 35;
    }

    if (document.getElementById("best-seller")) {
        document.getElementById("best-seller").textContent = "João Ferreira";
    }

    if (document.getElementById("average-price")) {
        document.getElementById("average-price").textContent = "€ 22.500";
    }

    // Processamento do formulário de venda de veículos
    const sellCarForm = document.getElementById("sell-car-form");
    if (sellCarForm) {
        sellCarForm.addEventListener("submit", function(event) {
            event.preventDefault();

            // Capturar dados do formulário
            const carModel = document.getElementById("car-model").value;
            const carYear = document.getElementById("car-year").value;
            const carPhoto = document.getElementById("car-photo").files[0];

            // Simular envio
            alert(`Obrigado por enviar as informações do seu veículo!\nModelo: ${carModel}\nAno: ${carYear}`);
            console.log("Dados do carro enviado:", { carModel, carYear, carPhoto });
        });
    }
});