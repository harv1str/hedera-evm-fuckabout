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

The primary file under surgery can be found in `/uniswap_v2_examples/uniswap_v2_flat.sol` with the outcome file being located in `/uniswap_v2_examples/uniswap_v2_minimizing.sol`.  We will also provide in the `/src/scripts` folder a breakdown of the contracts that are not flattened for easier viewing.

| Technique | Impact | Description | Implementation |
| :-------: | :----: | :---------: | :------------: |
| Seperate Contracts | High | Seperate the contract into multiple smaller ones | Start by breaking up the Token, TokenList, and ERC |
| Libraries | High | Create Libraries | This may not be an issue as the actual 'amount' of bytecode is the issue |
| Proxies | High | Use proxies | We can't do this... No DELEGATECALL |







# Appendix
safeMath:
```
{
	"linkReferences": {},
	"object": "60556023600b82828239805160001a607314601657fe5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea265627a7a723158202633353a4c2a1f8fe45e4fafb724d010e9fba6f4bcd823b654f44e37de6e4b0e64736f6c63430005100032",
	"opcodes": "PUSH1 0x55 PUSH1 0x23 PUSH1 0xB DUP3 DUP3 DUP3 CODECOPY DUP1 MLOAD PUSH1 0x0 BYTE PUSH1 0x73 EQ PUSH1 0x16 JUMPI INVALID JUMPDEST ADDRESS PUSH1 0x0 MSTORE PUSH1 0x73 DUP2 MSTORE8 DUP3 DUP2 RETURN INVALID PUSH20 0x0 ADDRESS EQ PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x0 DUP1 REVERT INVALID LOG2 PUSH6 0x627A7A723158 KECCAK256 0x26 CALLER CALLDATALOAD GASPRICE 0x4C 0x2A 0x1F DUP16 0xE4 0x5E 0x4F 0xAF 0xB7 0x24 0xD0 LT 0xE9 0xFB 0xA6 DELEGATECALL 0xBC 0xD8 0x23 0xB6 SLOAD DELEGATECALL 0x4E CALLDATACOPY 0xDE PUSH15 0x4B0E64736F6C634300051000320000 ",
	"sourceMap": "4183:430:0:-;;132:2:-1;166:7;155:9;146:7;137:37;255:7;249:14;246:1;241:23;235:4;232:33;222:2;;269:9;222:2;293:9;290:1;283:20;323:4;314:7;306:22;347:7;338;331:24"
}```

Math:

```
{
	"linkReferences": {},
	"object": "60556023600b82828239805160001a607314601657fe5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea265627a7a7231582030b0ef7b8e3770ce5b7f87d68e5d5f748df7f4e6962e30c76b5649a7dd34139964736f6c63430005100032",
	"opcodes": "PUSH1 0x55 PUSH1 0x23 PUSH1 0xB DUP3 DUP3 DUP3 CODECOPY DUP1 MLOAD PUSH1 0x0 BYTE PUSH1 0x73 EQ PUSH1 0x16 JUMPI INVALID JUMPDEST ADDRESS PUSH1 0x0 MSTORE PUSH1 0x73 DUP2 MSTORE8 DUP3 DUP2 RETURN INVALID PUSH20 0x0 ADDRESS EQ PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x0 DUP1 REVERT INVALID LOG2 PUSH6 0x627A7A723158 KECCAK256 ADDRESS 0xB0 0xEF PUSH28 0x8E3770CE5B7F87D68E5D5F748DF7F4E6962E30C76B5649A7DD341399 PUSH5 0x736F6C6343 STOP SDIV LT STOP ORIGIN ",
	"sourceMap": "7945:522:0:-;;132:2:-1;166:7;155:9;146:7;137:37;255:7;249:14;246:1;241:23;235:4;232:33;222:2;;269:9;222:2;293:9;290:1;283:20;323:4;314:7;306:22;347:7;338;331:24"
}

```