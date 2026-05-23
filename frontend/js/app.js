// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  DonateChain — Application Logic                                        ║
// ║  Shared Web3 connection + page-specific functionality                   ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════════════════════════════
let web3 = null;
let userAccount = null;
let donationContract = null;
let daoContract = null;
let isOwner = false;
let isDaoOwner = false;
let ethereumProvider = null;

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    // Set active nav link based on current page
    setActiveNavLink();

    // Mobile nav toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }

    // Connect wallet button
    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn) {
        connectBtn.addEventListener('click', connectWallet);
    }

    // Page-specific event listeners
    setupPageListeners();

    // Auto-connect if already authorized
    if (window.ethereum && window.ethereum.selectedAddress) {
        connectWallet();
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// NAV ACTIVE LINK
// ═══════════════════════════════════════════════════════════════════════════
function setActiveNavLink() {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentFile || (currentFile === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE-SPECIFIC EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════════════
function setupPageListeners() {
    // Donate page
    const donateBtn = document.getElementById('donateBtn');
    if (donateBtn) donateBtn.addEventListener('click', makeDonation);

    // Campaign select change (donate page)
    const campaignSelect = document.getElementById('campaignSelect');
    if (campaignSelect) campaignSelect.addEventListener('change', showCampaignPreview);

    // Refresh buttons
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', () => {
        const page = document.body.getAttribute('data-page');
        initPage(page);
    });

    // DAO page
    const grantTokenBtn = document.getElementById('grantTokenBtn');
    if (grantTokenBtn) grantTokenBtn.addEventListener('click', grantTokens);

    const createProposalBtn = document.getElementById('createProposalBtn');
    if (createProposalBtn) createProposalBtn.addEventListener('click', createProposal);

    // History refresh
    const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
    if (refreshHistoryBtn) refreshHistoryBtn.addEventListener('click', loadDonationHistory);
}

// ═══════════════════════════════════════════════════════════════════════════
// WALLET CONNECTION
// ═══════════════════════════════════════════════════════════════════════════
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        showNotification('MetaMask not detected! Install it from metamask.io', 'error');
        return;
    }

    try {
        ethereumProvider = getInjectedProvider();
        const accounts = await ethereumProvider.request({ method: 'eth_requestAccounts' });
        userAccount = accounts[0];
        web3 = new Web3(ethereumProvider);

        let chainId = Number(await web3.eth.getChainId());

        // Check network
        if (chainId !== SUPPORTED_CHAIN_ID) {
            const switched = await requestSepoliaSwitch();
            if (!switched) {
                showNotification(`Please switch to ${NETWORK_NAME} (Chain ID: ${SUPPORTED_CHAIN_ID}) in MetaMask`, 'warning');
                return;
            }
            chainId = Number(await web3.eth.getChainId());
        }

        // Initialize contracts
        initContracts();

        // Check ownership
        await checkOwnership();

        // Update wallet UI
        updateWalletUI(chainId);

        // Listen for account/chain changes
        ethereumProvider.on('accountsChanged', (accs) => {
            if (accs.length === 0) {
                userAccount = null;
                location.reload();
            } else {
                userAccount = accs[0];
                location.reload();
            }
        });

        ethereumProvider.on('chainChanged', () => location.reload());

        // Initialize current page
        const page = document.body.getAttribute('data-page');
        await initPage(page);

    } catch (err) {
        console.error('Wallet connection failed:', err);
        showNotification('Connection rejected: ' + (err.message || err), 'error');
    }
}

function getInjectedProvider() {
    const provider = window.ethereum;
    if (!provider) return null;

    // When multiple wallets are installed, prefer MetaMask over others (e.g., Brave Wallet).
    if (Array.isArray(provider.providers) && provider.providers.length > 0) {
        const metamask = provider.providers.find((p) => p.isMetaMask && !p.isBraveWallet);
        return metamask || provider.providers[0];
    }

    return provider;
}

async function requestSepoliaSwitch() {
    if (!ethereumProvider) return false;

    const sepoliaHex = '0x' + Number(SUPPORTED_CHAIN_ID).toString(16);

    try {
        await ethereumProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: sepoliaHex }]
        });
        return true;
    } catch (switchErr) {
        if (switchErr && switchErr.code === 4902) {
            try {
                await ethereumProvider.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: sepoliaHex,
                        chainName: NETWORK_NAME,
                        nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                        rpcUrls: ['https://rpc.sepolia.org'],
                        blockExplorerUrls: ['https://sepolia.etherscan.io']
                    }]
                });
                return true;
            } catch (addErr) {
                console.error('Could not add Sepolia network:', addErr);
                return false;
            }
        }
        console.error('Could not switch network:', switchErr);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════
function initContracts() {
    if (DONATION_CONTRACT_ADDRESS && !DONATION_CONTRACT_ADDRESS.includes('PASTE')) {
        donationContract = new web3.eth.Contract(DONATION_ABI, DONATION_CONTRACT_ADDRESS);
    }
    if (DAO_CONTRACT_ADDRESS && !DAO_CONTRACT_ADDRESS.includes('PASTE')) {
        daoContract = new web3.eth.Contract(DAO_ABI, DAO_CONTRACT_ADDRESS);
    }
}

function isDonationReady() {
    return donationContract !== null;
}

function isDaoReady() {
    return daoContract !== null;
}

async function checkOwnership() {
    try {
        if (isDonationReady()) {
            const owner = await donationContract.methods.owner().call();
            isOwner = owner.toLowerCase() === userAccount.toLowerCase();
        }
        if (isDaoReady()) {
            const daoOwner = await daoContract.methods.owner().call();
            isDaoOwner = daoOwner.toLowerCase() === userAccount.toLowerCase();
        }
    } catch (e) {
        console.warn('Ownership check failed:', e);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════
async function initPage(page) {
    if (!web3 || !userAccount) return;

    try {
        switch (page) {
            case 'home':
                await loadHomeStats();
                break;
            case 'donate':
                await loadCampaignDropdown();
                break;
            case 'campaigns':
                await loadAllCampaigns();
                break;
            case 'dao':
                await loadDAOPage();
                break;
            case 'history':
                await loadDonationHistory();
                break;
        }
    } catch (err) {
        console.error('Page init error:', err);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// WALLET UI UPDATE
// ═══════════════════════════════════════════════════════════════════════════
function updateWalletUI(chainId) {
    const connectBtn = document.getElementById('connectBtn');
    const walletInfo = document.getElementById('walletInfo');
    const walletAddr = document.getElementById('walletAddress');
    const networkBadge = document.getElementById('networkBadge');

    if (connectBtn) connectBtn.classList.add('hidden');
    if (walletInfo) {
        walletInfo.classList.remove('hidden');
        if (walletAddr) walletAddr.textContent = shortenAddress(userAccount);
        if (networkBadge) {
            const networkNames = {
                11155111: '🟢 Sepolia',
                80002: '🟣 Polygon Amoy',
                1: '🔵 Mainnet'
            };
            networkBadge.textContent = networkNames[chainId] || `Chain ${chainId}`;
        }
    }

    // Show sections that require wallet
    document.querySelectorAll('.requires-wallet').forEach(el => {
        el.classList.remove('hidden');
    });

    // Show owner-only sections
    if (isOwner) {
        document.querySelectorAll('.owner-only').forEach(el => el.classList.remove('hidden'));
    }
    if (isDaoOwner) {
        document.querySelectorAll('.dao-owner-only').forEach(el => el.classList.remove('hidden'));
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// HOME PAGE — STATS
// ═══════════════════════════════════════════════════════════════════════════
async function loadHomeStats() {
    if (!isDonationReady()) {
        setElementText('statCampaigns', '—');
        setElementText('statRaised', '—');
        setElementText('statBalance', '—');
        setElementText('statProposals', '—');
        return;
    }

    try {
        const count = Number(await donationContract.methods.campaignCount().call());
        setElementText('statCampaigns', count);

        let totalRaised = BigInt(0);
        for (let i = 0; i < count; i++) {
            const c = await donationContract.methods.getCampaign(i).call();
            totalRaised += BigInt(c.raisedAmount);
        }
        setElementText('statRaised', formatEth(totalRaised) + ' ETH');

        const balance = await donationContract.methods.getContractBalance().call();
        setElementText('statBalance', formatEth(balance) + ' ETH');

        if (isDaoReady()) {
            const proposals = Number(await daoContract.methods.proposalCount().call());
            setElementText('statProposals', proposals);
        } else {
            setElementText('statProposals', '—');
        }
    } catch (err) {
        console.error('Stats load error:', err);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// DONATE PAGE — CAMPAIGN DROPDOWN (FIX 4)
// ═══════════════════════════════════════════════════════════════════════════
async function loadCampaignDropdown() {
    const select = document.getElementById('campaignSelect');
    if (!select || !isDonationReady()) return;

    try {
        const count = Number(await donationContract.methods.campaignCount().call());
        // Clear existing options except placeholder
        select.innerHTML = '<option value="">— Select a Campaign —</option>';

        if (count === 0) {
            select.innerHTML += '<option value="" disabled>No campaigns yet</option>';
            return;
        }

        for (let i = 0; i < count; i++) {
            const c = await donationContract.methods.getCampaign(i).call();
            if (c.isActive) {
                const goal = formatEth(c.goalAmount);
                const raised = formatEth(c.raisedAmount);
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = `#${i}: ${c.title}  (${raised}/${goal} ETH)`;
                select.appendChild(opt);
            }
        }
    } catch (err) {
        console.error('Dropdown load error:', err);
        select.innerHTML = '<option value="">⚠️ Error loading campaigns</option>';
    }
}

async function showCampaignPreview() {
    const select = document.getElementById('campaignSelect');
    const preview = document.getElementById('campaignPreview');
    if (!select || !preview || !isDonationReady()) return;

    const id = select.value;
    if (id === '') {
        preview.classList.add('hidden');
        return;
    }

    try {
        const c = await donationContract.methods.getCampaign(id).call();
        const goal = formatEth(c.goalAmount);
        const raised = formatEth(c.raisedAmount);
        const pct = Number(c.goalAmount) > 0
            ? Math.min((Number(c.raisedAmount) * 100) / Number(c.goalAmount), 100).toFixed(1)
            : 0;

        preview.innerHTML = `
            <div class="campaign-card">
                <div class="campaign-header">
                    <span class="campaign-title">${c.title}</span>
                    <span class="badge ${c.isActive ? 'badge-active' : 'badge-closed'}">${c.isActive ? '🟢 Active' : '🔴 Closed'}</span>
                </div>
                <p class="campaign-desc">${c.description}</p>
                <div class="campaign-stats">
                    <span>Raised: <strong>${raised} ETH</strong></span>
                    <span>Goal: ${goal} ETH</span>
                    ${c.ipfsCID ? `<a href="https://ipfs.io/ipfs/${c.ipfsCID}" target="_blank" class="text-blue">📄 IPFS Docs</a>` : ''}
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
                <div class="progress-label"><span>${pct}% funded</span><span>${raised} / ${goal} ETH</span></div>
            </div>
        `;
        preview.classList.remove('hidden');
    } catch (err) {
        preview.classList.add('hidden');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// DONATE PAGE — MAKE DONATION
// ═══════════════════════════════════════════════════════════════════════════
async function makeDonation() {
    if (!isDonationReady() || !userAccount) {
        showStatus('donateStatus', '⚠️ Connect wallet first', 'warning');
        return;
    }

    const campaignId = document.getElementById('campaignSelect').value;
    const ethAmount = document.getElementById('donationAmount').value;
    const message = document.getElementById('donorMessage')?.value || '';

    if (campaignId === '') {
        showStatus('donateStatus', '⚠️ Please select a campaign', 'warning');
        return;
    }
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
        showStatus('donateStatus', '⚠️ Enter a valid donation amount', 'warning');
        return;
    }

    showStatus('donateStatus', '⏳ Waiting for MetaMask confirmation...', 'info');

    try {
        const weiAmount = web3.utils.toWei(ethAmount, 'ether');
        const receipt = await donationContract.methods.donate(campaignId, message).send({
            from: userAccount,
            value: weiAmount.toString()
        });

        const txHash = receipt.transactionHash;
        showStatus('donateStatus',
            `✅ Donated ${ethAmount} ETH successfully! <a href="${EXPLORER_URL}/tx/${txHash}" target="_blank" style="color:#60a5fa;">View on Etherscan ↗</a>`,
            'success'
        );

        // Refresh dropdown
        await loadCampaignDropdown();
        showCampaignPreview();

        // Clear inputs
        document.getElementById('donationAmount').value = '';
        if (document.getElementById('donorMessage')) document.getElementById('donorMessage').value = '';

    } catch (err) {
        console.error('Donation error:', err);
        showStatus('donateStatus', '❌ Transaction failed: ' + (err.message || err), 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// CAMPAIGNS PAGE — ALL CAMPAIGNS
// ═══════════════════════════════════════════════════════════════════════════
async function loadAllCampaigns() {
    const container = document.getElementById('campaignGrid');
    if (!container) return;

    if (!isDonationReady()) {
        container.innerHTML = '<div class="empty-state"><div class="icon">⚙️</div><p>Update contract address in config.js after deploying</p></div>';
        return;
    }

    container.innerHTML = '<div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div>';

    try {
        const count = Number(await donationContract.methods.campaignCount().call());
        if (count === 0) {
            container.innerHTML = '<div class="empty-state"><div class="icon">📭</div><p>No campaigns yet. Create one via Remix IDE!</p></div>';
            return;
        }

        let html = '';
        for (let i = 0; i < count; i++) {
            const c = await donationContract.methods.getCampaign(i).call();
            const goal = formatEth(c.goalAmount);
            const raised = formatEth(c.raisedAmount);
            const pct = Number(c.goalAmount) > 0
                ? Math.min((Number(c.raisedAmount) * 100) / Number(c.goalAmount), 100).toFixed(1)
                : 0;
            const donationCount = Number(await donationContract.methods.getDonationCount(i).call());
            const date = formatDate(c.createdAt);

            html += `
                <div class="campaign-card animate-in" style="animation-delay:${i * 0.1}s">
                    <div class="campaign-header">
                        <span class="campaign-title">Campaign #${i}: ${c.title}</span>
                        <span class="badge ${c.isActive ? 'badge-active' : (c.fundsReleased ? 'badge-passed' : 'badge-closed')}">
                            ${c.isActive ? '🟢 Active' : (c.fundsReleased ? '✅ Released' : '🔴 Closed')}
                        </span>
                    </div>
                    <p class="campaign-desc">${c.description}</p>
                    <div class="campaign-stats">
                        <span>Raised: <strong>${raised} ETH</strong></span>
                        <span>Goal: ${goal} ETH</span>
                        <span>📊 ${donationCount} donation${donationCount !== 1 ? 's' : ''}</span>
                        <span>📅 ${date}</span>
                    </div>
                    ${c.ipfsCID ? `<div class="mt-8"><a href="https://ipfs.io/ipfs/${c.ipfsCID}" target="_blank" class="text-blue" style="font-size:0.85rem;">📄 View IPFS Document ↗</a></div>` : ''}
                    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
                    <div class="progress-label"><span>${pct}% funded</span><span>Beneficiary: ${shortenAddress(c.beneficiary)}</span></div>
                </div>
            `;
        }
        container.innerHTML = html;
    } catch (err) {
        console.error('Campaigns load error:', err);
        container.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>Error loading campaigns. Check contract address in config.js</p></div>';
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// DAO PAGE
// ═══════════════════════════════════════════════════════════════════════════
async function loadDAOPage() {
    await loadTokenBalance();
    await loadDAOCampaignDropdown();
    await loadProposals();
}

async function loadTokenBalance() {
    if (!isDaoReady() || !userAccount) return;
    try {
        const balance = Number(await daoContract.methods.tokenBalance(userAccount).call());
        setElementText('tokenBalance', balance);
    } catch (e) {
        setElementText('tokenBalance', '—');
    }
}

async function loadDAOCampaignDropdown() {
    const select = document.getElementById('daoCampaignSelect');
    if (!select || !isDonationReady()) return;

    try {
        const count = Number(await donationContract.methods.campaignCount().call());
        select.innerHTML = '<option value="">— Select Campaign —</option>';
        for (let i = 0; i < count; i++) {
            const c = await donationContract.methods.getCampaign(i).call();
            if (c.isActive) {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = `#${i}: ${c.title}`;
                select.appendChild(opt);
            }
        }
    } catch (e) {
        console.warn('DAO campaign dropdown error:', e);
    }
}

async function grantTokens() {
    if (!isDaoReady() || !userAccount) {
        showStatus('daoStatus', '⚠️ Connect wallet and deploy DAO first', 'warning');
        return;
    }

    const addr = document.getElementById('grantAddress')?.value?.trim();
    const amount = document.getElementById('grantAmount')?.value;

    if (!addr || !web3.utils.isAddress(addr)) {
        showStatus('daoStatus', '⚠️ Enter a valid Ethereum address', 'warning');
        return;
    }
    if (!amount || parseInt(amount) <= 0) {
        showStatus('daoStatus', '⚠️ Enter a valid token amount', 'warning');
        return;
    }

    showStatus('daoStatus', '⏳ Granting tokens...', 'info');

    try {
        await daoContract.methods.grantToken(addr, amount).send({ from: userAccount });
        showStatus('daoStatus', `✅ Granted ${amount} tokens to ${shortenAddress(addr)}`, 'success');
        await loadTokenBalance();
        document.getElementById('grantAddress').value = '';
        document.getElementById('grantAmount').value = '';
    } catch (err) {
        console.error('Grant error:', err);
        showStatus('daoStatus', '❌ Grant failed: ' + (err.message || err), 'error');
    }
}

async function createProposal() {
    if (!isDaoReady() || !userAccount) {
        showStatus('proposalStatus', '⚠️ Connect wallet first', 'warning');
        return;
    }

    const campaignId = document.getElementById('daoCampaignSelect')?.value;
    const description = document.getElementById('proposalDescription')?.value?.trim();
    const votersInput = document.getElementById('proposalVoters')?.value?.trim();

    if (campaignId === '' || campaignId === undefined) {
        showStatus('proposalStatus', '⚠️ Select a campaign', 'warning');
        return;
    }
    if (!description) {
        showStatus('proposalStatus', '⚠️ Enter a proposal description', 'warning');
        return;
    }
    if (!votersInput) {
        showStatus('proposalStatus', '⚠️ Enter voter addresses (comma-separated)', 'warning');
        return;
    }

    // Parse voter addresses
    const voters = votersInput.split(',').map(a => a.trim()).filter(a => a.length > 0);
    for (const v of voters) {
        if (!web3.utils.isAddress(v)) {
            showStatus('proposalStatus', `⚠️ Invalid address: ${v}`, 'warning');
            return;
        }
    }

    showStatus('proposalStatus', '⏳ Creating proposal...', 'info');

    try {
        await daoContract.methods.createProposal(
            campaignId,
            description,
            voters
        ).send({ from: userAccount });

        showStatus('proposalStatus', '✅ Proposal created! Voting is now open.', 'success');
        await loadProposals();
        document.getElementById('proposalDescription').value = '';
        document.getElementById('proposalVoters').value = '';
    } catch (err) {
        console.error('Proposal error:', err);
        showStatus('proposalStatus', '❌ Failed: ' + (err.message || err), 'error');
    }
}

async function loadProposals() {
    const container = document.getElementById('proposalList');
    if (!container || !isDaoReady()) return;

    try {
        const count = Number(await daoContract.methods.proposalCount().call());
        if (count === 0) {
            container.innerHTML = '<div class="empty-state"><div class="icon">📋</div><p>No proposals yet</p></div>';
            return;
        }

        let html = '';
        for (let i = count - 1; i >= 0; i--) {
            const p = await daoContract.methods.getProposal(i).call();
            const deadline = new Date(Number(p.deadline) * 1000);
            const now = new Date();
            const isExpired = now >= deadline;
            const hasVotedBool = await daoContract.methods.hasVoted(i, userAccount).call();
            const myPower = Number(await daoContract.methods.getVotingPower(i, userAccount).call());

            let statusBadge, statusClass;
            if (p.executed) {
                statusBadge = p.passed ? '✅ Passed' : '❌ Failed';
                statusClass = p.passed ? 'badge-passed' : 'badge-failed';
            } else if (isExpired) {
                statusBadge = '⏰ Awaiting Execution';
                statusClass = 'badge-pending';
            } else {
                statusBadge = '🗳️ Voting Open';
                statusClass = 'badge-active';
            }

            html += `
                <div class="proposal-card animate-in" style="animation-delay:${(count - 1 - i) * 0.1}s">
                    <div class="proposal-header">
                        <span class="proposal-id">Proposal #${p.id}</span>
                        <span class="badge ${statusClass}">${statusBadge}</span>
                    </div>
                    <p class="text-secondary" style="font-size:0.88rem; margin-bottom:6px;">${p.description}</p>
                    <p class="text-muted" style="font-size:0.8rem;">Campaign #${p.campaignId} | Proposer: ${shortenAddress(p.proposer)}</p>
                    <p class="text-muted" style="font-size:0.8rem;">Deadline: ${deadline.toLocaleString()}</p>
                    <div class="proposal-votes">
                        <span class="votes-for">👍 For: ${p.votesFor}</span>
                        <span class="votes-against">👎 Against: ${p.votesAgainst}</span>
                        <span class="text-muted" style="font-size:0.82rem;">Your power: ${myPower}</span>
                    </div>
                    <div class="proposal-actions">
                        ${!p.executed && !isExpired && !hasVotedBool && myPower > 0 ? `
                            <button class="btn btn-sm btn-success" onclick="voteOnProposal(${i}, true)">👍 Vote For</button>
                            <button class="btn btn-sm btn-danger" onclick="voteOnProposal(${i}, false)">👎 Vote Against</button>
                        ` : ''}
                        ${!p.executed && isExpired ? `
                            <button class="btn btn-sm btn-primary" onclick="executeProposal(${i})">⚡ Execute</button>
                        ` : ''}
                        ${hasVotedBool ? '<span class="text-muted" style="font-size:0.82rem;">✓ You have voted</span>' : ''}
                    </div>
                </div>
            `;
        }
        container.innerHTML = html;
    } catch (err) {
        console.error('Proposals load error:', err);
        container.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>Error loading proposals</p></div>';
    }
}

async function voteOnProposal(proposalId, support) {
    if (!isDaoReady()) return;
    showNotification('⏳ Submitting vote...', 'info');
    try {
        await daoContract.methods.vote(proposalId, support).send({ from: userAccount });
        showNotification(`✅ Vote ${support ? 'FOR' : 'AGAINST'} recorded!`, 'success');
        await loadProposals();
    } catch (err) {
        console.error('Vote error:', err);
        showNotification('❌ Vote failed: ' + (err.message || err), 'error');
    }
}

async function executeProposal(proposalId) {
    if (!isDaoReady()) return;
    showNotification('⏳ Executing proposal...', 'info');
    try {
        await daoContract.methods.executeProposal(proposalId).send({ from: userAccount });
        showNotification('✅ Proposal executed!', 'success');
        await loadProposals();
    } catch (err) {
        console.error('Execute error:', err);
        showNotification('❌ Execution failed: ' + (err.message || err), 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// HISTORY PAGE — DONATION HISTORY (FIX 4)
// ═══════════════════════════════════════════════════════════════════════════
async function loadDonationHistory() {
    const container = document.getElementById('historyTable');
    const statsContainer = document.getElementById('historyStats');
    if (!container) return;

    if (!isDonationReady() || !userAccount) {
        container.innerHTML = '<div class="empty-state"><div class="icon">👛</div><p>Connect wallet to view your donation history</p></div>';
        return;
    }

    container.innerHTML = '<div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div>';

    try {
        // Get all campaign IDs the user donated to
        const campaignIds = await donationContract.methods.getDonorCampaigns(userAccount).call();

        if (!campaignIds || campaignIds.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="icon">📭</div><p>You haven\'t made any donations yet.</p></div>';
            if (statsContainer) statsContainer.classList.add('hidden');
            return;
        }

        // Deduplicate campaign IDs
        const uniqueIds = [...new Set(campaignIds.map(id => Number(id)))];

        let allDonations = [];
        let totalDonated = BigInt(0);

        for (const cId of uniqueIds) {
            const campaign = await donationContract.methods.getCampaign(cId).call();
            const donations = await donationContract.methods.getDonations(cId).call();

            // Filter donations by current user
            for (const d of donations) {
                if (d.donor.toLowerCase() === userAccount.toLowerCase()) {
                    allDonations.push({
                        campaignId: cId,
                        campaignTitle: campaign.title,
                        donor: d.donor,
                        amount: d.amount,
                        timestamp: d.timestamp,
                        message: d.message
                    });
                    totalDonated += BigInt(d.amount);
                }
            }
        }

        // Sort by timestamp descending
        allDonations.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

        // Update stats
        if (statsContainer) {
            statsContainer.classList.remove('hidden');
            setElementText('totalDonated', formatEth(totalDonated) + ' ETH');
            setElementText('campaignsSupported', uniqueIds.length);
            setElementText('totalTxns', allDonations.length);
        }

        if (allDonations.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="icon">📭</div><p>No donations found for your wallet.</p></div>';
            return;
        }

        // Render table
        let html = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Campaign</th>
                            <th>Amount</th>
                            <th>Message</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        for (const d of allDonations) {
            html += `
                <tr>
                    <td><span class="text-purple font-mono">#${d.campaignId}</span> ${d.campaignTitle}</td>
                    <td><strong class="text-green">${formatEth(d.amount)} ETH</strong></td>
                    <td class="text-secondary">${d.message || '—'}</td>
                    <td class="text-muted">${formatDate(d.timestamp)}</td>
                </tr>
            `;
        }

        html += '</tbody></table></div>';
        container.innerHTML = html;

    } catch (err) {
        console.error('History load error:', err);
        container.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>Error loading history. Check contract address.</p></div>';
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════
function shortenAddress(addr) {
    if (!addr) return '—';
    return addr.substring(0, 6) + '...' + addr.substring(addr.length - 4);
}

function formatDate(timestamp) {
    try {
        const ts = Number(timestamp);
        if (ts === 0) return '—';
        return new Date(ts * 1000).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch {
        return '—';
    }
}

function formatEth(wei) {
    try {
        const weiStr = wei.toString();
        if (weiStr === '0') return '0';
        return parseFloat(web3.utils.fromWei(weiStr, 'ether')).toFixed(4);
    } catch {
        return '0';
    }
}

function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function showStatus(elementId, msg, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = msg;
    el.className = `status ${type}`;
    el.classList.remove('hidden');
}

function showNotification(msg, type) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = msg;
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateY(-10px)';
        notif.style.transition = 'all 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 4000);
}
