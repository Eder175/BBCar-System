const { ethers } = require("ethers");
require("dotenv").config();

const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey);
console.log("Endereço da carteira:", wallet.address);