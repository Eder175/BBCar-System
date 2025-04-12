const { ethers } = require("ethers");

// Chave privada do .env
const privateKey = "0x43f1db6caa2bce7c684058aa94d46ab9612b798fae35940ff52d9a9c8713432";

try {
    // Criar uma carteira a partir da chave privada
    const wallet = new ethers.Wallet(privateKey);
    console.log("Endereço da carteira:", wallet.address);
} catch (error) {
    console.error("Erro ao criar a carteira:", error.message);
}