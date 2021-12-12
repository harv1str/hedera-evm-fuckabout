const dotenv = require('dotenv');
const { chunkByteStream } = require("../../utils/stream")
const {
    Client,
    ContractCallQuery,
    AccountId,
    PrivateKey,
    Hbar,
    ContractFunctionParameters
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

       

    const TOKEN_1 = {"network":"testnet","contractId":"0.0.18353684","contractSolidityAddress":"0000000000000000000000000000000001180e14","file_id":"0.0.18353161"}
    const TOKEN_2 = {"network":"testnet","contractId":"0.0.18355090","contractSolidityAddress":"0000000000000000000000000000000001181392","file_id":"0.0.18354373"}    
    //const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.16646217","contract_solidity_address":"0000000000000000000000000000000000fe0049","file_id":"0.0.16645492"}
    // const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699502","contract_solidity_address":"00000000000000000000000000000000011d54ee","file_id":"0.0.18699501"};
    const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699514","contract_solidity_address":"00000000000000000000000000000000011d54fa","file_id":"0.0.18699513"};

    contractCallResultT1 = await new ContractCallQuery()
        .setGas(75000)
        .setContractId(TOKEN_1.contractId)
        .setFunction('symbol')
        .setQueryPayment(new Hbar(1))
        .execute(client);

    contractCallResultT2 = await new ContractCallQuery()
        .setGas(75000)
        .setContractId(TOKEN_2.contractId)
        .setFunction('symbol')
        .setQueryPayment(new Hbar(1))
        .execute(client);

    contractCallResultUniLen = await new ContractCallQuery()
        .setGas(75000)
        .setContractId(UNI_CONTRACT.contract_id)
        .setFunction('allPairsLength')
        .setQueryPayment(new Hbar(1))
        .execute(client);

    const contractAddr = await new ContractCallQuery()
        .setGas(75000)
        .setContractId(UNI_CONTRACT.contract_id)
        .setFunction('getPairAddress', new ContractFunctionParameters()
          .addAddress(TOKEN_1.contractSolidityAddress)
          .addAddress(TOKEN_2.contractSolidityAddress)
        )
        .setQueryPayment(new Hbar(7))
        .execute(client);
    
      console.log("Contract Solidity Addr:", contractAddr.getAddress())

    console.log(`T1: ${contractCallResultT1.getString(0)}`)
    console.log(`T2: ${contractCallResultT2.getString(0)}`)
    console.log(`UNI_LEN: ${contractCallResultUniLen.getUint256(0)}`)
    // {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.16646217","contract_solidity_address":"0000000000000000000000000000000000fe0049","file_id":"0.0.16645492"}
}

main();
