const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 3000;

// Middleware para CORS e parsear JSON
app.use(cors());
app.use(express.json());

// Endpoint para enviar mensagens à IA
app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: [
                    { role: "system", content: "Você é a IA da BBcar, uma plataforma de compra e venda de carros. Ajude os usuários a vender ou comprar carros, analise preços de mercado, e forneça respostas úteis e naturais. Use um tom amigável e profissional." },
                    { role: "user", content: message },
                ],
                max_tokens: 500,
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const reply = response.data.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error("Erro ao enviar mensagem para a OpenAI:", error.message);
        res.status(500).json({ error: "Erro ao processar a mensagem. Tente novamente." });
    }
});

// Endpoint para análise de preços de carros
app.post("/api/analyze-car", async (req, res) => {
    const carData = req.body;

    // Simulação de busca de preços (substituir por API real no futuro)
    let basePrice;
    const currentYear = new Date().getFullYear();
    const carAge = currentYear - parseInt(carData.ano);

    // Definir faixas de preço realistas com base no ano do carro
    if (carAge > 20) {
        basePrice = 2000; // Carros muito antigos (ex.: 1998)
    } else if (carAge > 10) {
        basePrice = 5000; // Carros entre 10 e 20 anos
    } else {
        basePrice = 10000; // Carros mais novos
    }

    // Ajustar o preço base com base na condição
    if (carData.condicao === "excelente") {
        basePrice *= 1.2;
    } else if (carData.condicao === "bom") {
        basePrice *= 1.0;
    } else if (carData.condicao === "regular") {
        basePrice *= 0.7;
    } else if (carData.condicao === "necessita-reparos") {
        basePrice *= 0.4;
    }

    // Ajustar com base na quilometragem
    const kmFactor = carData.km > 100000 ? 0.8 : 1.0;
    basePrice *= kmFactor;

    // Ajustar com base nas observações (ex.: motor trancado)
    if (carData.observacoes && carData.observacoes.toLowerCase().includes("motor trancado")) {
        basePrice *= 0.3;
    }

    // Simulação de busca por carros semelhantes
    const similarCars = [
        { marca: carData.marca, modelo: carData.modelo, ano: carData.ano, motor: carData.motor, km: 45000, condicao: "bom", preco: basePrice * 1.1, fonte: "OLX" },
        { marca: carData.marca, modelo: carData.modelo, ano: carData.ano, motor: carData.motor, km: 60000, condicao: "regular", preco: basePrice * 0.9, fonte: "Webmotors" },
        { marca: carData.marca, modelo: carData.modelo, ano: carData.ano - 1, motor: carData.motor, km: 50000, condicao: "excelente", preco: basePrice * 1.3, fonte: "Standvirtual" },
    ];

    const averagePrice = similarCars.reduce((sum, car) => sum + car.preco, 0) / similarCars.length;
    const suggestedPrice = averagePrice * 0.5;

    // Gerar relatório
    let report = `**Relatório de Análise - Veículo ${carData.id}**\n`;
    report += `**Cliente:** ${carData.nome}, E-mail: ${carData.email}, Telefone: ${carData.telefone}\n`;
    report += `**Localização do Carro:** ${carData.endereco}, ${carData.cidade}, ${carData.concelho}, ${carData.pais}\n`;
    report += `**Detalhes do Carro:**\n`;
    report += `Marca: ${carData.marca}, Modelo: ${carData.modelo}, Ano: ${carData.ano}, Motor: ${carData.motor}\n`;
    report += `Quilometragem: ${carData.km} KM, Condição: ${carData.condicao}\n`;
    report += `Preço Desejado pelo Cliente: €${carData.preco}\n`;
    report += `Observações do Cliente: ${carData.observacoes || "Nenhuma observação fornecida."}\n`;
    report += `**Análise de Mercado:**\n`;
    report += `Carros semelhantes encontrados:\n`;
    similarCars.forEach((car, index) => {
        report += `- Carro ${index + 1} (${car.fonte}): ${car.marca} ${car.modelo}, ${car.ano}, ${car.motor}, ${car.km} KM, Condição: ${car.condicao}, Preço: €${car.preco.toFixed(2)}\n`;
    });
    report += `Preço médio de carros semelhantes: €${averagePrice.toFixed(2)}\n`;
    report += `Preço sugerido para compra (50% do preço médio): €${suggestedPrice.toFixed(2)}\n`;
    report += `**Considerações:**\n`;
    report += `- Possíveis avarias não mencionadas podem reduzir o valor do veículo.\n`;
    report += `- Recomenda-se uma inspeção detalhada para identificar problemas ocultos (ex.: motor, suspensão, histórico de acidentes).\n`;
    report += `- Ajuste o preço final com base na inspeção e nas condições reais do veículo.\n`;

    res.json({ report });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});