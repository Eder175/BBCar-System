const express = require("express");
const axios = require("axios");
const cors = require("cors");
const puppeteer = require("puppeteer");
require("dotenv").config();

const app = express();
const port = 3001; // Mudando a porta para 3001 para evitar conflitos

// Middleware para CORS e parsear JSON
app.use(cors());
app.use(express.json());

// Rota GET simples para confirmar que o servidor está funcionando
app.get("/", (req, res) => {
    res.send("Servidor BBcar-System está funcionando! Acesse os endpoints /api/chat ou /api/analyze-car para interagir com a API.");
});

// Função para buscar preços de carros semelhantes usando web scraping
async function scrapeCarPrices(marca, modelo, ano) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Exemplo: Buscar no Standvirtual (ajuste a URL conforme o site que você quer usar)
    const searchQuery = `${marca} ${modelo} ${ano}`.replace(/\s+/g, '+');
    const url = `https://www.standvirtual.com/carros?q=${searchQuery}`;
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extrair preços dos carros listados (ajuste os seletores conforme o site)
    const prices = await page.evaluate(() => {
        const priceElements = document.querySelectorAll(".offer-price__number");
        const pricesArray = [];
        priceElements.forEach(element => {
            const priceText = element.innerText.replace(/[^\d]/g, ''); // Remove caracteres não numéricos
            const price = parseFloat(priceText);
            if (!isNaN(price)) {
                pricesArray.push(price);
            }
        });
        return pricesArray;
    });

    await browser.close();
    return prices;
}

// Endpoint para enviar mensagens à IA
app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    console.log("Mensagem recebida no backend:", message); // Log para verificar a mensagem recebida

    try {
        console.log("Enviando requisição para a OpenAI..."); // Log antes de enviar
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

        console.log("Resposta da OpenAI recebida:", response.data); // Log da resposta
        const reply = response.data.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error("Erro ao enviar mensagem para a OpenAI:", error.message);
        if (error.response) {
            console.error("Detalhes do erro:", error.response.data); // Log detalhado do erro
        }
        res.status(500).json({ error: "Erro ao processar a mensagem. Tente novamente." });
    }
});

// Endpoint para análise de preços de carros
app.post("/api/analyze-car", async (req, res) => {
    const carData = req.body;

    // Buscar preços reais usando web scraping
    let similarCarPrices;
    try {
        similarCarPrices = await scrapeCarPrices(carData.marca, carData.modelo, carData.ano);
    } catch (error) {
        console.error("Erro ao buscar preços via web scraping:", error.message);
        similarCarPrices = []; // Fallback para evitar falhas
    }

    // Se não encontrar preços, usar valores simulados como fallback
    let basePrice;
    const currentYear = new Date().getFullYear();
    const carAge = currentYear - parseInt(carData.ano);

    if (similarCarPrices.length > 0) {
        // Calcular preço médio com base nos dados reais
        basePrice = similarCarPrices.reduce((sum, price) => sum + price, 0) / similarCarPrices.length;
    } else {
        // Fallback: usar simulação
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
    }

    // Simulação de busca por carros semelhantes (usando preços reais ou simulados)
    const similarCars = similarCarPrices.length > 0
        ? similarCarPrices.map((price, index) => ({
            marca: carData.marca,
            modelo: carData.modelo,
            ano: carData.ano,
            motor: carData.motor,
            km: 45000 + index * 15000,
            condicao: ["bom", "regular", "excelente"][index % 3],
            preco: price,
            fonte: ["OLX", "Webmotors", "Standvirtual"][index % 3],
        }))
        : [
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