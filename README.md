# hedera-evm-fuckabout
This is an example implementation of the hedera-evm in javascript derived from the examples and condensed down for easy illustration.

# Why Do This?

Since trying to use the current rendition (as of Nov 2020) of the Javascript SDK with the new Besu-based EVM smart contracts and solidity functionality (very exciting, btw) is akin to trying to get a bundle of desiccated dog dicks strung together on a necklace, we have put together some illustration docs and testing reports for any idiots trying to port or deploy on Hedera.  

# Table of Contents 

| Directory | Description |
| :-------: |  :--------: |
| `/hedera-examples`  | Hedera supplied contract exapmples found [here](https://github.com/hashgraph/hedera-sdk-js/tree/main/examples).  We did this just to make it so you dont go crosseyed from trying to parse through the normal example directory |
| `/examples/solidity-shit` | Hedera supplied Solidity stuff |
| `/src` | This is the source stuff for the deployer web app and sample frontend (DO NOT USE THIS IS PRODUCTION WITHOUT HEAVY MODIFICATION` |
| `/reports`| This is an assemblage of reports written in markdown about various experiments we are running on Solidity/HederaEVM.  Accuracy and writing quality may vary. |
| `/src/experiments` | This is the experimentation area (not maintenence or deployment or production related) where the dirty work is being done |

# A Note on Versioning

This is using the latest (``) commit of the SDK main branch and may need updating after the 2.X deprecation.

- Written by Eddi