require("dotenv").config();

const { 
    Client,
    PrivateKey,
    AccountId,
    ContractCreateTransaction,
    FileCreateTransaction,
} = require("@hashgraph/sdk");

console.log("ENV: ",process.env) 

const helloWorld = require("../contracts/hello_world.json");

async function main() {
    let client;ß

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

    const contractByteCode = helloWorld.object;

    const fileTransactionResponse = await new FileCreateTransaction()
        .setKeys([client.operatorPublicKey])
        .setContents(contractByteCode)
        .execute(client);ß

    const fileReceipt = await fileTransactionResponse.getReceipt(client);
    
    const fileId = fileReceipt.fileId;

    console.log(`Contract Bytecode File: ${fileId}`);

    const contractTransactionResponse = await new ContractCreateTransaction()
        .setGas(75000)
        .setBytecodeFileId(fileId)
        .setAdminKey(client.operatorPublicKey)
        .execute(client);

    const contractReceipt = await contractTransactionResponse.getReceipt(client);

    const contractId = contractReceipt.contractId;

    console.log(`New Contract ID: ${contractId}`);


    /*
    // Contract Call (To be checked later)
    const contractCallResult = await new ContractCallQuery()
        .setGase(75000)
        .setContractId(contractId)
        .setFunction("greet")
        .setQueryPayment(new Hbar(1))
        .execute(client);

    if (contractCallResult.errorMessage != null && contractCallResult.errorMessage != "") {
        console.log(`error calling contract: ${contractCallResult.errorMessage}`);
    }

    const message = contractCallResult.getString(0);
    console.log(`contract message: ${message}`);
    */

    // No Delete.

}

void main();