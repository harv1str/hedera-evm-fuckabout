require("dotenv").config();

const {
    Client,
    PrivateKey,
    ContractCallQuery,
    Hbar,
    AccountId,
    ContractId
} = require("@hashgraph/sdk");


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


    //const contractId = "0.0.15818143"
    const contractId = "0.0.15817884";
    console.log(`Using contract ID: ${contractId}`);


    const contractCallResult = await new ContractCallQuery()
        .setGas(75000)
        .setContractId(contractId)
        .setFunction("get_message")
        .setQueryPayment(new Hbar(1))
        .execute(client);

    const contractOwnerCallResult = await new ContractCallQuery()
        .setGas(75000)
        .setContractId(contractId)
        .setFunction("owner")
        .setQueryPayment(new Hbar(1))
        .execute(client);

    // Check if an error was returned
    if (contractCallResult.errorMessage != null && contractCallResult.errorMessage != "") {
        console.log(`error calling contract: ${contractCallResult.errorMessage}`);
    }

    // Get the message from the result
    // The `0` is the index to fetch a particular type from
    //
    // e.g.
    // If the return type of `get_message` was `(string[], uint32, string)`
    // then you'd need to get each field separately using:
    //      const stringArray = contractCallResult.getStringArray(0);
    //      const uint32 = contractCallResult.getUint32(1);
    //      const string = contractCallResult.getString(2);

    const message = contractCallResult.getString(0);
    const contract_id = contractId;
    const contract_id_obj = ContractId.fromString(contract_id);
    console.log(contract_id_obj.toSolidityAddress());
    const contract_owner_solidity_address = contractOwnerCallResult.getAddress(0); // Only Returns One thing
    const account_id_from_solidity_address = AccountId.fromSolidityAddress(contract_owner_solidity_address);

    console.log(`contract message: ${message} for owner: ${account_id_from_solidity_address}`);

    return 0;
}

void main();