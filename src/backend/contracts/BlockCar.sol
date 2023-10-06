// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BlockCar is ReentrancyGuard {
    address payable public immutable feeAccount;
    uint public immutable feePercent;
    uint public itemCount;

    struct Item {
        uint itemId;
        IERC721 nft;
        uint tokenId;
        uint price;
        address payable seller;
        address owner;
        bool sold;
    }

    struct Transaction {
        uint itemId;
        address seller;
        address buyer;
        uint price;
        uint timestamp;
    }

    mapping(uint => Item) public items;
    mapping(uint256 => Transaction[]) private _Transactions;

    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );

    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    event Resold(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    constructor(uint _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    function makeItem(IERC721 _nft, uint _tokenId, uint _price) external nonReentrant {
        require(_price > 0, "Price must be greater than zero");
        itemCount++;
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        items[itemCount] = Item(
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            address(0),
            false
        );
        emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
    }

    function purchaseItem(uint _itemId) external payable nonReentrant {
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount);
        require(msg.value >= _totalPrice);
        require(!item.sold);
        require(item.seller != address(0), "Item does not exist");
        require(item.owner != msg.sender, "You already own this item");
        item.seller.transfer(item.price);
        uint feeAmount = (_totalPrice - item.price);
        feeAccount.transfer(feeAmount);
        items[_itemId].owner = msg.sender;
        items[_itemId].sold = true;
        Transaction memory transaction = Transaction(_itemId, item.seller, msg.sender,  item.price, block.timestamp);
       _Transactions[_itemId].push(transaction);
        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
   }

    function resellItem(uint _itemId, uint _price) external nonReentrant {
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "Item does not exist");
        require( item.owner == msg.sender, "Only the current owner can resell the item" );
        item.sold = false;
        item.price = _price;
        emit Resold(
            _itemId,
            address(item.nft),
            item.tokenId,
            _price,
            msg.sender,
            address(0)
        );
    }

    function getTotalPrice(uint _itemId) public view returns (uint) {
        return ((items[_itemId].price * (100 + feePercent)) / 100);
    }

    function getTransactions(uint256 _itemId) public view returns (Transaction[] memory) {
        return _Transactions[_itemId];
    }

}