# 🔗 Blockchain Donation System

> **Subject:** Blockchain Technology (BT) | T.Y. B.Tech Computer Engineering — Sem 6  
> **Project Type:** Full-Stack Decentralized Application (DApp)  
> **Blockchain:** Ethereum (Sepolia Testnet) + Polygon (Layer 2)

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Blockchain Concepts Covered](#2-blockchain-concepts-covered)
3. [System Architecture (Layer-by-Layer)](#3-system-architecture-layer-by-layer)
4. [Technology Stack](#4-technology-stack)
5. [Prerequisites & Installation](#5-prerequisites--installation)
6. [Smart Contract – Solidity](#6-smart-contract--solidity)
7. [Deploying on Ethereum (Remix IDE)](#7-deploying-on-ethereum-remix-ide)
8. [Deploying on Polygon (Layer 2 Scaling)](#8-deploying-on-polygon-layer-2-scaling)
9. [Frontend – MetaMask Web Interface](#9-frontend--metamask-web-interface)
10. [IPFS – Decentralized File Storage](#10-ipfs--decentralized-file-storage)
11. [DAO – Governance Layer](#11-dao--governance-layer)
12. [Security Considerations](#12-security-considerations)
13. [Lab Assignments Mapping](#13-lab-assignments-mapping)
14. [Project Folder Structure](#14-project-folder-structure)
15. [How to Run the Full Project](#15-how-to-run-the-full-project)
16. [References](#16-references)

---

## 1. Project Overview

This project implements a **Decentralized Donation System** using blockchain technology. Donors can send funds to NGOs / causes transparently — every donation is recorded immutably on the blockchain. No central authority can tamper with donations.

### 🎯 What the System Does:
| Feature | Description |
|---|---|
| **Transparent Donations** | All donations stored on-chain — anyone can verify |
| **Smart Contract Automation** | Funds auto-released based on governance votes |
| **MetaMask Integration** | Donors connect wallets and sign transactions |
| **IPFS Storage** | Campaign documents (proof, receipts) stored on IPFS |
| **DAO Governance** | Community votes on fund release proposals |
| **Polygon Scaling** | Low-fee transactions via Layer 2 |

### Why Blockchain for Donations?
Traditional donation systems suffer from:
- Lack of transparency (where does money go?)
- Centralized control (can be tampered)
- High fees through intermediaries
- No community governance

Blockchain solves ALL of these with:
- **Immutability** – records cannot be altered
- **Transparency** – all txns are public
- **Smart contracts** – trustless fund release
- **DAO voting** – community decides

---

## 2. Blockchain Concepts Covered

This project covers **all 4 Units** of the BT syllabus:

### Unit I – Blockchain Fundamentals
| Concept | Where Used in Project |
|---|---|
| **Blocks & Hashes (SHA-256)** | Every donation tx is hashed and chained into a block |
| **Merkle Trees** | All donations in a block form a Merkle tree for integrity |
| **Digital Signatures** | MetaMask signs every donation with donor's private key |
| **Public Blockchain** | Ethereum Sepolia testnet (open, permissionless) |
| **Transactions & Ledger** | Donations are on-chain transactions on a distributed ledger |

### Unit II – Consensus & Smart Contracts
| Concept | Where Used |
|---|---|
| **Proof of Stake (PoS)** | Ethereum uses PoS after The Merge; Sepolia testnet uses it |
| **Proof of Authority (PoA)** | Polygon's consensus mechanism for validators |
| **Smart Contracts** | `DonationContract.sol` — core contract handling all logic |
| **Ethereum Architecture** | Contract deployed on EVM-compatible chain |

### Unit III – Blockchain Platforms
| Layer | Platform | Usage |
|---|---|---|
| Layer 0 | TCP/IP / P2P | Underlying network connecting Ethereum nodes |
| **Layer 1** | **Ethereum (Sepolia)** | Core contract deployment, immutable ledger |
| **Layer 2** | **Polygon (Amoy testnet)** | Faster & cheaper donations, bridging |
| **Layer 3** | **MetaMask** | User wallet, connects donor to DApp |
| **Layer 4** | **DAO (Smart Contract)** | Governance votes to release funds |
| **Layer 5** | **IPFS** | Campaign docs, receipts, proof stored off-chain |

### Unit IV – Security & Privacy
| Attack / Issue | How Project Mitigates It |
|---|---|
| **Reentrancy Attack** | `nonReentrant` modifier used in `withdraw()` |
| **Integer Overflow** | Solidity `^0.8.x` has built-in overflow checks |
| **51% Attack** | Ethereum's PoS makes this economically impractical |
| **Sybil Attack** | MetaMask wallet = unique identity per donor |
| **Double Spending** | Blockchain consensus prevents this by design |
| **Replay Attack** | Chain ID in transaction signatures prevents cross-chain replays |

---

## 3. System Architecture (Layer-by-Layer)

```
╔══════════════════════════════════════════════════════════════╗
║              BLOCKCHAIN DONATION SYSTEM ARCHITECTURE          ║
╠══════════════════════════════════════════════════════════════╣
║  [LAYER 5 – DATA/STORAGE]    IPFS                            ║
║  Campaign images, documents, receipts stored on IPFS         ║
║  CID (Content ID) stored on-chain for integrity verification ║
╠══════════════════════════════════════════════════════════════╣
║  [LAYER 4 – GOVERNANCE]      DAO Smart Contract              ║
║  Token holders vote to approve fund releases                 ║
║  Proposals created, voted on, and executed on-chain          ║
╠══════════════════════════════════════════════════════════════╣
║  [LAYER 3 – APPLICATION]     MetaMask + Web Interface        ║
║  Donors connect wallets, browse causes, make donations       ║
║  Frontend built with HTML + Web3.js                          ║
╠══════════════════════════════════════════════════════════════╣
║  [LAYER 2 – SCALING]         Polygon (Amoy Testnet)          ║
║  Low gas fees (< $0.001), fast finality (~2 sec)             ║
║  Bridge from Ethereum → Polygon for locked funds             ║
╠══════════════════════════════════════════════════════════════╣
║  [LAYER 1 – BASE CHAIN]      Ethereum (Sepolia Testnet)      ║
║  DonationContract.sol + GovernanceDAO.sol deployed here      ║
║  Immutable record of all donations & DAO votes               ║
╠══════════════════════════════════════════════════════════════╣
║  [LAYER 0 – NETWORK]         P2P Ethereum Node Network       ║
║  Thousands of nodes globally validate & store state          ║
╚══════════════════════════════════════════════════════════════╝
```

### Data Flow Diagram:
```
Donor                MetaMask           Smart Contract         IPFS
  │                     │                     │                  │
  │── Connect Wallet ──>│                     │                  │
  │                     │── eth_accounts ────>│                  │
  │── Select Cause ────>│                     │                  │
  │── Enter Amount ────>│                     │                  │
  │                     │── sign tx ─────────>│                  │
  │                     │                     │── emit Event ───>│
  │                     │                     │                  │
  │                     │                  store CID             │
  │<── TX Hash ─────────│<─── receipt ────────│                  │
  │                     │                     │                  │
DAO Vote (token holders)│── propose ─────────>│                  │
  │                     │── vote ────────────>│                  │
  │                     │── execute ─────────>│ (release funds)  │
```

---

## 4. Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| Smart Contract Language | **Solidity ^0.8.20** | Write donation + DAO contracts |
| Development IDE | **Remix IDE** (remix.ethereum.org) | Write, compile, deploy contracts |
| Layer 1 Testnet | **Ethereum Sepolia** | Main contract deployment |
| Layer 2 Testnet | **Polygon Amoy** | Cheaper donations |
| Wallet | **MetaMask** | Browser extension for signing txns |
| Web3 Library | **Web3.js v4.5** | Frontend ↔ Blockchain communication |
| Decentralized Storage | **IPFS (Pinata.cloud)** | Store campaign files off-chain |
| Frontend | **HTML + CSS + JavaScript** | DApp web interface |
| Etherscan | **Sepolia Etherscan** | View transactions on-chain |

---

## 5. Prerequisites & Installation

### 5.1 Install MetaMask
1. Go to [https://metamask.io](https://metamask.io)
2. Click **"Download"** → Install browser extension (Chrome/Firefox/Brave)
3. Create a new wallet → **Save your 12-word seed phrase securely**
4. MetaMask is now installed — you'll see the 🦊 fox icon in your browser

### 5.2 Get Sepolia Testnet ETH (Free)
1. Open MetaMask → Click the network dropdown → Add **"Sepolia Test Network"**
   - If not visible: Settings → Advanced → Show test networks → ON
2. Go to a faucet:
   - [https://sepoliafaucet.com](https://sepoliafaucet.com) (Google login required)
   - [https://faucets.chain.link/sepolia](https://faucets.chain.link/sepolia)
3. Paste your MetaMask wallet address → Click **"Send ETH"**
4. You'll receive **0.5 ETH** (test only, no real value) in ~1 minute

### 5.3 Add Polygon Amoy Testnet to MetaMask
1. Open MetaMask → Click the network selector → **"Add Network"**
2. Click **"Add a network manually"** and fill in:

| Field | Value |
|---|---|
| Network Name | `Polygon Amoy Testnet` |
| New RPC URL | `https://rpc-amoy.polygon.technology/` |
| Chain ID | `80002` |
| Currency Symbol | `MATIC` |
| Block Explorer | `https://amoy.polygonscan.com/` |

3. Get test MATIC from: [https://faucet.polygon.technology/](https://faucet.polygon.technology/)

### 5.4 Open Remix IDE
- Go to [https://remix.ethereum.org](https://remix.ethereum.org) — no installation needed (runs in browser!)

---

## 6. Smart Contract – Solidity

Create the following files in Remix IDE under `contracts/` folder.

### 6.1 Main Donation Contract (`DonationContract.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DonationContract
 * @notice Transparent on-chain donation system with campaign management
 * @dev Covers: Smart Contracts (Unit II), Security (Unit IV)
 * Security: Uses ReentrancyGuard pattern to prevent reentrancy attacks
 */
contract DonationContract {

    // ─── STATE VARIABLES ───────────────────────────────────────────────────
    address public owner;            // Contract deployer (NGO admin)
    uint256 public campaignCount;    // Total campaigns created

    // ─── STRUCTS ───────────────────────────────────────────────────────────
    struct Campaign {
        uint256 id;
        string  title;
        string  description;
        string  ipfsCID;          // IPFS CID for campaign document (Unit III - Layer 5)
        address payable beneficiary;
        uint256 goalAmount;       // Target donation amount in wei
        uint256 raisedAmount;     // Total funds raised so far
        bool    isActive;
        bool    fundsReleased;
        uint256 createdAt;
    }

    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
        string  message;          // Optional message from donor
    }

    // ─── STORAGE MAPPINGS ──────────────────────────────────────────────────
    mapping(uint256 => Campaign)   public campaigns;
    mapping(uint256 => Donation[]) public donations;        // campaignId => donations[]
    mapping(address => uint256[])  public donorCampaigns;   // donor => campaignIds they donated to

    // ─── SECURITY: Reentrancy Guard ────────────────────────────────────────
    bool private _locked;  // Mutex lock to prevent reentrancy

    modifier nonReentrant() {
        require(!_locked, "Reentrancy: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    // ─── ACCESS CONTROL ────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner allowed");
        _;
    }

    modifier campaignExists(uint256 _id) {
        require(_id < campaignCount, "Campaign does not exist");
        _;
    }

    // ─── EVENTS (for off-chain indexing & frontend updates) ────────────────
    event CampaignCreated(
        uint256 indexed campaignId,
        string title,
        address indexed beneficiary,
        uint256 goalAmount,
        string ipfsCID
    );

    event DonationReceived(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount,
        string message,
        uint256 timestamp
    );

    event FundsReleased(
        uint256 indexed campaignId,
        address indexed beneficiary,
        uint256 amount
    );

    event CampaignClosed(uint256 indexed campaignId);

    // ─── CONSTRUCTOR ───────────────────────────────────────────────────────
    constructor() {
        owner = msg.sender;
    }

    // ─── FUNCTIONS ────────────────────────────────────────────────────────

    /**
     * @notice Create a new donation campaign
     * @param _title     Campaign display name
     * @param _description Short description
     * @param _ipfsCID   IPFS Content ID for campaign document (Layer 5 integration)
     * @param _beneficiary Address that will receive the funds
     * @param _goalAmount  Fundraising goal in wei (1 ETH = 1e18 wei)
     */
    function createCampaign(
        string  calldata _title,
        string  calldata _description,
        string  calldata _ipfsCID,
        address payable  _beneficiary,
        uint256          _goalAmount
    ) external onlyOwner {
        require(bytes(_title).length > 0,       "Title required");
        require(_beneficiary != address(0),      "Invalid beneficiary");
        require(_goalAmount > 0,                 "Goal must be > 0");

        campaigns[campaignCount] = Campaign({
            id:            campaignCount,
            title:         _title,
            description:   _description,
            ipfsCID:       _ipfsCID,
            beneficiary:   _beneficiary,
            goalAmount:    _goalAmount,
            raisedAmount:  0,
            isActive:      true,
            fundsReleased: false,
            createdAt:     block.timestamp
        });

        emit CampaignCreated(campaignCount, _title, _beneficiary, _goalAmount, _ipfsCID);
        campaignCount++;
    }

    /**
     * @notice Donate ETH to a campaign
     * @param _campaignId  Target campaign ID
     * @param _message     Optional donor message
     * Security: nonReentrant prevents reentrancy attacks on this payable function
     */
    function donate(uint256 _campaignId, string calldata _message)
        external
        payable
        nonReentrant
        campaignExists(_campaignId)
    {
        Campaign storage c = campaigns[_campaignId];
        require(c.isActive,      "Campaign not active");
        require(msg.value > 0,   "Donation must be > 0");

        // Solidity 0.8.x: arithmetic overflow automatically reverts (Unit IV security)
        c.raisedAmount += msg.value;

        donations[_campaignId].push(Donation({
            donor:     msg.sender,
            amount:    msg.value,
            timestamp: block.timestamp,
            message:   _message
        }));

        donorCampaigns[msg.sender].push(_campaignId);

        emit DonationReceived(_campaignId, msg.sender, msg.value, _message, block.timestamp);
    }

    /**
     * @notice Release raised funds to the beneficiary (called by DAO governance)
     * @param _campaignId  Campaign to release funds for
     * Security: nonReentrant + checks-effects-interactions pattern
     */
    function releaseFunds(uint256 _campaignId)
        external
        nonReentrant
        onlyOwner
        campaignExists(_campaignId)
    {
        Campaign storage c = campaigns[_campaignId];
        require(c.isActive,        "Campaign not active");
        require(!c.fundsReleased,  "Funds already released");
        require(c.raisedAmount > 0,"No funds to release");

        // CHECKS-EFFECTS-INTERACTIONS PATTERN (prevents reentrancy)
        // 1. Checks  — done above with require()
        // 2. Effects — update state BEFORE external call
        c.fundsReleased = true;
        c.isActive      = false;
        uint256 amount  = c.raisedAmount;

        // 3. Interactions — external call AFTER state update
        (bool success, ) = c.beneficiary.call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsReleased(_campaignId, c.beneficiary, amount);
    }

    // ─── VIEW FUNCTIONS ────────────────────────────────────────────────────

    function getCampaign(uint256 _id)
        external
        view
        campaignExists(_id)
        returns (Campaign memory)
    {
        return campaigns[_id];
    }

    function getDonations(uint256 _campaignId)
        external
        view
        campaignExists(_campaignId)
        returns (Donation[] memory)
    {
        return donations[_campaignId];
    }

    function getDonationCount(uint256 _campaignId)
        external
        view
        returns (uint256)
    {
        return donations[_campaignId].length;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getAllCampaigns() external view returns (Campaign[] memory) {
        Campaign[] memory all = new Campaign[](campaignCount);
        for (uint256 i = 0; i < campaignCount; i++) {
            all[i] = campaigns[i];
        }
        return all;
    }
}
```

### 6.2 DAO Governance Contract (`GovernanceDAO.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GovernanceDAO
 * @notice DAO for managing donation fund releases via community voting.
 * @dev Covers: DAOs (Unit III - Layer 4), Smart Contracts (Unit II), Security (Unit IV)
 *
 * SECURITY FIXES:
 *  FIX 1 - grantToken      : onlyOwner guard (was callable by anyone)
 *  FIX 2 - executeProposal : CEI + nonReentrant (external call was before state update)
 *  FIX 3 - createProposal  : campaignId validated on DonationContract (prevents front-running)
 *  FIX 4 - vote            : balance snapshotted at proposal creation (prevents vote-buying)
 *  FIX 5 - transferToken   : tokens transferable, not locked forever
 */
contract GovernanceDAO {

    // ========== STATE ==========
    DonationInterface public donationContract;
    address           public owner;
    uint256           public proposalCount;

    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant QUORUM        = 3;

    struct Proposal {
        uint256 id;
        uint256 campaignId;
        string  description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool    executed;
        bool    passed;
        address proposer;
    }

    mapping(uint256 => Proposal)                    public  proposals;
    mapping(uint256 => mapping(address => bool))    public  hasVoted;
    mapping(address => uint256)                     public  tokenBalance;
    // FIX 4: per-proposal frozen voting power snapshot
    mapping(uint256 => mapping(address => uint256)) private _votingPower;

    // ========== REENTRANCY GUARD (FIX 2) ==========
    bool private _locked;
    modifier nonReentrant() {
        require(!_locked, "Reentrancy: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    // ========== ACCESS CONTROL (FIX 1) ==========
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner allowed");
        _;
    }

    // ========== EVENTS ==========
    event TokenGranted(address indexed to, uint256 amount);
    event TokenTransferred(address indexed from, address indexed to, uint256 amount);
    event ProposalCreated(uint256 indexed id, uint256 campaignId, address indexed proposer);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, bool passed);

    // ========== CONSTRUCTOR ==========
    constructor(address _donationContract) {
        require(_donationContract != address(0), "Invalid donation contract");
        donationContract = DonationInterface(_donationContract);
        owner = msg.sender;
    }

    // ========== FIX 1: ACCESS CONTROL on grantToken ==========
    // Bug: no modifier -> anyone could grant themselves unlimited tokens.
    // Fix: onlyOwner ensures only the deploying admin distributes tokens.
    function grantToken(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Invalid address");
        require(_amount > 0, "Amount must be > 0");
        tokenBalance[_to] += _amount;
        emit TokenGranted(_to, _amount);
    }

    // ========== FIX 5: TOKEN TRANSFER (withdrawal pattern) ==========
    // Bug: tokens permanently locked once granted (no transfer/burn existed).
    // Fix: holders can transfer freely; does NOT affect existing vote snapshots.
    function transferToken(address _to, uint256 _amount) external {
        require(_to != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be > 0");
        require(tokenBalance[msg.sender] >= _amount, "Insufficient balance");
        tokenBalance[msg.sender] -= _amount;
        tokenBalance[_to]        += _amount;
        emit TokenTransferred(msg.sender, _to, _amount);
    }

    // ========== FIX 3 + FIX 4: createProposal ==========
    // FIX 3 Bug: any _campaignId accepted -> attacker front-runs with non-existent ID.
    //   Fix: donationContract.campaignExists() rejects invalid/inactive campaigns.
    // FIX 4 Bug: vote() used live tokenBalance -> buy tokens, inflate vote, sell.
    //   Fix: _votingPower[pid][voter] frozen NOW for all _voters supplied.
    //         Later token transfers have zero effect on this proposal.
    // @param _campaignId  Must be an existing, active campaign
    // @param _description Human-readable rationale
    // @param _voters      ALL eligible voters whose balances are frozen here
    function createProposal(
        uint256            _campaignId,
        string   calldata  _description,
        address[] calldata _voters
    ) external {
        require(tokenBalance[msg.sender] > 0, "Must hold governance token");

        // FIX 3: campaign must exist and be active on DonationContract
        require(
            donationContract.campaignExists(_campaignId),
            "Campaign does not exist or is not active"
        );

        uint256 pid = proposalCount;

        proposals[pid] = Proposal({
            id:           pid,
            campaignId:   _campaignId,
            description:  _description,
            votesFor:     0,
            votesAgainst: 0,
            deadline:     block.timestamp + VOTING_PERIOD,
            executed:     false,
            passed:       false,
            proposer:     msg.sender
        });

        // FIX 4: snapshot every eligible voter's current balance
        for (uint256 i = 0; i < _voters.length; i++) {
            address v = _voters[i];
            if (tokenBalance[v] > 0) {
                _votingPower[pid][v] = tokenBalance[v];
            }
        }

        emit ProposalCreated(pid, _campaignId, msg.sender);
        proposalCount++;
    }

    // ========== VOTE (uses FIX 4 snapshot, not live balance) ==========
    function vote(uint256 _proposalId, bool _support) external {
        require(_proposalId < proposalCount, "Proposal does not exist");
        Proposal storage p = proposals[_proposalId];
        require(block.timestamp < p.deadline, "Voting period ended");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");

        // FIX 4: use frozen snapshot, not live tokenBalance
        uint256 power = _votingPower[_proposalId][msg.sender];
        require(power > 0, "No voting power in this proposal snapshot");

        hasVoted[_proposalId][msg.sender] = true;

        if (_support) { p.votesFor     += power; }
        else          { p.votesAgainst += power; }

        emit Voted(_proposalId, msg.sender, _support, power);
    }

    // ========== FIX 2: executeProposal with CEI + nonReentrant ==========
    // Bug: releaseFunds() called while p.executed was still false ->
    //   malicious contract re-enters executeProposal repeatedly, draining funds.
    // Fix: strict Checks-Effects-Interactions (CEI) order:
    //   1. CHECKS      - all require() guards at the top
    //   2. EFFECTS     - p.executed and p.passed written BEFORE external call
    //   3. INTERACTIONS - releaseFunds() is the very last operation
    // nonReentrant mutex is an independent second layer of defence.
    function executeProposal(uint256 _proposalId) external nonReentrant {
        require(_proposalId < proposalCount, "Proposal does not exist");
        Proposal storage p = proposals[_proposalId];

        // 1. CHECKS
        require(block.timestamp >= p.deadline, "Voting still ongoing");
        require(!p.executed, "Already executed");
        require(p.votesFor + p.votesAgainst >= QUORUM, "Quorum not reached");

        // 2. EFFECTS - state fully updated BEFORE external interaction
        p.executed = true;
        p.passed   = p.votesFor > p.votesAgainst;
        emit ProposalExecuted(_proposalId, p.passed);

        // 3. INTERACTIONS - external call is the very last action
        if (p.passed) {
            donationContract.releaseFunds(p.campaignId);
        }
    }

    // ========== VIEW FUNCTIONS ==========
    function getProposal(uint256 _id) external view returns (Proposal memory) {
        require(_id < proposalCount, "Proposal does not exist");
        return proposals[_id];
    }

    /// @notice Returns frozen voting power for a voter on a specific proposal
    function getVotingPower(uint256 _proposalId, address _voter)
        external view returns (uint256)
    {
        return _votingPower[_proposalId][_voter];
    }
}

// ========== INTERFACE ==========
// Also add this function to DonationContract.sol to support FIX 3:
//
//   function campaignExists(uint256 _id) external view returns (bool) {
//       return _id < campaignCount && campaigns[_id].isActive;
//   }
//
interface DonationInterface {
    function releaseFunds(uint256 _campaignId) external;
    function campaignExists(uint256 _campaignId) external view returns (bool);
}
```

---

## 7. Deploying on Ethereum (Remix IDE)

### Step-by-Step Deployment:

**Step 1 – Open Remix**
1. Go to [https://remix.ethereum.org](https://remix.ethereum.org)
2. In the File Explorer (left panel), Click **"+"** → Create `DonationContract.sol`
3. Paste the contract code from Section 6.1

**Step 2 – Compile the Contract**
1. Click the **Solidity Compiler** icon (left panel — looks like `<S>`)
2. Select version **`0.8.20`**
3. Click **"Compile DonationContract.sol"** (should show a green checkmark ✅)

**Step 3 – Connect MetaMask**
1. In MetaMask, switch network to **Sepolia Test Network**
2. In Remix, click the **Deploy & Run Transactions** icon (left panel — Ethereum logo)
3. Under **Environment**, select **"Injected Provider – MetaMask"**
4. MetaMask popup will appear → Click **"Connect"**
5. Your wallet address should appear under **Account**

**Step 4 – Deploy**
1. Under **Contract**, select `DonationContract`
2. Click the orange **"Deploy"** button
3. MetaMask will show a transaction confirmation → Click **"Confirm"**
4. Wait ~15–30 seconds for Sepolia to confirm
5. In Remix → Deployed Contracts section, **copy your contract address** (starts with `0x...`)

**Step 5 – Verify on Etherscan**
1. Go to [https://sepolia.etherscan.io](https://sepolia.etherscan.io)
2. Search for your contract address
3. You should see the deployment transaction — this proves it's live on blockchain!

**Step 6 – Test Contract Functions in Remix**
- Expand your deployed contract in Remix
- Call `createCampaign(...)` with sample data:
  - `_title`: `"Education for All"`
  - `_description`: `"Scholarships for underprivileged kids"`
  - `_ipfsCID`: `"QmYourIPFSHashHere"` *(replace after IPFS upload)*
  - `_beneficiary`: your MetaMask wallet address
  - `_goalAmount`: `1000000000000000000` *(= 1 ETH in wei)*

---

## 8. Deploying on Polygon (Layer 2 Scaling)

### Why Polygon?
- Ethereum Sepolia gas fee: **~$5–10** per transaction
- Polygon Amoy gas fee: **~$0.001** per transaction
- Polygon is 100x cheaper using Proof of Authority consensus

### Step-by-Step on Polygon Amoy:
1. In MetaMask, **switch to Polygon Amoy Testnet** (added in Section 5.3)
2. Get test MATIC from: [https://faucet.polygon.technology/](https://faucet.polygon.technology/)
3. In Remix → **Deploy & Run Transactions**:
   - Environment: **"Injected Provider – MetaMask"**
   - MetaMask should now show "Polygon Amoy" in the header
4. Deploy the same `DonationContract.sol` — exact same steps as Section 7
5. Verify on Polygon explorer: [https://amoy.polygonscan.com](https://amoy.polygonscan.com)

### Key Difference: Ethereum vs Polygon
| Feature | Ethereum Sepolia | Polygon Amoy |
|---|---|---|
| Consensus | Proof of Stake | Proof of Authority |
| Block Time | ~12 seconds | ~2 seconds |
| Gas Fee | ~$5 (test: free) | ~$0.001 (test: free) |
| Layer | Layer 1 | Layer 2 |
| Currency | ETH | MATIC |

---

## 9. Frontend – MetaMask Web Interface

Create `index.html` (or update `Web3/index.html`) with the full donation interface:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Decentralized Donation System using Ethereum and MetaMask">
    <title>🔗 Blockchain Donation System</title>
    <script src="https://cdn.jsdelivr.net/npm/web3@4.5.0/dist/web3.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
            min-height: 100vh;
            color: #f5f5f5;
            padding: 20px;
        }

        header {
            text-align: center;
            padding: 40px 20px;
        }

        header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(90deg, #a78bfa, #60a5fa, #34d399);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }

        header p { color: #9ca3af; font-size: 1rem; }

        .card {
            background: rgba(255,255,255,0.07);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 20px;
            padding: 28px;
            margin: 20px auto;
            max-width: 700px;
            backdrop-filter: blur(20px);
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }

        h2 { font-size: 1.3rem; margin-bottom: 16px; color: #a78bfa; }

        input, textarea, select {
            width: 100%;
            padding: 14px;
            margin-top: 10px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 12px;
            color: #fff;
            font-size: 14px;
            outline: none;
            transition: border 0.3s;
        }

        input:focus, textarea:focus {
            border-color: #a78bfa;
        }

        input::placeholder, textarea::placeholder { color: #9ca3af; }

        button {
            width: 100%;
            padding: 14px;
            margin-top: 14px;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }

        .btn-primary {
            background: linear-gradient(135deg, #a78bfa, #60a5fa);
            color: #fff;
            box-shadow: 0 4px 15px rgba(167,139,250,0.4);
        }

        .btn-primary:hover {
            background: linear-gradient(135deg, #7c3aed, #2563eb);
            transform: translateY(-2px);
        }

        .btn-success {
            background: linear-gradient(135deg, #10b981, #059669);
            color: #fff;
        }

        .status { margin-top: 14px; padding: 12px; border-radius: 10px; text-align: center; font-weight: 600; }
        .status.success { background: rgba(16,185,129,0.2); color: #34d399; }
        .status.error   { background: rgba(239,68,68,0.2);  color: #f87171; }
        .status.info    { background: rgba(96,165,250,0.2); color: #93c5fd; }

        .wallet-badge {
            display: inline-block;
            background: rgba(167,139,250,0.2);
            border: 1px solid rgba(167,139,250,0.5);
            color: #a78bfa;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            margin-top: 10px;
            word-break: break-all;
        }

        .campaign-card {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 14px;
            padding: 16px;
            margin-top: 14px;
        }

        .progress-bar {
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            height: 8px;
            margin-top: 10px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            border-radius: 20px;
            background: linear-gradient(90deg, #a78bfa, #34d399);
            transition: width 0.5s;
        }

        .hidden { display: none; }

        footer {
            text-align: center;
            padding: 30px;
            color: #6b7280;
            font-size: 13px;
        }
    </style>
</head>
<body>

<header>
    <h1>🔗 Blockchain Donation System</h1>
    <p>Transparent • Trustless • Decentralized | Powered by Ethereum + MetaMask</p>
</header>

<!-- STEP 1: Connect Wallet -->
<div id="connectSection" class="card">
    <h2>👛 Connect Your Wallet</h2>
    <p style="color:#9ca3af; margin-bottom:10px;">Connect MetaMask to donate or create campaigns</p>
    <button class="btn-primary" id="connectBtn">🦊 Connect MetaMask</button>
    <div id="walletInfo" class="hidden">
        <p style="margin-top:14px;">Connected as:</p>
        <span class="wallet-badge" id="walletAddress"></span>
        <p style="margin-top:10px; color:#34d399; font-size:13px;">✅ Connected on <span id="networkName"></span></p>
    </div>
</div>

<!-- STEP 2: Donate to Campaign -->
<div id="donateSection" class="card hidden">
    <h2>❤️ Make a Donation</h2>
    <select id="campaignSelect">
        <option value="">-- Select a Campaign --</option>
        <option value="0">Campaign #0: Education for All</option>
        <option value="1">Campaign #1: Clean Water Drive</option>
        <option value="2">Campaign #2: Health Camp 2025</option>
    </select>
    <input type="number" id="donationAmount" placeholder="Amount in ETH (e.g. 0.01)" step="0.001" min="0">
    <textarea id="donorMessage" rows="2" placeholder="Optional message to the campaign..."></textarea>
    <button class="btn-primary" id="donateBtn">💸 Donate via MetaMask</button>
    <div id="donateStatus" class="status hidden"></div>
</div>

<!-- STEP 3: Campaign Progress -->
<div id="campaignSection" class="card hidden">
    <h2>📊 Campaign Overview</h2>
    <div id="campaignList"></div>
    <button class="btn-primary" id="refreshBtn" style="margin-top:16px;">🔄 Refresh Campaigns</button>
</div>

<!-- STEP 4: Transaction History -->
<div id="historySection" class="card hidden">
    <h2>🧾 Your Donation History</h2>
    <div id="donationHistory">Connect wallet to view history.</div>
</div>

<footer>
    <p>Built on Ethereum (Sepolia) + Polygon | Smart Contract: <span id="contractAddressFooter"></span></p>
    <p style="margin-top:6px;">All transactions are publicly verifiable on-chain • No central authority</p>
</footer>

<script>
    // ─── CONTRACT CONFIG (REPLACE AFTER DEPLOYING) ─────────────────────────
    const CONTRACT_ADDRESS = "0xYourContractAddressHere";  // Paste from Remix after deploy
    const CONTRACT_ABI = [
        {
            "inputs": [
                {"internalType": "string", "name": "_title", "type": "string"},
                {"internalType": "string", "name": "_description", "type": "string"},
                {"internalType": "string", "name": "_ipfsCID", "type": "string"},
                {"internalType": "address payable", "name": "_beneficiary", "type": "address"},
                {"internalType": "uint256", "name": "_goalAmount", "type": "uint256"}
            ],
            "name": "createCampaign", "outputs": [], "stateMutability": "nonpayable", "type": "function"
        },
        {
            "inputs": [
                {"internalType": "uint256", "name": "_campaignId", "type": "uint256"},
                {"internalType": "string", "name": "_message", "type": "string"}
            ],
            "name": "donate", "outputs": [], "stateMutability": "payable", "type": "function"
        },
        {
            "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
            "name": "getCampaign",
            "outputs": [
                {"components": [
                    {"internalType": "uint256", "name": "id", "type": "uint256"},
                    {"internalType": "string", "name": "title", "type": "string"},
                    {"internalType": "string", "name": "description", "type": "string"},
                    {"internalType": "string", "name": "ipfsCID", "type": "string"},
                    {"internalType": "address payable", "name": "beneficiary", "type": "address"},
                    {"internalType": "uint256", "name": "goalAmount", "type": "uint256"},
                    {"internalType": "uint256", "name": "raisedAmount", "type": "uint256"},
                    {"internalType": "bool", "name": "isActive", "type": "bool"},
                    {"internalType": "bool", "name": "fundsReleased", "type": "bool"},
                    {"internalType": "uint256", "name": "createdAt", "type": "uint256"}
                ], "internalType": "struct DonationContract.Campaign", "name": "", "type": "tuple"}
            ],
            "stateMutability": "view", "type": "function"
        },
        {
            "inputs": [],
            "name": "campaignCount",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view", "type": "function"
        }
    ];

    // ─── WEB3 SETUP ────────────────────────────────────────────────────────
    let web3, userAccount, contract;

    document.getElementById('contractAddressFooter').innerText = CONTRACT_ADDRESS;

    // CONNECT METAMASK
    document.getElementById('connectBtn').addEventListener('click', async () => {
        if (typeof window.ethereum === 'undefined') {
            alert('MetaMask not detected! Please install it from metamask.io');
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = accounts[0];
            web3 = new Web3(window.ethereum);

            const chainId = await web3.eth.getChainId();
            const networkNames = {
                11155111: 'Ethereum Sepolia',
                80002:    'Polygon Amoy',
                1:        'Ethereum Mainnet'
            };
            const netName = networkNames[Number(chainId)] || `Chain ${chainId}`;

            // Update UI
            document.getElementById('walletAddress').innerText = userAccount;
            document.getElementById('networkName').innerText  = netName;
            document.getElementById('walletInfo').classList.remove('hidden');

            // Show sections
            document.getElementById('donateSection').classList.remove('hidden');
            document.getElementById('campaignSection').classList.remove('hidden');
            document.getElementById('historySection').classList.remove('hidden');

            // Load campaigns
            contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            await loadCampaigns();

        } catch (err) {
            console.error("Connection rejected:", err);
            showStatus('donateStatus', '❌ ' + err.message, 'error');
        }
    });

    // DONATE FUNCTION
    document.getElementById('donateBtn').addEventListener('click', async () => {
        const campaignId = document.getElementById('campaignSelect').value;
        const ethAmount  = document.getElementById('donationAmount').value;
        const message    = document.getElementById('donorMessage').value || '';

        if (!campaignId && campaignId !== '0') return showStatus('donateStatus', '⚠️ Select a campaign', 'info');
        if (!ethAmount || parseFloat(ethAmount) <= 0) return showStatus('donateStatus', '⚠️ Enter a valid amount', 'info');

        showStatus('donateStatus', '⏳ Waiting for MetaMask signature...', 'info');

        try {
            const weiAmount = web3.utils.toWei(ethAmount, 'ether');
            await contract.methods.donate(campaignId, message).send({
                from: userAccount,
                value: weiAmount
            });
            showStatus('donateStatus', `✅ Donation of ${ethAmount} ETH recorded on blockchain! Thank you!`, 'success');
            await loadCampaigns();
        } catch (err) {
            console.error(err);
            showStatus('donateStatus', '❌ Transaction rejected or failed: ' + err.message, 'error');
        }
    });

    // LOAD CAMPAIGNS FROM CONTRACT
    async function loadCampaigns() {
        const listEl = document.getElementById('campaignList');
        listEl.innerHTML = '<p style="color:#9ca3af">Loading from blockchain...</p>';

        try {
            const count = Number(await contract.methods.campaignCount().call());
            if (count === 0) {
                listEl.innerHTML = '<p style="color:#9ca3af">No campaigns yet. Create one via Remix!</p>';
                return;
            }

            let html = '';
            for (let i = 0; i < count; i++) {
                const c = await contract.methods.getCampaign(i).call();
                const goal   = parseFloat(web3.utils.fromWei(c.goalAmount, 'ether'));
                const raised = parseFloat(web3.utils.fromWei(c.raisedAmount, 'ether'));
                const pct    = goal > 0 ? Math.min((raised / goal) * 100, 100).toFixed(1) : 0;

                html += `
                <div class="campaign-card">
                    <strong style="color:#a78bfa">Campaign #${i}: ${c.title}</strong>
                    <p style="color:#9ca3af; font-size:13px; margin-top:6px">${c.description}</p>
                    <p style="font-size:13px; margin-top:8px">
                        Raised: <strong style="color:#34d399">${raised} ETH</strong> / Goal: ${goal} ETH
                        ${c.ipfsCID ? `| <a href="https://ipfs.io/ipfs/${c.ipfsCID}" target="_blank" style="color:#60a5fa">📄 View Docs</a>` : ''}
                    </p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width:${pct}%"></div>
                    </div>
                    <p style="font-size:12px; color:#9ca3af; margin-top:4px">${pct}% funded | ${c.isActive ? '🟢 Active' : '🔴 Closed'}</p>
                </div>`;
            }
            listEl.innerHTML = html;
        } catch (err) {
            listEl.innerHTML = `<p style="color:#f87171">⚠️ Could not load: Update CONTRACT_ADDRESS in the script!</p>`;
        }
    }

    document.getElementById('refreshBtn').addEventListener('click', loadCampaigns);

    function showStatus(elId, msg, type) {
        const el = document.getElementById(elId);
        el.innerText = msg;
        el.className = `status ${type}`;
        el.classList.remove('hidden');
    }
</script>
</body>
</html>
```

**To use this file:**
1. After deploying in Remix (Section 7), copy your **contract address**
2. Replace `"0xYourContractAddressHere"` on line with `CONTRACT_ADDRESS`
3. Open `index.html` in a browser with MetaMask installed
4. Open the file directly in your browser (File → Open or double-click `index.html`)

---

## 10. IPFS – Decentralized File Storage

IPFS (InterPlanetary File System) is used to store campaign documents (images, grant proposals, receipts) off-chain while anchoring their **Content ID (CID)** on-chain.

### Why IPFS?
- Unlike centralized servers, IPFS files **can never be deleted or altered**
- Unique CID = SHA-256 hash of file content → tamper-proof
- Files are stored across multiple nodes globally

### Step-by-Step: Upload Files to IPFS via Pinata

**Step 1 – Create Pinata Account**
1. Go to [https://pinata.cloud](https://pinata.cloud) → Sign up (free tier: 1 GB)
2. After login → Go to **"Files"** → Click **"Upload"**

**Step 2 – Upload a Campaign Document**
1. Click **"Upload"** → **"File"**
2. Select a PDF, image, or document (e.g. campaign proof, bank statement)
3. After upload, copy the **CID** (looks like: `QmXxxx...` or `baf...`)

**Step 3 – Verify on IPFS Gateway**
1. Open browser and go to: `https://ipfs.io/ipfs/YOUR_CID`
2. Your file should be accessible from anywhere in the world

**Step 4 – Store CID in Smart Contract**
When creating a campaign in Remix:
- Pass the IPFS CID as the `_ipfsCID` parameter in `createCampaign()`
- The frontend will display a clickable link to the IPFS document

### IPFS vs Traditional Storage:
| Feature | IPFS | AWS S3 / Google Drive |
|---|---|---|
| Centralized | ❌ No | ✅ Yes |
| Tamper-proof | ✅ Yes (content-addressed) | ❌ No |
| Permanent | ✅ Yes (while pinned) | ❌ Can be deleted |
| Cost | Free (Pinata free tier) | Paid |

---

## 11. DAO – Governance Layer

The **GovernanceDAO** contract allows token-holding community members to vote on fund releases — no single admin can release funds without consensus.

### DAO Workflow:

```
1. NGO Admin deploys DonationContract + GovernanceDAO
       │
2. Admin grants governance tokens to trusted community members
       │
3. Campaign raises funds from donors
       │
4. Any token holder creates a Proposal: "Release funds for Campaign #1"
       │
5. Token holders vote FOR or AGAINST (voting period: 3 days)
       │
6. After deadline, anyone calls executeProposal()
       │
       ├── If votesFor > votesAgainst → funds released ✅
       └── If votesFor <= votesAgainst → proposal rejected ❌
```

### How to Use GovernanceDAO in Remix:

**Deploy GovernanceDAO:**
1. Copy `GovernanceDAO.sol` into Remix
2. Under Deploy: Pass your deployed `DonationContract` address as constructor argument
3. Deploy → Copy DAO address

**Test the DAO Workflow:**
1. Call `grantToken(address, amount)` to give 100 tokens to 3 MetaMask accounts
2. From Account 1: Call `createProposal(0, "Release funds for Education")` (campaign ID = 0)
3. From Accounts 1, 2, 3: Call `vote(0, true)` (proposal 0, vote FOR)
4. After 3 days (or set `VOTING_PERIOD = 60` seconds for testing)
5. Call `executeProposal(0)` → funds auto-released to beneficiary!

---

## 12. Security Considerations

Based on **Unit IV** of the syllabus:

### Vulnerabilities Addressed:

| Vulnerability | Attack Description | Protection in This Project |
|---|---|---|
| **Reentrancy** | Attacker re-enters `releaseFunds()` before state updates | `nonReentrant` modifier + Checks-Effects-Interactions pattern |
| **Integer Overflow** | Adding large numbers wraps around to 0 | Solidity ≥0.8.0 has automatic overflow protection |
| **51% Attack** | Controlling majority of network hash/stake | Uses Ethereum PoS — economically infeasible |
| **Sybil Attack** | Creating many fake identities | MetaMask wallet = real identity; one wallet = one voter |
| **Double Spending** | Spending same funds twice | Blockchain consensus prevents this; `fundsReleased` flag |
| **Replay Attack** | Reusing old signed transaction on another chain | Chain ID in MetaMask transaction signing |
| **Unauthorized Access** | Non-owners calling admin functions | `onlyOwner` modifier on `createCampaign()` and `releaseFunds()` |

### Smart Contract Security Best Practices Used:
```
✅ Checks-Effects-Interactions (CEI) pattern in releaseFunds()
✅ ReentrancyGuard mutex lock (_locked variable)
✅ Input validation with require() and custom errors
✅ Solidity ^0.8.20 (built-in overflow protection)
✅ Events emitted for all state changes (audit trail)
✅ Access control via onlyOwner modifier
✅ Immutable owner set in constructor
```

---

## 13. Lab Assignments Mapping

| Assignment | Description | Where in This Project |
|---|---|---|
| **A1** | Design & deploy a smart contract | `DonationContract.sol` + `GovernanceDAO.sol` deployed on Sepolia |
| **A2** | Set up Polygon test network & redeploy | Section 8: Polygon Amoy deployment |
| **A3** | Web interface using MetaMask for transactions | `index.html` (Section 9) — MetaMask donation flow |
| **A4** | Implement IPFS for file storage | Section 10: Pinata IPFS + CID stored on-chain |
| **A5** | Set up basic DAO using smart contracts | `GovernanceDAO.sol` (Section 11) |

---

## 14. Project Folder Structure

```
BT/
├── README.md                          ← You are here
│
├── contracts/
│   ├── DonationContract.sol           ← Main donation smart contract
│   └── GovernanceDAO.sol              ← DAO governance contract
│
├── Web3/
│   └── index.html                     ← MetaMask frontend interface
│
├── A4/
│   └── A4.sol                         ← StudentIPFSRegistry (Lab A4)
│
├── Remix/
│   ├── contracts/
│   │   ├── ProductStore.sol           ← Lab A3 contract
│   │   └── ...
│   └── WebFiles/                      ← Remix-export web files
│
└── artifacts/                         ← Compiled ABIs and deployment info
```

---

## 15. How to Run the Full Project

### Quick Start (Step-by-Step):

```
STEP 1 ─ Install MetaMask browser extension
          https://metamask.io → Create wallet → save seed phrase

STEP 2 ─ Get test ETH on Sepolia
          https://sepoliafaucet.com → paste your MetaMask address

STEP 3 ─ Open Remix IDE
          https://remix.ethereum.org

STEP 4 ─ Create & compile DonationContract.sol
          Copy code from Section 6.1 → Solidity 0.8.20 → Compile ✅

STEP 5 ─ Deploy to Sepolia via MetaMask
          Environment: Injected MetaMask → Deploy → Confirm in MetaMask

STEP 6 ─ Copy contract address from Remix

STEP 7 ─ Update index.html
          Replace CONTRACT_ADDRESS = "0xYourAddress..."

STEP 8 ─ Upload campaign document to IPFS
          https://pinata.cloud → Upload → Copy CID

STEP 9 ─ Create a campaign in Remix
          campaigns created by calling createCampaign() with IPFS CID

STEP 10 ─ Open index.html in browser
           Connect MetaMask → Select campaign → Donate → Sign in MetaMask

STEP 11 ─ View transaction on Etherscan
           https://sepolia.etherscan.io → search tx hash

STEP 12 ─ (Optional) Deploy GovernanceDAO for fund release voting
           Deploy GovernanceDAO.sol → pass DonationContract address
           Grant tokens → Create proposals → Vote → Execute
```

---

## 16. References

| Resource | Link |
|---|---|
| Solidity Documentation | https://docs.soliditylang.org |
| Remix IDE | https://remix.ethereum.org |
| MetaMask Docs | https://docs.metamask.io |
| Ethereum Docs | https://ethereum.org/en/developers/docs |
| Polygon Amoy Testnet | https://amoy.polygonscan.com |
| Sepolia Faucet | https://sepoliafaucet.com |
| IPFS / Pinata | https://pinata.cloud |
| Web3.js Docs | https://docs.web3js.org |
| Sepolia Etherscan | https://sepolia.etherscan.io |
| Original Bitcoin Paper | Bitcoin: A Peer-to-Peer Electronic Cash System (Satoshi Nakamoto) |
| Blockchain By Example (Packt) | https://github.com/PacktPublishing/Blockchain-By-Example |
| Charity Blockchain Reference | https://github.com/harshagr18/CharityBlockchain |
| OpenZeppelin (Security Patterns) | https://openzeppelin.com/contracts |

---

## 📝 Submission Checklist

Before final submission, make sure you have:

- [ ] `DonationContract.sol` deployed on **Sepolia Testnet** (screenshot of Etherscan tx)
- [ ] `DonationContract.sol` deployed on **Polygon Amoy** (screenshot of Polygonscan)
- [ ] `index.html` working with **MetaMask connection** and donation flow
- [ ] Campaign document uploaded to **IPFS via Pinata** (CID noted)
- [ ] `GovernanceDAO.sol` deployed and tested with at least 3 votes
- [ ] Transaction hashes for all deployments noted
- [ ] Contract addresses pasted in `index.html`

---

*Made with ❤️ for T.Y. B.Tech Blockchain Technology Lab — Sem 6*
