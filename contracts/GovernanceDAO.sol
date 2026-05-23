// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GovernanceDAO
 * @notice DAO for managing donation fund releases via community voting
 * @dev Covers: DAOs (Unit III - Layer 4), Smart Contracts (Unit II), Security (Unit IV)
 *
 * SECURITY FIXES:
 *  FIX 1 — grantToken      : onlyOwner guard (prevents unauthorized token minting)
 *  FIX 2 — executeProposal : CEI pattern + nonReentrant (prevents reentrancy drain)
 *  FIX 3 — createProposal  : campaignId validated via DonationContract (rejects invalid IDs)
 *  FIX 4 — vote            : balance snapshotted at proposal creation (prevents vote-buying)
 *  FIX 5 — transferToken   : tokens transferable (not locked forever)
 *
 * LAB TESTING:
 *  VOTING_PERIOD = 120 seconds (2 minutes) for lab demo convenience
 *  QUORUM = 2 votes minimum (testable with 2-3 accounts)
 */
contract GovernanceDAO {

    // ========== STATE ==========
    DonationInterface public donationContract;
    address           public owner;
    uint256           public proposalCount;

    uint256 public constant VOTING_PERIOD = 120;   // 2 minutes for lab testing
    uint256 public constant QUORUM        = 2;     // Minimum total votes to execute

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
    /// @param _donationContract Address of the deployed DonationContract
    constructor(address _donationContract) {
        require(_donationContract != address(0), "Invalid donation contract");
        donationContract = DonationInterface(_donationContract);
        owner = msg.sender;
    }

    // ========== FIX 1: ACCESS CONTROL on grantToken ==========
    /// @notice Grant governance tokens to community members (onlyOwner)
    function grantToken(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Invalid address");
        require(_amount > 0, "Amount must be > 0");
        tokenBalance[_to] += _amount;
        emit TokenGranted(_to, _amount);
    }

    // ========== FIX 5: TOKEN TRANSFER ==========
    /// @notice Transfer governance tokens to another address
    function transferToken(address _to, uint256 _amount) external {
        require(_to != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be > 0");
        require(tokenBalance[msg.sender] >= _amount, "Insufficient balance");
        tokenBalance[msg.sender] -= _amount;
        tokenBalance[_to]        += _amount;
        emit TokenTransferred(msg.sender, _to, _amount);
    }

    // ========== FIX 3 + FIX 4: createProposal ==========
    /**
     * @notice Create a proposal to release funds for a campaign
     * @param _campaignId  Must be an existing, active campaign on DonationContract
     * @param _description Human-readable rationale for the fund release
     * @param _voters      All eligible voter addresses whose balances are frozen now
     * @dev FIX 3: campaignId validated on DonationContract
     *      FIX 4: voting power snapshot frozen at creation time
     */
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
    /// @notice Vote on a proposal (FOR or AGAINST). Weight = frozen snapshot balance.
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
    /**
     * @notice Execute a proposal after voting period ends
     * @dev CEI pattern: state updated BEFORE external call to DonationContract
     */
    function executeProposal(uint256 _proposalId) external nonReentrant {
        require(_proposalId < proposalCount, "Proposal does not exist");
        Proposal storage p = proposals[_proposalId];

        // 1. CHECKS
        require(block.timestamp >= p.deadline, "Voting still ongoing");
        require(!p.executed, "Already executed");
        require(p.votesFor + p.votesAgainst >= QUORUM, "Quorum not reached");

        // 2. EFFECTS — state fully updated BEFORE external interaction
        p.executed = true;
        p.passed   = p.votesFor > p.votesAgainst;
        emit ProposalExecuted(_proposalId, p.passed);

        // 3. INTERACTIONS — external call is the very last action
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
interface DonationInterface {
    function releaseFunds(uint256 _campaignId) external;
    function campaignExists(uint256 _campaignId) external view returns (bool);
}
