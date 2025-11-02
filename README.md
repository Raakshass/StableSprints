# 🏃 StableSprints - NFT-Powered Yield Protocol

**A decentralized application for locking stablecoins and earning predictable yield, with NFTs as proof of stake and emergency exit options.**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [How It Works](#how-it-works)
- [Smart Contracts](#smart-contracts)
- [Tech Stack](#tech-stack)
- [Live Deployment](#live-deployment)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [Security Considerations](#security-considerations)
- [Future Improvements](#future-improvements)

---

## 🎯 Overview

**StableSprints** is a Web3 protocol that revolutionizes yield farming by:

1. **Removing impermanent loss risk** - Users deposit stablecoins, not volatile assets
2. **Guaranteed yields** - Fixed APY per sprint tier with predictable returns
3. **NFT tokenization** - Each sprint is an ERC721 NFT (proof of deposit)
4. **Flexible exit strategy** - Emergency withdraw with configurable penalty
5. **Transparent & auditable** - All transactions on-chain, fully decentralized

### Problem Statement

Traditional yield protocols suffer from:
- High gas fees for frequent transactions
- Complexity in yield calculation
- No guaranteed minimum returns
- Inability to exit early without heavy losses

**StableSprints solves** these by offering simple, predictable yield with NFT proof and emergency withdrawal.

---

## ✨ Features

### 1. **Three Sprint Tiers**
| Tier | Duration | Yield | Use Case |
|------|----------|-------|----------|
| ⚡ Quick Sprint | 60 seconds | 1% | Test transactions |
| 🏃 Standard Sprint | 5 minutes | 5% | Short-term yield |
| 🚀 Long Sprint | 10 minutes | 10% | Maximum returns |

### 2. **Emergency Withdrawal**
- Exit any sprint early (before maturity)
- Penalty: **50% of earned yield**
- Example: $1,000 deposit for 10% yield = $100 yield
  - Early exit penalty: $50
  - You receive: $1,050 (vs $1,100 at maturity)

### 3. **NFT Minting**
- Each sprint = 1 ERC721 NFT
- Token ID matches Sprint ID
- NFT metadata includes:
  - Sprint tier
  - Deposit amount
  - Maturity date
  - Yield percentage
- NFT burned upon redemption (proof of completion)

### 4. **User-Friendly Interface**
- Real-time contract interaction
- Wallet connection via RainbowKit
- Responsive design (mobile + desktop)
- Transaction status tracking
- Notification system

### 5. **Testnet Integration**
- Deployed on **Ethereum Sepolia**
- Free test ETH via Alchemy Faucet
- Mock USDC for testing
- No real funds at risk

---

## 🏗 Architecture

### System Flow Diagram

```
User connects MetaMask
↓
User approves mUSDC spend
↓
User selects Sprint Tier (1%, 5%, or 10%)
↓
User deposits amount (e.g., 100 mUSDC)
↓
SmartContract: startSprint()
→ Transfers mUSDC from user → contract
→ Calculates redeemable amount (deposit + yield)
→ Stores Sprint struct
→ Mints ERC721 NFT to user
↓
[User holds NFT for duration]
↓
Option A: Redeem at maturity
→ redeemSprint() function
→ Contract verifies maturity
→ Transfers (deposit + yield) to user
→ Burns NFT
→ Emits event
↓
Option B: Emergency withdraw
→ emergencyWithdraw() function
→ Contract verifies early exit
→ Calculates: amount = deposit + (yield / 2)
→ Transfers to user
→ Burns NFT
```

### Smart Contract Architecture

#### **MockUSDC.sol** (ERC20)
Total Supply: Unlimited (for testing)

Decimals: 18

Minter: Contract deployer

Burner: Any user can burn

#### **StableSprints.sol** (ERC721 + Core Logic)

**State Variables:**
```
IERC20 public stablecoin; // Reference to MockUSDC
mapping(uint256 => Sprint) sprints; // Sprint data by ID
uint256 public nextSprintId; // Auto-incrementing sprint ID
SprintTier sprintTiers; // Tier configurations

struct Sprint {
address owner; // Who created this sprint
uint256 amount; // Total redeemable amount
uint256 maturity; // Unix timestamp of maturity
bool redeemed; // Has this sprint been redeemed?
uint8 sprintType; // 0=Quick, 1=Standard, 2=Long
}

struct SprintTier {
uint256 duration; // Duration in seconds
uint256 yieldBps; // Yield in basis points (100 = 1%)
}
```

**Key Functions:**

1. **startSprint(uint256 _depositAmount, uint8 _sprintType)**
   - User calls with amount and tier
   - Requires prior ERC20 approval
   - Calculates: `yieldAmount = (deposit * yieldBps) / 10000`
   - Stores Sprint data
   - Mints NFT (#ID = sprintId)
   - Emits NewSprint event

2. **redeemSprint(uint256 _sprintId)**
   - Only sprint owner can call
   - Requires `block.timestamp >= sprint.maturity`
   - Transfers (deposit + yield) to owner
   - Burns NFT
   - Emits SprintRedeemed event

3. **emergencyWithdraw(uint256 _sprintId)**
   - Only sprint owner can call
   - Requires `block.timestamp < sprint.maturity`
   - Calculates penalty: `(yieldAmount / 2)`
   - Transfers (deposit + yield - penalty) to owner
   - Burns NFT
   - Emits EmergencyWithdraw event

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20.18.3 or higher
- **Yarn**: v1 or v2+
- **Git**: Latest version
- **MetaMask**: Browser extension
- **Sepolia ETH**: From Alchemy Faucet

### Installation Steps
```
1. Clone the repository
git clone https://github.com/Raakshass/StableSprints.git
cd StableSprints

2. Install dependencies
yarn install

3. Setup environment variables
Create .env.local files:
packages/hardhat/.env.local
ALCHEMY_API_KEY=your_key_here
DEPLOYER_PRIVATE_KEY=your_pk_here

packages/nextjs/.env.local
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key_here

4. Start blockchain (optional, for local development)
yarn chain

5. Deploy contracts (optional, for local development)
yarn deploy

6. Start frontend
yarn start

text

Visit: `http://localhost:3000`

---
```

## 📖 How It Works

### User Journey

**Step 1: Connect Wallet**
Click "Connect Wallet" button

Select MetaMask

Approve connection

Ensure you're on Sepolia network

Display shows: Address, mUSDC balance, Sepolia network

text

**Step 2: Get Test mUSDC**
Click "Get mUSDC" faucet button

Receive 100 mUSDC instantly

Approve spending (one-time)

text

**Step 3: Create a Sprint**
Enter amount (e.g., 50 mUSDC)

Select tier (Quick/Standard/Long)

Click "Start Sprint"

Approve transaction in MetaMask

Wait for confirmation (~15 seconds)

NFT minted, sprint created

text

**Step 4: Hold or Exit**
Option A - Wait for Maturity:
→ Sprint card shows countdown
→ "Redeem" button enabled at maturity
→ Click "Redeem"
→ Receive: deposit + yield

Option B - Exit Early:
→ "Withdraw Early (-50%)" button available
→ Click button
→ Receive: deposit + (yield / 2)
→ Penalty deducted

text

**Step 5: View History**
All sprints displayed in grid

Green "Redeemed" badge for completed sprints

Grayed out completed sprints

Shows NFT ID for each sprint

text

---

## 🔗 Smart Contracts

### Deployed Addresses (Sepolia)
```
| Contract | Address |
|----------|---------|
| **StableSprints** | `0x01ECE5a06410532B6CBCEeBC7816DbaAF573E386` |
| **MockUSDC** | `0x8E29c83DDD1F78df2C28c34A070738ddB354A2fa` |
```

### Verified on Etherscan

- [StableSprints](https://sepolia.etherscan.io/address/0x01ECE5a06410532B6CBCEeBC7816DbaAF573E386)
- [MockUSDC](https://sepolia.etherscan.io/address/0x8E29c83DDD1F78df2C28c34A070738ddB354A2fa)

### Events
```
event NewSprint(uint256 indexed sprintId, address indexed owner, uint256 amount, uint8 sprintType);
event SprintRedeemed(uint256 indexed sprintId, address indexed owner, uint256 amount);
event EmergencyWithdraw(uint256 indexed sprintId, address indexed owner, uint256 amount, uint256 penalty);
```
## 💻 Tech Stack

### Blockchain
- **Language**: Solidity ^0.8.19
- **Framework**: Hardhat
- **Standard Libraries**: OpenZeppelin Contracts
- **Network**: Ethereum Sepolia Testnet

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: TailwindCSS + DaisyUI
- **Web3 Library**: Wagmi + Viem
- **Wallet Connection**: RainbowKit
- **State Management**: React Hooks

### Infrastructure
- **RPC Provider**: Alchemy
- **Deployment**: Hardhat Deploy
- **Hosting**: Vercel (frontend)

### Development Tools
- **Package Manager**: Yarn
- **Git Workflow**: GitHub
- **Testing**: Hardhat Test (future)
- **Code Quality**: ESLint + Prettier

---

## 🌐 Live Deployment

### Live Application
**URL**: (Deploy to Vercel)

### GitHub Repository
**URL**: https://github.com/Raakshass/StableSprints

### Contract Verification
Contracts are deployed and verified on Sepolia Etherscan.

---

## 📁 Project Structure
```
StableSprints/
├── packages/
│ ├── hardhat/ # Smart contracts & deployment
│ │ ├── contracts/
│ │ │ ├── MockUSDC.sol # ERC20 test token
│ │ │ └── StableSprints.sol # Main protocol contract
│ │ ├── deploy/
│ │ │ ├── 00_deploy_mock_usdc.ts
│ │ │ └── 01_deploy_stable_sprints.ts
│ │ ├── deployments/sepolia/ # Deployment artifacts
│ │ └── hardhat.config.ts
│ │
│ └── nextjs/ # Frontend application
│ ├── app/
│ │ ├── page.tsx # Main dApp interface
│ │ └── layout.tsx
│ ├── components/
│ │ └── scaffold-eth/ # Reusable components
│ ├── contracts/
│ │ └── deployedContracts.ts # Contract ABI & addresses
│ ├── hooks/
│ │ └── scaffold-eth/ # Custom React hooks
│ ├── utils/
│ │ └── scaffold-eth/
│ └── scaffold.config.ts # Network config
│
├── README.md # This file
└── package.json
```
text

---

## 🎮 Usage Guide

### For Users

**1. First Time Setup**
Visit http://localhost:3000
Connect MetaMask wallet
Switch to Sepolia network
Get free test ETH from Alchemy Faucet
text

**2. Getting mUSDC**
Click "Faucet" button to receive 100 mUSDC
Only once per wallet per session
text

**3. Creating a Sprint**
Enter amount: 10-1000 mUSDC
Select tier: Quick (1%), Standard (5%), Long (10%)
Click "Start Sprint"
Confirm transaction
Wait ~15 seconds
text

**4. Managing Sprints**
View all active sprints
See countdown timer
Click "Redeem" at maturity
Or click "Withdraw Early" for penalty exit
text

### For Developers

**1. Local Development**
yarn chain # Start local blockchain
yarn deploy # Deploy contracts locally
yarn start # Start frontend

text

**2. Testing Contracts**
cd packages/hardhat
yarn hardhat test # Run test suite

text

**3. Deploying to Sepolia**
cd packages/hardhat
yarn deploy --network sepolia

text

**4. Updating Frontend**
cd packages/nextjs
yarn start # Auto-reload on changes

text

---

## 🔒 Security Considerations

### Current Implementation
- ✅ Basic input validation
- ✅ Owner-only sprint operations
- ✅ Reentry protection (ERC721)
- ✅ Testnet only (no real funds)

### Recommendations for Production
- ⚠️ Full security audit required
- ⚠️ OpenZeppelin AccessControl for role-based permissions
- ⚠️ Time-lock functionality for parameter changes
- ⚠️ Insurance fund for yield shortfalls
- ⚠️ Rate limiting on emergency withdrawals

---

## 🚀 Future Improvements

### Phase 2
- [ ] Multi-chain support (Polygon, Arbitrum, Optimism)
- [ ] Governance token (SPRINT)
- [ ] DAO treasury for yield shortfalls
- [ ] Dynamic yield based on TVL
- [ ] Staking rewards for LPs

### Phase 3
- [ ] Composable yield (deposit sprint → earn yield → restake)
- [ ] Leverage protocol (borrow against sprints)
- [ ] Oracle integration for real yield data
- [ ] Cross-chain messaging

### Phase 4
- [ ] Institutional partnerships
- [ ] Regulatory compliance (banking license)
- [ ] Mainnet deployment
- [ ] Exchange listing

---

## 📞 Support & Contact

- **GitHub Issues**: https://github.com/Raakshass/StableSprints/issues
- **Author**: [Raakshass](https://github.com/Raakshass)
- **Twitter**: [@YourHandle](#)

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details

---

## 🙏 Acknowledgments

- Built with **Scaffold-ETH 2**
- Powered by **OpenZeppelin** contracts
- Hosted on **Vercel**
- Deployed via **Alchemy**

---

**Created for Scaffold-ETH 2 Hackathon | November 2, 2025**

**⭐ If you found this useful, please star the repo!**
