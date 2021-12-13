// Contract Bytecode File: 0.0.15815942
// New Contract ID: 0.0.15815943
require("dotenv").config();
const { 
    Client,
    PrivateKey,
    AccountId,
    ContractCallQuery,
    Hbar
} = require("@hashgraph/sdk");

async function main() {

    let contractId = "0.0.15815943";

    let client;

    try {
        client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY)
        );
    } catch (err) {
        console.log(err);

        throw new Error(
            "Environment variables HEDERA_NETWORK, OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }
    // Contract Call
    const contractCallResult = await new ContractCallQuery()
        .setGas(75000)
        .setContractId(contractId)
        .setFunction("greet")
        .setQueryPayment(new Hbar(1))
        .execute(client);

    if (contractCallResult.errorMessage != null && contractCallResult.errorMessage != "") {
        console.log(`error calling contract: ${contractCallResult.errorMessage}`);
    }

    const message = contractCallResult.getString(0);
    console.log(`contract message: ${message}`);
}

main();