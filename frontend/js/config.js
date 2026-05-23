// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  DonateChain — Contract Configuration                                   ║
// ║  Update the TWO addresses below after deploying contracts on Remix IDE   ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1: Deploy DonationContract.sol on Remix → paste address below
// STEP 2: Deploy GovernanceDAO.sol on Remix (with DonationContract addr as arg) → paste below
// STEP 3: On DonationContract in Remix, call setAuthorizedDAO(DAO_ADDRESS)
// ═══════════════════════════════════════════════════════════════════════════

const DONATION_CONTRACT_ADDRESS = "0x5c8d61C577350660cf1cD193Bf1c53E1A7B054f0";
const DAO_CONTRACT_ADDRESS = "0xddaAd340b0f1Ef65169Ae5E41A8b10776a75482d";

// ═══════════════════════════════════════════════════════════════════════════
// Supported Network — Sepolia Testnet
// ═══════════════════════════════════════════════════════════════════════════
const SUPPORTED_CHAIN_ID = 11155111;
const NETWORK_NAME = "Sepolia Testnet";
const EXPLORER_URL = "https://sepolia.etherscan.io";

// ═══════════════════════════════════════════════════════════════════════════
// DonationContract — COMPLETE ABI
// All functions: createCampaign, donate, releaseFunds, setAuthorizedDAO,
//   getCampaign, getDonations, getDonationCount, getContractBalance,
//   getAllCampaigns, campaignExists, getDonorCampaigns,
//   owner, authorizedDAO, campaignCount
// ═══════════════════════════════════════════════════════════════════════════
const DONATION_ABI = [
    // ─── createCampaign ────────────────────────────────────────────────
    {
        "inputs": [
            { "internalType": "string", "name": "_title", "type": "string" },
            { "internalType": "string", "name": "_description", "type": "string" },
            { "internalType": "string", "name": "_ipfsCID", "type": "string" },
            { "internalType": "address payable", "name": "_beneficiary", "type": "address" },
            { "internalType": "uint256", "name": "_goalAmount", "type": "uint256" }
        ],
        "name": "createCampaign",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // ─── donate ────────────────────────────────────────────────────────
    {
        "inputs": [
            { "internalType": "uint256", "name": "_campaignId", "type": "uint256" },
            { "internalType": "string", "name": "_message", "type": "string" }
        ],
        "name": "donate",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    // ─── releaseFunds ──────────────────────────────────────────────────
    {
        "inputs": [
            { "internalType": "uint256", "name": "_campaignId", "type": "uint256" }
        ],
        "name": "releaseFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // ─── setAuthorizedDAO ──────────────────────────────────────────────
    {
        "inputs": [
            { "internalType": "address", "name": "_dao", "type": "address" }
        ],
        "name": "setAuthorizedDAO",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // ─── getCampaign (view → Campaign struct) ──────────────────────────
    {
        "inputs": [
            { "internalType": "uint256", "name": "_id", "type": "uint256" }
        ],
        "name": "getCampaign",
        "outputs": [
            {
                "components": [
                    { "internalType": "uint256", "name": "id", "type": "uint256" },
                    { "internalType": "string", "name": "title", "type": "string" },
                    { "internalType": "string", "name": "description", "type": "string" },
                    { "internalType": "string", "name": "ipfsCID", "type": "string" },
                    { "internalType": "address payable", "name": "beneficiary", "type": "address" },
                    { "internalType": "uint256", "name": "goalAmount", "type": "uint256" },
                    { "internalType": "uint256", "name": "raisedAmount", "type": "uint256" },
                    { "internalType": "bool", "name": "isActive", "type": "bool" },
                    { "internalType": "bool", "name": "fundsReleased", "type": "bool" },
                    { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
                ],
                "internalType": "struct DonationContract.Campaign",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    // ─── getDonations (view → Donation[] array) ────────────────────────
    {
        "inputs": [
            { "internalType": "uint256", "name": "_campaignId", "type": "uint256" }
        ],
        "name": "getDonations",
        "outputs": [
            {
                "components": [
                    { "internalType": "address", "name": "donor", "type": "address" },
                    { "internalType": "uint256", "name": "amount", "type": "uint256" },
                    { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
                    { "internalType": "string", "name": "message", "type": "string" }
                ],
                "internalType": "struct DonationContract.Donation[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    // ─── getDonationCount ──────────────────────────────────────────────
    {
        "inputs": [
            { "internalType": "uint256", "name": "_campaignId", "type": "uint256" }
        ],
        "name": "getDonationCount",
        "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    // ─── getContractBalance ────────────────────────────────────────────
    {
        "inputs": [],
        "name": "getContractBalance",
        "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    // ─── getAllCampaigns (view → Campaign[] array) ─────────────────────
    {
        "inputs": [],
        "name": "getAllCampaigns",
        "outputs": [
            {
                "components": [
                    { "internalType": "uint256", "name": "id", "type": "uint256" },
                    { "internalType": "string", "name": "title", "type": "string" },
                    { "internalType": "string", "name": "description", "type": "string" },
                    { "internalType": "string", "name": "ipfsCID", "type": "string" },
                    { "internalType": "address payable", "name": "beneficiary", "type": "address" },
                    { "internalType": "uint256", "name": "goalAmount", "type": "uint256" },
                    { "internalType": "uint256", "name": "raisedAmount", "type": "uint256" },
                    { "internalType": "bool", "name": "isActive", "type": "bool" },
                    { "internalType": "bool", "name": "fundsReleased", "type": "bool" },
                    { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
                ],
                "internalType": "struct DonationContract.Campaign[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    // ─── campaignExists ────────────────────────────────────────────────
    {
        "inputs": [
            { "internalType": "uint256", "name": "_id", "type": "uint256" }
        ],
        "name": "campaignExists",
        "outputs": [
            { "internalType": "bool", "name": "", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    // ─── getDonorCampaigns ─────────────────────────────────────────────
    {
        "inputs": [
            { "internalType": "address", "name": "_donor", "type": "address" }
        ],
        "name": "getDonorCampaigns",
        "outputs": [
            { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    // ─── Public state variable getters ─────────────────────────────────
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "authorizedDAO",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "campaignCount",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    // ─── Events ────────────────────────────────────────────────────────
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256" },
            { "indexed": false, "internalType": "string", "name": "title", "type": "string" },
            { "indexed": true, "internalType": "address", "name": "beneficiary", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "goalAmount", "type": "uint256" },
            { "indexed": false, "internalType": "string", "name": "ipfsCID", "type": "string" }
        ],
        "name": "CampaignCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "donor", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
            { "indexed": false, "internalType": "string", "name": "message", "type": "string" },
            { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "name": "DonationReceived",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "beneficiary", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "FundsReleased",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256" }
        ],
        "name": "CampaignClosed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "daoAddress", "type": "address" }
        ],
        "name": "AuthorizedDAOSet",
        "type": "event"
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// GovernanceDAO — COMPLETE ABI
// All functions: grantToken, transferToken, createProposal, vote,
//   executeProposal, getProposal, getVotingPower,
//   tokenBalance, proposalCount, owner, donationContract,
//   hasVoted, VOTING_PERIOD, QUORUM
// ═══════════════════════════════════════════════════════════════════════════
const DAO_ABI = [
    // ─── grantToken ────────────────────────────────────────────────────
    {
        "inputs": [
            { "internalType": "address", "name": "_to", "type": "address" },
            { "internalType": "uint256", "name": "_amount", "type": "uint256" }
        ],
        "name": "grantToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // ─── transferToken ─────────────────────────────────────────────────
    {
        "inputs": [
            { "internalType": "address", "name": "_to", "type": "address" },
            { "internalType": "uint256", "name": "_amount", "type": "uint256" }
        ],
        "name": "transferToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // ─── createProposal (3 args: campaignId, description, voters[]) ───
    {
        "inputs": [
            { "internalType": "uint256", "name": "_campaignId", "type": "uint256" },
            { "internalType": "string", "name": "_description", "type": "string" },
            { "internalType": "address[]", "name": "_voters", "type": "address[]" }
        ],
        "name": "createProposal",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // ─── vote ──────────────────────────────────────────────────────────
    {
        "inputs": [
            { "internalType": "uint256", "name": "_proposalId", "type": "uint256" },
            { "internalType": "bool", "name": "_support", "type": "bool" }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // ─── executeProposal ───────────────────────────────────────────────
    {
        "inputs": [
            { "internalType": "uint256", "name": "_proposalId", "type": "uint256" }
        ],
        "name": "executeProposal",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // ─── getProposal (view → Proposal struct) ──────────────────────────
    {
        "inputs": [
            { "internalType": "uint256", "name": "_id", "type": "uint256" }
        ],
        "name": "getProposal",
        "outputs": [
            {
                "components": [
                    { "internalType": "uint256", "name": "id", "type": "uint256" },
                    { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
                    { "internalType": "string", "name": "description", "type": "string" },
                    { "internalType": "uint256", "name": "votesFor", "type": "uint256" },
                    { "internalType": "uint256", "name": "votesAgainst", "type": "uint256" },
                    { "internalType": "uint256", "name": "deadline", "type": "uint256" },
                    { "internalType": "bool", "name": "executed", "type": "bool" },
                    { "internalType": "bool", "name": "passed", "type": "bool" },
                    { "internalType": "address", "name": "proposer", "type": "address" }
                ],
                "internalType": "struct GovernanceDAO.Proposal",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    // ─── getVotingPower ────────────────────────────────────────────────
    {
        "inputs": [
            { "internalType": "uint256", "name": "_proposalId", "type": "uint256" },
            { "internalType": "address", "name": "_voter", "type": "address" }
        ],
        "name": "getVotingPower",
        "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    // ─── Public state variable getters ─────────────────────────────────
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "tokenBalance",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "proposalCount",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "donationContract",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "address", "name": "", "type": "address" }
        ],
        "name": "hasVoted",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "VOTING_PERIOD",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "QUORUM",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    // ─── Events ────────────────────────────────────────────────────────
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "TokenGranted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "TokenTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "campaignId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "proposer", "type": "address" }
        ],
        "name": "ProposalCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "voter", "type": "address" },
            { "indexed": false, "internalType": "bool", "name": "support", "type": "bool" },
            { "indexed": false, "internalType": "uint256", "name": "weight", "type": "uint256" }
        ],
        "name": "Voted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" },
            { "indexed": false, "internalType": "bool", "name": "passed", "type": "bool" }
        ],
        "name": "ProposalExecuted",
        "type": "event"
    }
];
