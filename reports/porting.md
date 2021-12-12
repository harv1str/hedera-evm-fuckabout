# Porting report for builds from existing Ethereum/Polygon/Klaytn/BSC sources

# Uniswap V2

In order to embrace the simplicity of Uniswap V2 and test pair additions and how addresses and accounts are called after our initial tests, we tried to deploy a Uniswap V2 contract as a flattened bit of code.  

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

## Process

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





# Appendix
## A.1 Bytecode Objects
