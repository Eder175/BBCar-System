const hre = require("hardhat");

async function main() {
    // Obtém o signer (conta que está implantando o contrato)
    const [deployer] = await hre.ethers.getSigners();
    console.log("Implantando contrato com a conta:", deployer.address);

    // Verifica o saldo da conta
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Saldo da conta:", hre.ethers.formatEther(balance), "MATIC");

    // Implanta o contrato CarNFT
    const CarNFT = await hre.ethers.getContractFactory("CarNFT");
    const carNFT = await CarNFT.deploy();
    await carNFT.deployed();

    console.log("Contrato CarNFT implantado em:", carNFT.target);
}

main().catch((error) => {
    console.error("Erro ao implantar o contrato:", error);
    process.exitCode = 1;
});