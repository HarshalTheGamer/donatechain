// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DonationContract
 * @notice Transparent on-chain donation system with campaign management
 * @dev Covers: Smart Contracts (Unit II), Security (Unit IV)
 *
 * ARCHITECTURE FIXES APPLIED:
 *   FIX 1 — authorizedDAO    : DAO contract can call releaseFunds() via onlyOwnerOrDAO
 *   FIX 2 — campaignExists() : Public view function for GovernanceDAO validation
 *   FIX 6 — getDonorCampaigns(): Returns all campaign IDs a donor contributed to
 *
 * Security: ReentrancyGuard pattern, Checks-Effects-Interactions, access control
 */
contract DonationContract {

    // ─── STATE VARIABLES ───────────────────────────────────────────────────
    address public owner;               // Contract deployer (NGO admin)
    address public authorizedDAO;       // FIX 1: DAO contract authorized to release funds
    uint256 public campaignCount;       // Total campaigns created

    // ─── STRUCTS ───────────────────────────────────────────────────────────
    struct Campaign {
        uint256 id;
        string  title;
        string  description;
        string  ipfsCID;                // IPFS CID for campaign document (Layer 5)
        address payable beneficiary;
        uint256 goalAmount;             // Target donation amount in wei
        uint256 raisedAmount;           // Total funds raised so far
        bool    isActive;
        bool    fundsReleased;
        uint256 createdAt;
    }

    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
        string  message;                // Optional message from donor
    }

    // ─── STORAGE MAPPINGS ──────────────────────────────────────────────────
    mapping(uint256 => Campaign)   public campaigns;
    mapping(uint256 => Donation[]) public donations;        // campaignId => donations[]
    mapping(address => uint256[])  public donorCampaigns;   // donor => campaignIds[]

    // ─── SECURITY: Reentrancy Guard ────────────────────────────────────────
    bool private _locked;

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

    /// @dev FIX 1: Accept calls from either the deployer (owner) OR the DAO contract
    modifier onlyOwnerOrDAO() {
        require(
            msg.sender == owner || msg.sender == authorizedDAO,
            "Not authorized: must be owner or DAO"
        );
        _;
    }

    modifier campaignMustExist(uint256 _id) {
        require(_id < campaignCount, "Campaign does not exist");
        _;
    }

    // ─── EVENTS (for off-chain indexing & frontend updates) ────────────────
    event CampaignCreated(
        uint256 indexed campaignId,
        string  title,
        address indexed beneficiary,
        uint256 goalAmount,
        string  ipfsCID
    );

    event DonationReceived(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount,
        string  message,
        uint256 timestamp
    );

    event FundsReleased(
        uint256 indexed campaignId,
        address indexed beneficiary,
        uint256 amount
    );

    event CampaignClosed(uint256 indexed campaignId);

    event AuthorizedDAOSet(address indexed daoAddress);

    // ─── CONSTRUCTOR ───────────────────────────────────────────────────────
    constructor() {
        owner = msg.sender;
    }

    // ─── FIX 1: Link DAO contract after deployment ─────────────────────────
    /**
     * @notice Set the authorized DAO contract that can release funds
     * @param _dao Address of the deployed GovernanceDAO contract
     * @dev Call this ONCE after deploying both contracts:
     *      Deploy DonationContract → Deploy GovernanceDAO → setAuthorizedDAO(daoAddr)
     */
    function setAuthorizedDAO(address _dao) external onlyOwner {
        require(_dao != address(0), "Invalid DAO address");
        authorizedDAO = _dao;
        emit AuthorizedDAOSet(_dao);
    }

    // ─── CORE FUNCTIONS ───────────────────────────────────────────────────

    /**
     * @notice Create a new donation campaign
     * @param _title       Campaign display name
     * @param _description Short description
     * @param _ipfsCID     IPFS Content ID for campaign document (Layer 5 integration)
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
     * @param _campaignId Target campaign ID
     * @param _message    Optional donor message
     * Security: nonReentrant prevents reentrancy attacks on this payable function
     */
    function donate(uint256 _campaignId, string calldata _message)
        external
        payable
        nonReentrant
        campaignMustExist(_campaignId)
    {
        Campaign storage c = campaigns[_campaignId];
        require(c.isActive,      "Campaign not active");
        require(msg.value > 0,   "Donation must be > 0");

        // Solidity 0.8.x: arithmetic overflow automatically reverts (Unit IV)
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
     * @notice Release raised funds to the beneficiary
     * @param _campaignId Campaign to release funds for
     * @dev FIX 1: Changed from onlyOwner → onlyOwnerOrDAO
     *      Can be called by the contract owner OR the authorized GovernanceDAO
     * Security: nonReentrant + Checks-Effects-Interactions pattern
     */
    function releaseFunds(uint256 _campaignId)
        external
        nonReentrant
        onlyOwnerOrDAO
        campaignMustExist(_campaignId)
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

    /// @notice FIX 2: Check if a campaign exists and is active (for GovernanceDAO)
    function campaignExists(uint256 _id) external view returns (bool) {
        return _id < campaignCount && campaigns[_id].isActive;
    }

    function getCampaign(uint256 _id)
        external
        view
        campaignMustExist(_id)
        returns (Campaign memory)
    {
        return campaigns[_id];
    }

    function getDonations(uint256 _campaignId)
        external
        view
        campaignMustExist(_campaignId)
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

    /// @notice FIX 6: Get all campaign IDs a donor contributed to (for History page)
    function getDonorCampaigns(address _donor)
        external
        view
        returns (uint256[] memory)
    {
        return donorCampaigns[_donor];
    }
}
