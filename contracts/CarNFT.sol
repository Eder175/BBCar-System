// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    constructor() ERC721("CarNFT", "CNFT") Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }

    function mintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        _tokenIdCounter += 1;
        uint256 newTokenId = _tokenIdCounter;
        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        return newTokenId;
    }

    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter;
    }
}