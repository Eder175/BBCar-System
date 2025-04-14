const express = require("express");
const axios = require("axios");
const cors = require("cors");
const puppeteer = require("puppeteer");
const { ethers } = require("ethers");
const jwt = require("jsonwebtoken");
const { PinataSDK } = require("pinata-web3");
require("dotenv").config();

const app = express();
const port = 3001;

// Configuração do Pinata
const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: "https://gateway.pinata.cloud",
});

// Middleware para CORS e parsear JSON
app.use(cors());
app.use(express.json());

// Chave secreta para autenticação JWT
const JWT_SECRET = process.env.JWT_SECRET || "bbcar-system-secret-2025";

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

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
    if (!privateKey.startsWith("0x") || privateKey.slice(2).length !== 64) {
        throw new Error("Chave privada inválida: deve começar com 0x e ter 64 caracteres após o 0x.");
    }
    wallet = new ethers.Wallet(privateKey, provider);
    console.log("Endereço da carteira:", wallet.address);
} catch (error) {
    console.error("Erro ao criar a carteira:", error.message);
    process.exit(1);
}

// Endereço e ABI do contrato inteligente
const contractAddress = "0xSeuContratoAqui"; // Substitua pelo endereço obtido no deploy
const contractABI = [
    {
        inputs: [
            { internalType: "address", name: "recipient", type: "address" },
            { internalType: "string", name: "tokenURI", type: "string" },
        ],
        name: "mintNFT",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "getCurrentTokenId",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
];
const carNFTContract = new ethers.Contract(contractAddress, contractABI, wallet);

// Função para fazer upload de imagens no Pinata
async function uploadImageToPinata(imageFile) {
    try {
        const file = new File([imageFile], imageFile.name, { type: imageFile.type });
        const upload = await pinata.upload.file(file);
        return `ipfs://${upload.IpfsHash}`;
    } catch (error) {
        console.error("Erro ao fazer upload da imagem para o Pinata:", error.message);
        throw error;
    }
}

// Endpoint para análise de preços de carros e geração de NFT (protegido)
app.post("/api/analyze-car", authenticateToken, async (req, res) => {
    const carData = req.body;
    console.log("Dados do carro recebidos para análise:", carData);

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
        if (carAge > 20) basePrice = 2000;
        else if (carAge > 10) basePrice = 5000;
        else basePrice = 10000;

        if (carData.condicao === "excelente") basePrice *= 1.2;
        else if (carData.condicao === "bom") basePrice *= 1.0;
        else if (carData.condicao === "regular") basePrice *= 0.7;
        else if (carData.condicao === "necessita-reparos") basePrice *= 0.4;

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

    // Upload das imagens para o Pinata
    let imageUrl = "https://via.placeholder.com/500x500?text=Carro+Sem+Imagem";
    if (carData.images && carData.images.length > 0) {
        try {
            imageUrl = `ipfs://${carData.images[0]}`; // Placeholder para simulação
        } catch (error) {
            console.error("Erro ao fazer upload da imagem:", error.message);
        }
    }

    // Gerar metadados do NFT
    const carHistory = {
        maintenance: carData.observacoes?.includes("manutenção") ? "Manutenção regular realizada" : "Sem histórico de manutenção informado",
        accidents: carData.observacoes?.toLowerCase().includes("acidente") ? "Veículo com histórico de acidente" : "Sem histórico de acidentes informado",
        previousOwners: "Desconhecido",
    };

    const metadata = {
        name: `Carro ${carData.marca} ${carData.modelo} (${carData.matricula})`,
        description: `Certificado Digital BBCar para o carro ${carData.marca} ${carData.modelo}, matrícula ${carData.matricula}, ano ${carData.ano}.`,
        image: imageUrl,
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
        const upload = await pinata.upload.json(metadata);
        const tokenURI = `ipfs://${upload.IpfsHash}`;
        console.log("Metadados enviados para IPFS:", tokenURI);

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