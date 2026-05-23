# DonateChain

DonateChain is a blockchain-based donation mini-project built for a Blockchain Technology lab course. It uses Ethereum smart contracts, a static frontend, MetaMask wallet integration, and a DAO-style approval flow for releasing campaign funds.

## What this project does

- Lets donors connect MetaMask and donate ETH to campaigns.
- Stores campaign data and donation records on-chain.
- Shows live campaign progress, donation history, and DAO proposals in the frontend.
- Supports optional IPFS document links for campaign proof files.
- Uses governance voting before raised funds are released to beneficiaries.

## Tech stack

- Solidity `^0.8.20`
- Ethereum Sepolia testnet
- Web3.js `v4.5`
- MetaMask
- HTML, CSS, and vanilla JavaScript
- Optional IPFS/Pinata for campaign documents
- Remix IDE for deployment

## Quick start

1. Deploy `contracts/DonationContract.sol` in Remix on Sepolia.
2. Deploy `contracts/GovernanceDAO.sol` with the donation contract address.
3. Call `setAuthorizedDAO()` on the donation contract.
4. Update the deployed addresses in [frontend/js/config.js](frontend/js/config.js).
5. Run the frontend locally:

```powershell
cd frontend
python -m http.server 8000
```

6. Open `http://localhost:8000`.

## Documentation levels

- Basic overview: this file
- Project explanation and features: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- Full build and deployment guide: [BUILD_AND_DEPLOY_GUIDE.md](BUILD_AND_DEPLOY_GUIDE.md)

## Repository privacy check

No API keys, private keys, seed phrases, or access tokens were found in the tracked project files. The deployed contract addresses in `frontend/js/config.js` are public blockchain addresses, which are safe to keep in the repo.
