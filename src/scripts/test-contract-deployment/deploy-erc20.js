const dotenv = require('dotenv');
const { chunkByteStream } = require("../../utils/stream")
const {
    Client,
    ContractCreateTransaction,
    FileCreateTransaction,
    FileAppendTransaction,
    Hbar,
    ContractFunctionParameters,
    AccountId,
    PrivateKey
} = require('@hashgraph/sdk');
const erc20SampleData = require("../contracts/sample_erc20.json");

const tokenBytes = erc20SampleData.object;

dotenv.config();


function createClient(_hedera_network, _operator_id, _operator_key) {
    let client;

    try {
        client = Client.forName(_hedera_network).setOperator(
            AccountId.fromString(_operator_id),
            PrivateKey.fromString(_operator_key)
        );
    } catch (err) {
        console.log(err);
        throw new Error(
            "Environment variables HEDERA_NETWORK, OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

    return client;
}

async function main() {
    const client = createClient(
        process.env.HEDERA_NETWORK, 
        process.env.OPERATOR_ID,
        process.env.OPERATOR_KEY
    );

    const chunkedStream = chunkByteStream(tokenBytes);
    
    const fileTransactionResponse = await new FileCreateTransaction()
        .setKeys([client.operatorPublicKey])
        .setContents(chunkedStream.chunk_arr[0])
        .setMaxTransactionFee(new Hbar(5))
        .execute(client);
    
    const fileReceipt = await fileTransactionResponse.getReceipt(client)
    const fileId = fileReceipt.fileId;
    
    for (let i = 1; i < chunkedStream.chunk_arr.length; i++) {
        console.log(`${chunkedStream.chunk_arr.length} Chunks`);
        console.log(`Processing #: ${i}`);

        if (chunkedStream.chunk_arr[i].length < 1) {
            break;
        }

        await new FileAppendTransaction()
            .setFileId(fileId)
            .setContents(chunkedStream.chunk_arr[i])
            .setMaxTransactionFee(new Hbar(5))
            .execute(client)
    }

    const contractTransactionResponse = await new ContractCreateTransaction()
        .setConstructorParameters(
            new ContractFunctionParameters()
                .addString("TestTokenTwo")
                .addString("TT2")
                .addUint256(100000000000000000000)
        )
        .setGas(100000)
        .setBytecodeFileId(fileId)
        .setAdminKey(client.operatorPublicKey)
        .execute(client);

    const contractReceipt = await contractTransactionResponse.getReceipt(client);

    const contract_info = {
        network: process.env.HEDERA_NETWORK,
        contractId: contractReceipt.contractId.toString(),
        contractSolidityAddress: contractReceipt.contractId.toSolidityAddress(),
        file_id: fileId.toString()
    }

    console.log("Contract Deployed! Info:\n");
    console.log(JSON.stringify(contract_info));
    console.log("\n");
    
    return 0;

    // {"network":"testnet","contractId":"0.0.18353684","contractSolidityAddress":"0000000000000000000000000000000001180e14","file_id":"0.0.18353161"}
    // {"network":"testnet","contractId":"0.0.18355090","contractSolidityAddress":"0000000000000000000000000000000001181392","file_id":"0.0.18354373"}    
}

main();
