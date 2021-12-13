# Porting report for builds from existing Ethereum/Polygon/Klaytn/BSC sources

# Uniswap V2

In order to embrace the simplicity of Uniswap V2 and test pair additions and how addresses and accounts are called after our initial tests, we tried to deploy a Uniswap V2 contract as a flattened bit of code.  The ultimate goal of this will be to use this doc as a jumping off point for creating a Uniswap V2 design doc for an AMM system.

Our first flattened code can be found in `/uniswap_v2_examples/uniswap_v2_flat.sol`.

Unfortunately, on actual deployment, the file creation transaction failed with the SDK reporting a Transaction Oversize error:

`transaction 0.0.177305@1638462837.243542962 failed precheck with status TRANSACTION_OVERSIZE`

This is due to the limited amount of data that can be actually placed inside of a file on hashgraph.

We also attempted to simply deploy the pairs contract by itself (Compiled Bytecode is in `/uniswap_v2_examples/uniswap_v2_pair.json`)

This also returned a:

`StatusError: transaction 0.0.177305@1638463111.216279768 failed precheck with status TRANSACTION_OVERSIZE`

This is a problem as many contracts on Ethereum require rather large contracts.  In order to make them fit we will need to break up the libraries into individual deployments and then insert references to them.  

An example of reducing contract size can be found [here](https://ethereum.org/en/developers/tutorials/downsizing-contracts-to-fight-the-contract-size-limit/).  We will be using some of these techniques for trying to trim down some of the contracts.    In the interest of not re-inventing the wheel whe will just produce a checklist from the above source and follow that and report on outcomes.

The primary file under surgery can be found in `/uniswap_v2_examples/uniswap_v2_flat.sol` with the outcome file being located in `/src/uniswap_v2_deployment/source/uniswapV2HederaModifications.sol`.  We will also provide in the `/src/scripts` folder a breakdown of the contracts that are not flattened for easier viewing.

| Technique | Impact | Description | Implementation |
| :-------: | :----: | :---------: | :------------: |
| Batch Deploy | Low | Utilize the mechanism provided by Hedera SDK to place an arbitrary sized contract into the file store.  This is probably the best way to test but can lead to an extreme number of file transactions.  Likewise, the actual 'init' of the contracts (a separate transaction on Hedera) may exceed the maximum 300,000 Gas.  | Functions provided by Hedera SDK in the `FileAppendTransaction` object. |
| Separate Contracts | High | Seperate the contract into multiple smaller ones | Start by breaking up the Token, TokenList, and ERC |
| Libraries | High | Create Libraries | This may not be an issue as the actual 'amount' of bytecode is the issue |
| Proxies | High | Use proxies | We can't do this... No DELEGATECALL |

For the successful test, we used a mix of Batch Deploy and Separate Contracts

## Process - Uniswap V2 Core Solidity

Source Files can be found [here](https://github.com/Uniswap/v2-core).

* Why Uniswap V2 instead of V3? *
Since the purpose of this investigation is twofold:

* Discover if the speed/accesibility characteristics are appropriate for porting an AMM/BondCurve infrastructure
* Study if Hedera has more environmentally friendly characteristics than POW chains and if this comes at the cost of usability

We are interested moreso in the 'whether this works' first and 'how to deploy' second which means the simplicity of V2 is useful.  Since V3 introduces many new pieces of functionality (and also is compiled under a much newer solc version than V2), it adds a couple of layers of complexity that are extraneous to our initial inquiry.  V3 will possibly be included in the future.

* NOTE: We ARE NOT looking at the decentralization characteristics of Hedera for this one as the 'enterprise-y-ness' of the thing is a trait we are looking at and, by technological nature, this means Hashgraph/Hedera is a bit more centralized.  At the end of the day, Ethereum is our first love, but it is not appropriate for certain business and corporate realities. *

We have successfully deployed and registered a pair with the V2 contract on the Hedera testnet.  If you want to skip to the end and just look at the deployment here are the important bits:

###### Factory Hedera Deployment

| Name | Thing |
| :---: | :---: |
| Network | `testnet` |
| Contract ID | `0.0.18699514` |
| File ID | `0.0.18699513` |
| EVM Address | `0x00000000000000000000000000000000011d54fa` |
| Fee Receiver (Constructor Arg.) | `000000000000000000000000000000000002b499` |

###### Test Token 1 (TT1)

| Name | Thing |
| :---: | :---: |
| Network | `testnet` |
| Contract ID | `0.0.18353684` |
| File ID | `0.0.18353161` |
| EVM Address | `0x0000000000000000000000000000000001180e14` |
| Fee Receiver (Constructor Arg.) | `000000000000000000000000000000000002b499` |
| Name (Constructor Arg.) | `TestTokenOne` |
| Decimals (Constructor Arg.) | 18 |
| Symbol (Constructor Arg.) | `TT1` |
| Initial Supply (Constructor Arg.) | 100 Tokens |

###### Test Token 2 (TT2)

| Name | Thing |
| :---: | :---: |
| Network | `testnet` |
| Contract ID | `0.0.18355090` |
| File ID | `0.0.18354373` |
| EVM Address | `0x0000000000000000000000000000000001181392` |
| Name (Constructor Arg.) | `TestTokenTwo` |
| Decimals (Constructor Arg.) | 18 |
| Symbol (Constructor Arg.) | `TT2` |
| Initial Supply (Constructor Arg.) | 100 Tokens |

##### Pair: TT1-TT2 
|  Name |   |
| :-----: | :-----: |
| Source | `/experiments/uniswap_v2_deployment/source/uniswapV2HederaModifications.sol` |
| EVM Contract Address | 00000000000000000000000000000000011d54fb |

You can check out validation of these contracts on a Hedera block explorer, however, at the time of the writing of this document, some of the EVM visualization stuff is a bit limited.

#### Uniswap V2 (Highlevel-ish) Summary

The core Uniswap V2 contracts consists of two primary contracts: `UniswapV2Factory.sol` and `UniswapV2Pair.sol` with various libraries from the closest thing Solidity has to a standard library included and a specialized `UniswapV2ERC20.sol` contract used for LP tokens.  Descriptions below:

| Contract Name | Description |
| :-----: | :-----: |
| `UniswapV2Factory.sol` | The factory contract which has a `createPair()` call which registers and instantiates UniswapV2Pair contracts.  It acts as a 'controller' and 'factory' for the various Uniswap V2 system |
| `UniswapV2Pair.sol` | This is the core functionality contract of the swapping mechanism for Uniswap. |

#### UniswapV2Factory.sol Summary & Modifications

| Function| Description | Modifications |
| :-----: | :-----: | :-----: |
| `feeTo() external view returns (address)` | View Function for checking out who the fee recipient is. |  |
| `feeToSetter() external view returns (address)` | Analogous to `owner`.  This address sets the recipient fee returned by `feeTo()` |  |
| `getPair(address tokenA, address tokenB) external view returns (address pair)` | Mapping for pairs and the address of UniswapV2Pair deployments. | None |
| `allPairs(uint) external view returns (address pair)` | Array of pair addresses. | None  |
| `allPairsLength() external view returns (uint)` | Returns `allPairs.length` | None |
| `createPair(address tokenA, address tokenB) external returns (address)` | create A New Pair contract | Removed `assembly` block and `create2` usage for pre-computing contracts for compatibility. |
| `setFeeTo(address) external` | Sets FeeTo public address variable for recipient of fees.  Can only be set by  `feeToSetter` address | None |
| `setFeeToSetter(address) external` | Sets `feeToSetter` address variable.  Can only be set by previous `feeToSetter` address | None |

#### UniswapV2Pair.sol Summary & Modifications

** NOTE: This interface is rather large and shares a quite a few functions with the ERC20 interface. We will only be addressing the unique core state changing functions and adding a list for of various view functions included below the description table.  Low level function in descriptions means functions that do critical movements but without certain checks. **

| Function| Description | Modifications |
| :-----: | :-----: | :-----: |
| `mint()` | Low level function. Mints liquidity and does checks against current liquidity and requested.  Emits Mint event. | None |
| `burn()` | Burns Liquidity and returns pair tokens to sender if liquidity is sufficient. | None |
| `swap()` | Swap function for exchanging tokens | None |
| `skim()` | Uh... Forces Balances to match reserves | None |
| `sync()` | Uh... Forces reserves to match balances | None |

For Uniswap specific references for this contract checkout the [docs](https://docs.uniswap.org/protocol/V2/reference/smart-contracts/pair).

## Process - Using Hedera SDK with Solidity Contracts

We modified and wrote out a modified version of the Uniswap V2 Core contracts (Check Appendix for notes on this).  


We wrote a quick util function for chunking the byte string (`/src/utils/stream.js`):

```
function chunkByteStream(_byteStream){
    const FILE_PART_SIZE = 3000;
    let chunks = [];

    if (_byteStream.length <= FILE_PART_SIZE) {
        return {ttl_size: _byteStream.length, chunk_count: 1, remainder_bytes: 0, chunks: [_byteStream]}
    }

    const chunk_num = _byteStream.length/FILE_PART_SIZE;
    const remainder = _byteStream.length % FILE_PART_SIZE;
    let start_idx = 0;
    let end_idx = FILE_PART_SIZE;

    for (let i = 0; i < chunk_num; i++) {
        const chunk = _byteStream.slice(start_idx, end_idx);
        chunks.push(chunk);
        start_idx = end_idx;
        end_idx += FILE_PART_SIZE;
    }

    remainder > 0? chunks.push(_byteStream.slice(end_idx, end_idx + remainder)) : "";


    return {
        ttl_size: _byteStream.length,
        chunk_count: chunk_num,
        remainder_bytes: remainder,
        chunk_arr: chunks
    }

}
```

##### Implementation
```
const uniswapFactoryByteCode = chunkByteStream(uniswapObject.object);
```

After batching the byte-stream, we return an object with necessary data for looping over the byte string array.

# The Periphery

Concept & Samples can be found [here](https://github.com/Uniswap/v2-periphery)

As you can see above, in order to ensure backwards compatability with existing Pool contracts, we have made only minimal adjustments to implementations while keeping the interfaces for each contract the same (admittedly making certain aspects more expensive on gas).  However, due to limitations surrounding blocks and assembley calls in Hedera, certain functionalities and patterns commonly used in DeFi may not be available to developers.


# Next Up

We will need to also implement the following 2 other contracts to get a minimal contract set to run Uniswap: 

* UniswapV2Router
* UniswapV2Oracle 

This Hedera ID information will be relevent up to `21 December, 2021` when the testnet on Hedera resets, we will redeploy and update this and any other relevant docs after this date.

# Appendix
## A.1 Failed Deployments and Deployment Notes

`const UNI_CONTRACT ; 2 = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.16646217","contract_solidity_address":"0000000000000000000000000000000000fe0049","file_id":"0.0.16645492"}`

`PRIME: const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699437","contract_solidity_address":"00000000000000000000000000000000011d54ad","file_id":{"shard":{"low":0,"high":0,"unsigned":false},"realm":{"low":0,"high":0,"unsigned":false},"num":{"low":18699435,"high":0,"unsigned":false},"_checksum":null}}`

`const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699459","contract_solidity_address":"00000000000000000000000000000000011d54c3","file_id":"0.0.18699458"}`

`ALL SEC ON: const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699463","contract_solidity_address":"00000000000000000000000000000000011d54c7","file_id":"0.0.18699461"}`

`DEFINE KECCAK256: const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699466","contract_solidity_address":"00000000000000000000000000000000011d54ca","file_id":"0.0.18699465"}`

`NOT OK! DEFINE ASSEMBLY: const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699472","contract_solidity_address":"00000000000000000000000000000000011d54d0","file_id":"0.0.18699469"};`

`OK BUT SHIT INITIALIZE NO ADDR: const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699495","contract_solidity_address":"00000000000000000000000000000000011d54e7","file_id":"0.0.18699493"};`

`NOT OK!  TOO EXPENSIVE const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699499","contract_solidity_address":"00000000000000000000000000000000011d54eb","file_id":"0.0.18699498"};`

`OK!  No Introspection : const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699502","contract_solidity_address":"00000000000000000000000000000000011d54ee","file_id":"0.0.18699501"};`

`NOT OKAY!  BAD SOLIDITY const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699505","contract_solidity_address":"00000000000000000000000000000000011d54f1","file_id":"0.0.18699504"};`

## A.2 Bytecode Objects
