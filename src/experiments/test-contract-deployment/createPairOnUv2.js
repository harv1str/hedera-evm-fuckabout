const {
    Client,
    ContractExecuteTransaction,
    AccountId,
    PrivateKey,
    ContractFunctionParameters,
    ContractCallQuery,
    Hbar
} = require("@hashgraph/sdk");

const dotenv = require('dotenv');
dotenv.config();


const TOKEN_1 = {"network":"testnet","contractId":"0.0.18353684","contractSolidityAddress":"0000000000000000000000000000000001180e14","file_id":"0.0.18353161"}
const TOKEN_2 = {"network":"testnet","contractId":"0.0.18355090","contractSolidityAddress":"0000000000000000000000000000000001181392","file_id":"0.0.18354373"}    
//const UNI_CONTRACT ; 2 = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.16646217","contract_solidity_address":"0000000000000000000000000000000000fe0049","file_id":"0.0.16645492"}
// PRIME: const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699437","contract_solidity_address":"00000000000000000000000000000000011d54ad","file_id":{"shard":{"low":0,"high":0,"unsigned":false},"realm":{"low":0,"high":0,"unsigned":false},"num":{"low":18699435,"high":0,"unsigned":false},"_checksum":null}}
//const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699459","contract_solidity_address":"00000000000000000000000000000000011d54c3","file_id":"0.0.18699458"}
// ALL SEC ON: const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699463","contract_solidity_address":"00000000000000000000000000000000011d54c7","file_id":"0.0.18699461"}
//DEFINE KECCAK256: const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699466","contract_solidity_address":"00000000000000000000000000000000011d54ca","file_id":"0.0.18699465"}
// NOT OK! DEFINE ASSEMBLY: const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699472","contract_solidity_address":"00000000000000000000000000000000011d54d0","file_id":"0.0.18699469"};
// OK BUT SHIT INITIALIZE NO ADDR: const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699495","contract_solidity_address":"00000000000000000000000000000000011d54e7","file_id":"0.0.18699493"};
// NOT OK!  TOO EXPENSIVE const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699499","contract_solidity_address":"00000000000000000000000000000000011d54eb","file_id":"0.0.18699498"};

// OK!  No Introspection : const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699502","contract_solidity_address":"00000000000000000000000000000000011d54ee","file_id":"0.0.18699501"};
// NOT OKAY!  BAD SOLIDITY const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699505","contract_solidity_address":"00000000000000000000000000000000011d54f1","file_id":"0.0.18699504"};
const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.18699514","contract_solidity_address":"00000000000000000000000000000000011d54fa","file_id":"0.0.18699513"}

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
    
    console.log(TOKEN_1.contractSolidityAddress)
    console.log(TOKEN_2.contractSolidityAddress)
    
  const client = createClient(
      process.env.HEDERA_NETWORK, 
      process.env.OPERATOR_ID,
      process.env.OPERATOR_KEY
  );
  
  const contractExecTransactionResponse = await new ContractExecuteTransaction()
    .setContractId(UNI_CONTRACT.contract_id)
    .setGas(1000000)
    .setFunction(
        "createPair",
        new ContractFunctionParameters()
          .addAddress(TOKEN_1.contractSolidityAddress)
          .addAddress(TOKEN_2.contractSolidityAddress)
    )
    .execute(client);

  console.log(contractExecTransactionResponse);
  console.log(contractExecTransactionResponse.transactionHash.toString("hex"));
  console.log(contractExecTransactionResponse.transactionId.toString());
  //console.log(contractExecTransactionResponse.fromSolidityAddress());
  


}

main() 