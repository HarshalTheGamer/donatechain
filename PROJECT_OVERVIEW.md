# DonateChain Project Overview

This document explains the project at a medium level of detail. It is meant for project review, viva preparation, and understanding what has been implemented without going through the full build guide.

## 1. Project summary

DonateChain is a decentralized donation platform where campaigns are managed through Ethereum smart contracts. Donors can contribute ETH through MetaMask, view campaign progress, and inspect their transaction history. Raised funds are not meant to be released directly by a single admin; instead, a DAO contract supports proposal-based approval and execution.

The current implementation is a frontend DApp plus two smart contracts:

- [contracts/DonationContract.sol](contracts/DonationContract.sol)
- [contracts/GovernanceDAO.sol](contracts/GovernanceDAO.sol)

## 2. Architecture

### On-chain layer

The blockchain stores the main trust-sensitive data:

- Campaign title, description, beneficiary, goal amount, raised amount, status, and optional IPFS CID
- Every donation entry with donor address, amount, timestamp, and optional message
- DAO proposals, proposal deadlines, vote totals, execution status, and token balances

### Off-chain layer

The frontend is a static web app served locally from the `frontend/` folder. It uses Web3.js to read blockchain state and submit transactions through MetaMask.

IPFS is optional in this project. If a campaign is created with a CID, the frontend shows a `View IPFS Document` link. The project does not upload files to IPFS automatically; it only stores and reads the CID.

## 3. Tech stack

### Smart contracts

- Solidity `^0.8.20`
- Remix IDE for compilation and deployment

### Blockchain and wallet

- Ethereum Sepolia testnet
- MetaMask
- Etherscan for transaction verification

### Frontend

- HTML
- CSS
- Vanilla JavaScript
- Web3.js `v4.5`

### Optional storage

- IPFS
- Pinata for pinning and CID generation

## 4. Implemented features

### Donation contract features

Implemented in [DonationContract.sol](contracts/DonationContract.sol):

- Owner-based campaign creation
- ETH donation to active campaigns
- Optional donation message
- Per-campaign donation history
- Total contract balance lookup
- Campaign count and campaign detail lookup
- Donor-to-campaign history mapping for the history page
- DAO authorization using `setAuthorizedDAO()`
- Fund release to beneficiaries

### DAO features

Implemented in [GovernanceDAO.sol](contracts/GovernanceDAO.sol):

- Governance token grant by DAO owner
- Governance token transfer
- Proposal creation for campaign fund release
- Token-weighted voting
- Snapshot-based voting power at proposal creation
- Proposal execution after the deadline
- Quorum enforcement

### Frontend pages

Implemented in `frontend/`:

- `index.html`: landing page and top-level statistics
- `donate.html`: donation form and campaign preview
- `campaigns.html`: all campaign cards with progress and status
- `dao.html`: governance token, proposal, and voting interface
- `history.html`: donor transaction history and summary stats
- `about.html`: project theory, architecture, and stack summary

### Shared frontend logic

Implemented in [frontend/js/app.js](frontend/js/app.js):

- Wallet connect and reconnect logic
- MetaMask-first injected provider selection
- Sepolia network switching request
- Contract initialization from ABI and addresses
- Per-page data loading
- Donation submission
- DAO actions
- Status messages and notifications

## 5. Security measures implemented

### Donation contract

- Reentrancy guard with a lock variable
- Checks-Effects-Interactions pattern during fund release
- Input validation with `require`
- Access control using `onlyOwner` and `onlyOwnerOrDAO`
- Public events for auditability

### DAO contract

- `onlyOwner` restriction on token grants
- Snapshot-based voting power to reduce vote manipulation
- Reentrancy protection during proposal execution
- Campaign validation through the donation contract
- Quorum requirement before execution

## 6. How IPFS fits into the project

IPFS is used only for campaign-supporting documents such as proof files, proposals, or receipts.

Important behavior:

- The contract stores only the CID, not the file contents.
- The frontend only displays a link if a CID exists.
- Uploading the file must be done separately through Pinata or another IPFS tool.
- Donating does not create or update IPFS records.

So the storage model is:

- Blockchain for money, campaign state, donor history, and governance
- IPFS for optional documents linked to a campaign

## 7. Current limitations

- Campaign creation is not available in the frontend UI; it is done through Remix.
- IPFS upload is manual, not integrated into the frontend.
- There is no backend, database, or admin dashboard.
- The frontend is currently configured for Sepolia in [frontend/js/config.js](frontend/js/config.js).
- The DAO flow is intended mainly for lab/demo use, with a short voting period.

## 8. Privacy review

Tracked source files do not contain API keys, private keys, seed phrases, or access tokens.

What is public and acceptable to keep in the repo:

- Smart contract addresses
- ABI definitions
- Public documentation links
- Network configuration for Sepolia

One important note:

- Your local `.git` metadata contains your commit email because commits were created with that identity. That is not part of the source files, but it can still be visible through Git history on GitHub.

## 9. Which document to read next

- Read [README.md](README.md) for the shortest quick-start version.
- Read [BUILD_AND_DEPLOY_GUIDE.md](BUILD_AND_DEPLOY_GUIDE.md) for the detailed deployment and lab-oriented instructions.
