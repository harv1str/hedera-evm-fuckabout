const {
    Client,
    ContractExecuteTransaction,
    AccountId,
    PrivateKey,
    ContractFunctionParameters
} = require("@hashgraph/sdk");

const dotenv = require('dotenv');
dotenv.config();


const TOKEN_1 = {"network":"testnet","contractId":"0.0.18353684","contractSolidityAddress":"0000000000000000000000000000000001180e14","file_id":"0.0.18353161"}
const TOKEN_2 = {"network":"testnet","contractId":"0.0.18355090","contractSolidityAddress":"0000000000000000000000000000000001181392","file_id":"0.0.18354373"}    
const UNI_CONTRACT = {"feeReceiver":"000000000000000000000000000000000002b499","network":"testnet","contract_id":"0.0.16646217","contract_solidity_address":"0000000000000000000000000000000000fe0049","file_id":"0.0.16645492"}

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

  const contractExecTransactionResponse = await new ContractExecuteTransaction()
    .setContractId(UNI_CONTRACT.contract_id)
    .setGas(400000)
    .setFunction(
        "createPair",
        new ContractFunctionParameters()
          .addAddress(TOKEN_1.contractSolidityAddress)
          .addAddress(TOKEN_2.contractSolidityAddress)
    )
    .execute(client);

  console.log(contractExecTransactionResponse)
  console.log(contractExecTransactionResponse.transactionHash.toString("hex"))
  console.log(contractExecTransactionResponse.transactionId.toString());
}

main()