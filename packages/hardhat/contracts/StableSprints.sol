// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract StableSprints is ERC721, Ownable {
    IERC20 public stablecoin;

    struct Sprint {
        address owner;
        uint256 amount;
        uint256 maturity;
        bool redeemed;
        uint8 sprintType;
    }

    mapping(uint256 => Sprint) public sprints;
    uint256 public nextSprintId;

    struct SprintTier {
        uint256 duration;
        uint256 yieldBps;
    }

    SprintTier[3] public sprintTiers;

    event NewSprint(uint256 indexed sprintId, address indexed owner, uint256 amount, uint8 sprintType);
    event SprintRedeemed(uint256 indexed sprintId, address indexed owner, uint256 amount);
    event EmergencyWithdraw(uint256 indexed sprintId, address indexed owner, uint256 amount, uint256 penalty);

    constructor(address _stablecoin) ERC721("StableSprint", "SPRINT") Ownable(msg.sender) {
        stablecoin = IERC20(_stablecoin);
        sprintTiers[0] = SprintTier(60, 100);
        sprintTiers[1] = SprintTier(300, 500);
        sprintTiers[2] = SprintTier(600, 1000);
    }

    function startSprint(uint256 _depositAmount, uint8 _sprintType) external {
        require(_depositAmount > 0, "Deposit must be > 0");
        require(_sprintType < 3, "Invalid sprint type");

        SprintTier memory tier = sprintTiers[_sprintType];
        uint256 yieldAmount = (_depositAmount * tier.yieldBps) / 10000;
        uint256 redeemAmount = _depositAmount + yieldAmount;

        stablecoin.transferFrom(msg.sender, address(this), _depositAmount);

        sprints[nextSprintId] = Sprint({
            owner: msg.sender,
            amount: redeemAmount,
            maturity: block.timestamp + tier.duration,
            redeemed: false,
            sprintType: _sprintType
        });

        // Mint NFT for this sprint
        _safeMint(msg.sender, nextSprintId);

        emit NewSprint(nextSprintId, msg.sender, redeemAmount, _sprintType);
        nextSprintId++;
    }

    function redeemSprint(uint256 _sprintId) external {
        Sprint storage sprint = sprints[_sprintId];
        require(sprint.owner == msg.sender, "Not your sprint");
        require(block.timestamp >= sprint.maturity, "Sprint not mature");
        require(!sprint.redeemed, "Already redeemed");

        sprint.redeemed = true;
        stablecoin.transfer(msg.sender, sprint.amount);

        // Burn the NFT
        _burn(_sprintId);

        emit SprintRedeemed(_sprintId, msg.sender, sprint.amount);
    }

    function emergencyWithdraw(uint256 _sprintId) external {
        Sprint storage sprint = sprints[_sprintId];
        require(sprint.owner == msg.sender, "Not your sprint");
        require(!sprint.redeemed, "Already redeemed");
        require(block.timestamp < sprint.maturity, "Sprint already mature");

        SprintTier memory tier = sprintTiers[sprint.sprintType];
        uint256 totalAmount = sprint.amount;
        uint256 yieldAmount = (totalAmount * tier.yieldBps) / (10000 + tier.yieldBps);
        uint256 penaltyAmount = yieldAmount / 2;
        uint256 withdrawAmount = totalAmount - penaltyAmount;

        sprint.redeemed = true;
        stablecoin.transfer(msg.sender, withdrawAmount);

        // Burn the NFT
        _burn(_sprintId);

        emit EmergencyWithdraw(_sprintId, msg.sender, withdrawAmount, penaltyAmount);
    }

    function sponsorFunds(uint256 _amount) external onlyOwner {
        stablecoin.transferFrom(msg.sender, address(this), _amount);
    }
}
