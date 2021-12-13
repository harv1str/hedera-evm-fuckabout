require("dotenv").config();

const {
    Client,
    PrivateKey,
    AccountId,
    ContractCreateTransaction,
    FileCreateTransaction,
    ContractExecuteTransaction,
    Hbar
} = require("@hashgraph/sdk");

const factoryPattern = require("../contracts/test_factory.json");

async function main() {
  let client;

  
    try {
        client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY)
        );
    } catch {
        throw new Error(
            "Environment variables HEDERA_NETWORK, OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }


  const contractByteCode = factoryPattern.object;

  const fileTransactionResponse = await new FileCreateTransaction()
      .setKeys([client.operatorPublicKey])
      .setContents(contractByteCode)
      .execute(client);

  const fileReceipt = await fileTransactionResponse.getReceipt(client);

  const fileId = fileReceipt.fileId;

  const contractTransactionResponse = await new ContractCreateTransaction()
    .setGas(75000)
    .setBytecodeFileId(fileId)
    .setAdminKey(client.operatorPublicKey)
    .execute(client);

  const contractReceipt = await contractTransactionResponse.getReceipt(client);

  const contractId = contractReceipt.contractId;

  const createObjectCallResp = await new ContractExecuteTransaction()
      .setGas(750000)
      .setContractId(contractId)
      .setFunction("createNewObject")
      .execute(client)

  console.log(createObjectCallResp)
  console.log(contractId)

}

main();