const hre = require("hardhat");

async function main() {
  const CarNFT = await hre.ethers.getContractFactory("CarNFT");
  const carNFT = await CarNFT.deploy();
  await carNFT.deployed();
  console.log("Contrato CarNFT implantado em:", carNFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});