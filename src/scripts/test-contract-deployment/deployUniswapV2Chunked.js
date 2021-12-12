require("dotenv").config();

const {
  Client,
  AccountId,
  PrivateKey,
  FileCreateTransaction,
  ContractCreateTransaction,
  Hbar,
  FileAppendTransaction,
  ContractFunctionParameters,
  ContractCallQuery
} = require("@hashgraph/sdk");

//const uniswapObject = require("../contracts/uniswap_v2_flat.json");
const uniswapObject = require("../contracts/modifiedUniswap_variable.json");

async function queryContract(_client, _contractId, _function, _args) {
    // Illustrative example
    const contractCall = new ContractCallQuery()
        .setGas(75000)
        .setContractId(_contractId)
        .setFunction(_function)

    if (_args && _args.map && _args.length && _args.length > 0) { //Ducktyping for Arrays ATM.  Switch to Typescript
        // Do Argument version
    }

    contractCall.setQueryPayment(new Hbar(1))
    const contractCallResp = await contractCall.execute(_client);

    return contractCallResp;
}

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



async function deployContractOnFile(_fileId, _client){
    const fileId = _fileId; // To-Do: Validation  "0.0.16645492" 

    const fee_receiver = AccountId.fromString(process.env.OPERATOR_ID).toSolidityAddress();

    const contractTransactionResponse = await new ContractCreateTransaction()
        .setConstructorParameters(
            new ContractFunctionParameters()
            .addAddress(fee_receiver)
        )
        .setGas(75000)
        .setBytecodeFileId(fileId)
        .setAdminKey(client.operatorPublicKey)
        .execute(_client);
    
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

    return contract_info;
}

/*
    MAIN EXPERIMENTATION AREA
*/

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
    
    // _client, _contractId, _function, _args
    //const queryResp = await queryContract(client, "0.0.16646217", "allPairsLength");
   // console.log(`All Pairs Length Call:`, queryResp.getUint8(0));

    
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
    
    // Actual Contract Creation

    // const fileId = "0.0.16645492";

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
        file_id: fileId.toString()
    }

    console.log("Contract Deployed! Info:\n");
    console.log(JSON.stringify(contract_info));
    console.log("\n");

    return 0;
}
//{"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.16646217","contract_solidity_address":"0000000000000000000000000000000000fe0049","file_id":"0.0.16645492"}
// 2: {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699437","contract_solidity_address":"00000000000000000000000000000000011d54ad","file_id":{"shard":{"low":0,"high":0,"unsigned":false},"realm":{"low":0,"high":0,"unsigned":false},"num":{"low":18699435,"high":0,"unsigned":false},"_checksum":null}}
main() ;

