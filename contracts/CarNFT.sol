// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Evento para registrar a criação de um NFT
    event NFTMinted(uint256 tokenId, address recipient, string tokenURI);

    constructor() ERC721("CarNFT", "CNFT") Ownable(msg.sender) {}

    // Função para mintar um NFT, restrita ao dono do contrato
    function mintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        emit NFTMinted(newItemId, recipient, tokenURI);
        return newItemId;
    }

    // Função para obter o último tokenId mintado
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIds.current();
    }
}