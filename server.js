const express = require("express");
const axios = require("axios");
const cors = require("cors");
const puppeteer = require("puppeteer");
const { ethers } = require("ethers");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const port = 3001;

// Middleware para CORS e parsear JSON
app.use(cors());
app.use(express.json());

// Chave secreta para autenticação JWT
const JWT_SECRET = process.env.JWT_SECRET || "bbcar-system-secret-2025";

// Middleware de autenticação simples
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Formato: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Erro ao verificar token:", error.message);
        res.status(403).json({ error: "Token inválido." });
    }
};

// Configuração do provedor Polygon (Amoy Testnet)
const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");

// Validar a chave privada antes de criar a carteira
const privateKey = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.trim() : null;
let wallet;

try {
    if (!privateKey) {
        throw new Error("Chave privada não fornecida no arquivo .env.");
    }
    if (!privateKey.startsWith("0x") || privateKey.length !== 66) {
        throw new Error("Chave privada inválida: deve começar com 0x e ter 64 caracteres após o 0x.");
    }
    wallet = new ethers.Wallet(privateKey, provider);
    console.log("Endereço da carteira:", wallet.address);
} catch (error) {
    console.error("Erro ao criar a carteira:", error.message);
    process.exit(1); // Encerra o servidor se a chave privada for inválida
}

// Endereço e ABI do contrato inteligente
const contractAddress = "0xINSIRA_O_ENDERECO_DO_CONTRATO_AQUI"; // Substitua após implantar o contrato
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "tokenURI",
                "type": "string"
            }
        ],
        "name": "mintNFT",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCurrentTokenId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
const carNFTContract = new ethers.Contract(contractAddress, contractABI, wallet);

// Rota GET simples para confirmar que o servidor está funcionando
app.get("/", (req, res) => {
    res.send("Servidor BBcar-System está funcionando! Acesse os endpoints /api/chat ou /api/analyze-car para interagir com a API.");
});

// Rota para login (simples, para gerar um token JWT)
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    // Simulação de autenticação (substitua por um banco de dados real no futuro)
    if (username === "admin" && password === "123456") {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } else {
        res.status(401).json({ error: "Credenciais inválidas." });
    }
});

// Função para buscar preços de carros semelhantes usando web scraping
async function scrapeCarPrices(marca, modelo, ano) {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
        const page = await browser.newPage();

        const searchQuery = `${marca} ${modelo} ${ano}`.replace(/\s+/g, "+");
        const url = `https://www.standvirtual.com/carros?q=${searchQuery}`;
        console.log(`Acessando URL para web scraping: ${url}`);
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

        const prices = await page.evaluate(() => {
            const priceElements = document.querySelectorAll(".offer-price__number");
            const pricesArray = [];
            priceElements.forEach(element => {
                const priceText = element.innerText.replace(/[^\d]/g, "");
                const price = parseFloat(priceText);
                if (!isNaN(price)) {
                    pricesArray.push(price);
                }
            });
            return pricesArray;
        });

        console.log(`Preços encontrados: ${prices}`);
        return prices;
    } catch (error) {
        console.error("Erro ao realizar web scraping:", error.message);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Endpoint para enviar mensagens à IA (protegido)
app.post("/api/chat", authenticateToken, async (req, res) => {
    const { message } = req.body;
    console.log("Mensagem recebida no backend:", message);
    console.log("Chave de API da OpenAI:", process.env.OPENAI_API_KEY ? "Chave presente" : "Chave ausente");

    if (!message) {
        console.error("Erro: Mensagem não fornecida.");
        return res.status(400).json({ error: "Mensagem não fornecida." });
    }

    try {
        console.log("Enviando requisição para a OpenAI...");
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
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

        console.log("Resposta da OpenAI recebida:", response.data);
        const reply = response.data.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error("Erro ao enviar mensagem para a OpenAI:", error.message);
        if (error.response) {
            console.error("Detalhes do erro:", error.response.data);
        }
        res.status(500).json({ error: "Erro ao processar a mensagem. Tente novamente." });
    }
});

// Endpoint para análise de preços de carros e geração de NFT (protegido)
app.post("/api/analyze-car", authenticateToken, async (req, res) => {
    const carData = req.body;
    console.log("Dados do carro recebidos para análise:", carData);

    // Validação dos dados recebidos
    if (!carData.marca || !carData.modelo || !carData.ano || !carData.matricula) {
        return res.status(400).json({ error: "Campos obrigatórios (marca, modelo, ano, matrícula) não fornecidos." });
    }

    let similarCarPrices;
    try {
        similarCarPrices = await scrapeCarPrices(carData.marca, carData.modelo, carData.ano);
    } catch (error) {
        console.error("Erro ao buscar preços via web scraping:", error.message);
        similarCarPrices = [];
    }

    let basePrice;
    const currentYear = new Date().getFullYear();
    const carAge = currentYear - parseInt(carData.ano);

    if (similarCarPrices.length > 0) {
        basePrice = similarCarPrices.reduce((sum, price) => sum + price, 0) / similarCarPrices.length;
    } else {
        if (carAge > 20) {
            basePrice = 2000;
        } else if (carAge > 10) {
            basePrice = 5000;
        } else {
            basePrice = 10000;
        }

        if (carData.condicao === "excelente") {
            basePrice *= 1.2;
        } else if (carData.condicao === "bom") {
            basePrice *= 1.0;
        } else if (carData.condicao === "regular") {
            basePrice *= 0.7;
        } else if (carData.condicao === "necessita-reparos") {
            basePrice *= 0.4;
        }

        const kmFactor = carData.km > 100000 ? 0.8 : 1.0;
        basePrice *= kmFactor;

        if (carData.observacoes && carData.observacoes.toLowerCase().includes("motor trancado")) {
            basePrice *= 0.3;
        }
    }

    const similarCars = similarCarPrices.length > 0
        ? similarCarPrices.map((price, index) => ({
            marca: carData.marca,
            modelo: carData.modelo,
            ano: carData.ano,
            motor: carData.motor || "Desconhecido",
            km: 45000 + index * 15000,
            condicao: ["bom", "regular", "excelente"][index % 3],
            preco: price,
            fonte: ["OLX", "Webmotors", "Standvirtual"][index % 3],
        }))
        : [
            { marca: carData.marca, modelo: carData.modelo, ano: carData.ano, motor: carData.motor || "Desconhecido", km: 45000, condicao: "bom", preco: basePrice * 1.1, fonte: "OLX" },
            { marca: carData.marca, modelo: carData.modelo, ano: carData.ano, motor: carData.motor || "Desconhecido", km: 60000, condicao: "regular", preco: basePrice * 0.9, fonte: "Webmotors" },
            { marca: carData.marca, modelo: carData.modelo, ano: carData.ano - 1, motor: carData.motor || "Desconhecido", km: 50000, condicao: "excelente", preco: basePrice * 1.3, fonte: "Standvirtual" },
        ];

    const averagePrice = similarCars.reduce((sum, car) => sum + car.preco, 0) / similarCars.length;
    const suggestedPrice = averagePrice * 0.5;

    // Gerar metadados do NFT
    const carHistory = {
        maintenance: carData.observacoes?.includes("manutenção") ? "Manutenção regular realizada" : "Sem histórico de manutenção informado",
        accidents: carData.observacoes?.toLowerCase().includes("acidente") ? "Veículo com histórico de acidente" : "Sem histórico de acidentes informado",
        previousOwners: "Desconhecido", // Pode ser expandido no futuro
    };

    const metadata = {
        name: `Carro ${carData.marca} ${carData.modelo} (${carData.matricula})`,
        description: `Certificado Digital BBCar para o carro ${carData.marca} ${carData.modelo}, matrícula ${carData.matricula}, ano ${carData.ano}.`,
        image: carData.images?.[0] || "https://via.placeholder.com/500x500?text=Carro+Sem+Imagem",
        attributes: [
            { trait_type: "Marca", value: carData.marca },
            { trait_type: "Modelo", value: carData.modelo },
            { trait_type: "Ano", value: carData.ano },
            { trait_type: "Matrícula", value: carData.matricula },
            { trait_type: "Condição", value: carData.condicao || "Desconhecida" },
            { trait_type: "Quilometragem", value: `${carData.km || 0} KM` },
            { trait_type: "Preço Sugerido", value: `€${suggestedPrice.toFixed(2)}` },
            { trait_type: "Histórico de Manutenção", value: carHistory.maintenance },
            { trait_type: "Histórico de Acidentes", value: carHistory.accidents },
        ],
    };

    let nftResult = {};
    try {
        // Fazer upload dos metadados para o IPFS usando Pinata
        const metadataResponse = await axios.post(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            metadata,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PINATA_JWT}`,
                },
            }
        );
        const tokenURI = `ipfs://${metadataResponse.data.IpfsHash}`;
        console.log("Metadados enviados para IPFS:", tokenURI);

        // Mintar o NFT na blockchain Polygon
        const tx = await carNFTContract.mintNFT(wallet.address, tokenURI);
        const receipt = await tx.wait();
        console.log("NFT mintado com sucesso:", receipt);

        nftResult = {
            nftId: receipt.transactionHash,
            tokenURI,
            explorerLink: `https://amoy.polygonscan.com/tx/${receipt.transactionHash}`,
            message: `NFT gerado com sucesso para o carro com matrícula ${carData.matricula}!`,
        };
    } catch (error) {
        console.error("Erro ao mintar NFT:", error.message);
        nftResult = {
            error: "Erro ao mintar NFT. Verifique as configurações da blockchain ou do Pinata.",
        };
    }

    // Gerar relatório
    let report = `**Relatório de Análise - Veículo ${carData.id || "ID Não Fornecido"}**\n`;
    report += `**Cliente:** ${carData.nome || "Não informado"}, E-mail: ${carData.email || "Não informado"}, Telefone: ${carData.telefone || "Não informado"}\n`;
    report += `**Localização do Carro:** ${carData.endereco || "Não informado"}, ${carData.cidade || "Não informado"}, ${carData.concelho || "Não informado"}, ${carData.pais || "Não informado"}\n`;
    report += `**Detalhes do Carro:**\n`;
    report += `Marca: ${carData.marca}, Modelo: ${carData.modelo}, Ano: ${carData.ano}, Motor: ${carData.motor || "Desconhecido"}\n`;
    report += `Quilometragem: ${carData.km || 0} KM, Condição: ${carData.condicao || "Desconhecida"}\n`;
    report += `Preço Desejado pelo Cliente: €${carData.preco || "Não informado"}\n`;
    report += `Observações do Cliente: ${carData.observacoes || "Nenhuma observação fornecida."}\n`;
    report += `**Análise de Mercado:**\n`;
    report += `Carros semelhantes encontrados:\n`;
    similarCars.forEach((car, index) => {
        report += `- Carro ${index + 1} (${car.fonte}): ${car.marca} ${car.modelo}, ${car.ano}, ${car.motor}, ${car.km} KM, Condição: ${car.condicao}, Preço: €${car.preco.toFixed(2)}\n`;
    });
    report += `Preço médio de carros semelhantes: €${averagePrice.toFixed(2)}\n`;
    report += `Preço sugerido para compra (50% do preço médio): €${suggestedPrice.toFixed(2)}\n`;
    report += `**Certificado Digital (NFT):**\n`;
    if (nftResult.nftId) {
        report += `NFT Gerado: ${nftResult.message}\n`;
        report += `Token URI: ${nftResult.tokenURI}\n`;
        report += `Transação na Blockchain: ${nftResult.explorerLink}\n`;
    } else {
        report += `Erro ao gerar NFT: ${nftResult.error}\n`;
    }
    report += `**Considerações:**\n`;
    report += `- Possíveis avarias não mencionadas podem reduzir o valor do veículo.\n`;
    report += `- Recomenda-se uma inspeção detalhada para identificar problemas ocultos (ex.: motor, suspensão, histórico de acidentes).\n`;
    report += `- Ajuste o preço final com base na inspeção e nas condições reais do veículo.\n`;
    report += `- O Certificado Digital (NFT) pode ser usado para verificar a autenticidade e o histórico do carro.\n`;

    res.json({ report, suggestedPrice, nftResult });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});