require("dotenv").config();

const {
  Client,
  AccountId,
  PrivateKey,
  FileCreateTransaction,
  ContractCreateTransaction,
  Hbar,
  FileAppendTransaction,
  ContractFunctionParameters
} = require("@hashgraph/sdk");

const uniswapObject = require("../contracts/uniswap_v2_flat.json");

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

    /*
    const uniswapFactoryByteCode = chunkByteStream(uniswapObject.object);

    

    // First, we create a file Transaction to reserve space and a contract storage on the Hashgraph
    // This is an essential Step because it actually puts the bytecode onto an accessible state.
    const fileTransactionResponse = await new FileCreateTransaction()
        .setKeys([client.operatorPublicKey])
        .setContents(uniswapFactoryByteCode.chunk_arr[0])
        .setMaxTransactionFee(new Hbar(5))
        .execute(client);


    // There are other helper functions
    const fileReceipt = await fileTransactionResponse.getReceipt(client);
    
    // file ID on Hashgraph
    const fileId = fileReceipt.fileId;


    for (let i = 1; i < uniswapFactoryByteCode.chunk_arr.length; i++) {
        console.log(`${uniswapFactoryByteCode.chunk_arr.length} Chunks`);
        console.log(`Processing #: ${i}`);

        if (uniswapFactoryByteCode.chunk_arr[i].length < 1) {
            break;
        }

        await new FileAppendTransaction()
            .setFileId(fileId)
            .setContents(uniswapFactoryByteCode.chunk_arr[i])
            .setMaxTransactionFee(new Hbar(5))
            .execute(client)

    }

    console.log(`FILE_ID: ${fileId}`)
    */
    /* Now.  We create the fucking Contract, yo */

    const fileId = "0.0.16645492";

    const fee_receiver = AccountId.fromString(process.env.OPERATOR_ID).toSolidityAddress();

    const contractTransactionResponse = await new ContractCreateTransaction()
        .setConstructorParameters(
            new ContractFunctionParameters()
            .addAddress(fee_receiver)
        )
        .setGas(75000)
        .setBytecodeFileId(fileId)
        .setAdminKey(client.operatorPublicKey)
        .execute(client);
    
    const contractReceipt = await contractTransactionResponse.getReceipt(client);

    const contractId = contractReceipt.contractId;
    
    const contract_info = {
        feeReceiver: fee_receiver,
        network: process.env.HEDERA_NETWORK,
        contract_id: contractId.toString(),
        contract_solidity_address: contractId.toSolidityAddress(),
        file_id: fileId
    }

    console.log("Contract Deployed! Info:\n");
    console.log(JSON.stringify(contract_info));
    console.log("\n");

    return 0;
}
//{"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.16646217","contract_solidity_address":"0000000000000000000000000000000000fe0049","file_id":"0.0.16645492"}
main() ;