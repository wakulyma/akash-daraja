// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IAxelarGateway.sol";
//this is the contract for the liquidity pool; users can stake for earning rewards imposed on trades(LPs)
//can withdraw from the pool afer a set period of time; time lock yet to be implemented

//permissioned EOA accounts will initiate the transfer to cosmos, when they call the bridgeTo() function
//so maintain map of addresses permissioned for this
//

contract DarajaLiquidityPool is
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable,
    OwnableUpgradeable,
    ERC20PermitUpgradeable,
    UUPSUpgradeable
{
    IAxelarGateway public immutable iAxelarGateway;
    IERC20 public immutable iUSDC_Contract;

    mapping(address => uint8) public PermissionedActors;

    struct DepositRequestHash {
        string hash;
        uint processed; //0 if created and not processed, 1 if processed
        bool isInitialized; //to enable checking if a key exists in the mapping
        bool fiatDepositSuccessful;
        bool crossChainSuccessful;
    }

    mapping(string => DepositRequestHash) public depositRequests; //mapping of request id to hash

    modifier onlyPermissioned() {
        require(
            PermissionedActors[msg.sender] == 1,
            "Only Permissioned Actors Can Perform This Function"
        );
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(IAxelarGateway AxelarGateway_, IERC20 USDC_Contract_) {
        iAxelarGateway = AxelarGateway_; //ETH SEPOLIA gateway address: 0xe432150cce91c13a887f7D836923d5597adD8E31
        iUSDC_Contract = USDC_Contract_; //ETH SEPOLIA aUSDC address: 0x254d06f33bDc5b8ee05b2ea472107E300226659A
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __ERC20_init("DarajaLP", "DRJ");
        __ERC20Burnable_init();
        __ERC20Pausable_init();
        __Ownable_init(initialOwner);
        __ERC20Permit_init("DarajaLP");
        __UUPSUpgradeable_init();
    }

    /* function _verifyRequestUnprocessed(string calldata requestId) internal view returns (uint) {
    
        DepositRequestHash memory _depositRequest = depositRequests[requestId];

        require(_depositRequest.isInitialized,"requestId not found in storage");

        return  _depositRequest.processed;
    } */

    function getDepositRequestHash(
        string calldata requestId
    ) external view returns (DepositRequestHash memory) {
        DepositRequestHash memory _depositRequest = depositRequests[requestId];
        require(
            _depositRequest.isInitialized,
            "requestId not found in storage"
        );
        return _depositRequest;
    }

    //function is called only after webhook is received with the results of the particular deposit event
    function updateDepositRequestHash(
        string calldata requestId,
        string calldata updatedDepositRequestHash,
        bool fiatDepositSuccessful,
        string calldata osmosisAddress,
        uint256 amount
    ) external onlyPermissioned returns (bool) {
        DepositRequestHash memory _depositRequest = depositRequests[requestId];
        require(
            _depositRequest.isInitialized,
            "requestId not found in storage"
        );
        require(_depositRequest.processed == 0, " request already processed");

        depositRequests[requestId].hash = updatedDepositRequestHash;
        depositRequests[requestId].processed = 1;
        depositRequests[requestId]
            .fiatDepositSuccessful = fiatDepositSuccessful;

        if (fiatDepositSuccessful) {
            _transferUSDC(osmosisAddress, amount);
            depositRequests[requestId].crossChainSuccessful = true;
        }

        //can emit events instead
        return true;
    }

    //function called after customer initializes payment intent to store initial hash of deposit details
    function addDepositRequestHash(
        string calldata requestHash,
        string calldata requestId
    ) external onlyPermissioned returns (bool) {
        //verify the hash doesn't exist in mapping first to avoid overwriting
        DepositRequestHash memory _depositRequest = depositRequests[requestId];
        require(
            !_depositRequest.isInitialized,
            "requestId already exists in storage"
        );
        //then add request to mapping
        depositRequests[requestId].hash = requestHash;
        depositRequests[requestId].processed = 0;
        depositRequests[requestId].isInitialized = true;
        depositRequests[requestId].fiatDepositSuccessful = false;
        depositRequests[requestId].crossChainSuccessful = false;

        //can emit event instead
        return true;
    }

    //function to transfer USDC assets to user's address on osmosis: charge a fixed fee, 1% for now
    function _transferUSDC(
        string calldata osmosisAddress,
        uint256 amount
    ) private {
        uint256 amountTransferrable = (amount * 99) / 100;
        iAxelarGateway.sendToken(
            "osmosis-7",
            osmosisAddress,
            "aUSDC",
            amountTransferrable
        );
    }
    //TODO:
    //tokenize the deposit using chainlink, have an AKT/akUSD pool, whereby the akUSD represents the tokenized deposits. akUSD is backed by the cash deposits, which can
    //be improved by leveraging chainlink feeds
    //automate the purchase of USDC when market conditions are favourable?

    //function to add liquidity: mints an equivalent number of LP tokens, in the ratio 1:1. This is not final
    function addLiquidity(uint256 amount) public returns (bool) {
        //authorize this contract as spender
        iUSDC_Contract.approve(address(this), amount);
        //uses transferFrom() token of ERC20 to transfer tokens here, to smart contract
        iUSDC_Contract.transferFrom(msg.sender, address(this), amount);
        //then mints the LP ERC20 tokens
        _mint(msg.sender, amount);
        //replace to use events
        return true;
    }

    //function to withdraw LP tokens: can be modified for LP tokens to have a vesting period.
    function withdrawLiquidity(uint256 amount) public returns (bool) {
        //transfers the underlying asset to the owner redeeming their share of LP tokens, with accrued interest gained

        //burns the LP token
        _burn(msg.sender, amount);
        //return equivalent amount of liquidity, + interest
        iUSDC_Contract.transfer(msg.sender, ((amount * 110) / 100));

        //should emit event
        return true;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    /* function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    } */

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    // The following functions are overrides required by Solidity.

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20Upgradeable, ERC20PausableUpgradeable) {
        super._update(from, to, value);
    }
}
