require("dotenv").config();

const {
  Client,
  AccountId,
  PrivateKey,
  FileCreateTransaction,
  ContractCreateTransaction
} = require("@hashgraph/sdk");

const uniswapObject = require("../contracts/uniswap_v2_pair.json");
const FILE_PART_SIZE = 6000;

async function main() {
    let client;

    try {
        client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY)
        )
    } catch (err) {
        console.log(err);
    }


    const uniswapFactoryByteCode = uniswapObject.object;


    // First, we create a file Transaction to reserve space and a contract storage on the Hashgraph
    // This is an essential Step because it actually puts the bytecode onto an accessible state.
    const fileTransactionResponse = await new FileCreateTransaction()
        .setKeys([client.operatorPublicKey])
        .setContents(uniswapFactoryByteCode)
        .execute(client);

    // There are other helper functions
    const fileReceipt = await fileTransactionResponse.getReceipt(client);
    
    // file ID on Hashgraph
    const fileId = fileReceipt.fileId;

    /* Now.  We create the fucking Contract, yo */

    const contractTransactionResponse = await new ContractCreateTransaction()
        .setGas(75000)
        .setBytecodeFileId(fileId)
        .setAdminKey(client.operatorPublicKey)
        .execute(client);
    
    const contractReceipt = await contractTransactionResponse.getReceipt(client);

    const contractId = contractReceipt.contractId;
    
    const contract_info = {
        network: process.env.HEDERA_NETWORK,
        contract_id: contractId,
        contract_solidity_address: contractId.fromSolidityAddress(),
        file_id: fileId
    }

    console.log("Contract Deployed! Info:\n");
    console.log(JSON.stringify(contract_info))
    console.log("\n");

    return 0;
}

main();