import StellarSdk, {
  Account,
  AccountResponse,
  Asset,
  BASE_FEE,
  Keypair,
  Operation,
  Transaction,
  TransactionBuilder,
} from "stellar-sdk";


const getRandomKeyPair = () => {
  return StellarSdk.Keypair.random();
};


const activateAccount = async (keyPair: Keypair) => {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(
        keyPair.publicKey()
      )}`
    );
    const responseJSON = await response.json();
    return responseJSON;
  } catch (e) {
    console.error("ERROR!", e);
  }
};

const createTrustline = async ({
  keyPair,
  asset,
  issuerKey,
  networkPassphrase,
  assetHoldingLimit,
  horizonURL,
}: {
  keyPair: Keypair;
  asset: string;
  issuerKey: string;
  networkPassphrase: string;
  assetHoldingLimit: string;
  horizonURL: string;
}) => {
  const server = new StellarSdk.Server(horizonURL);
  const newAsset: Asset = new StellarSdk.Asset(asset, issuerKey);
  const account: Account = await server.loadAccount(keyPair.publicKey());
  const fee: number = (await server.fetchBaseFee()) || +BASE_FEE;
  const transaction: Transaction = new TransactionBuilder(account, {
    fee: fee.toString(),
    networkPassphrase: networkPassphrase,
  })
    .addOperation(
      Operation.changeTrust({
        asset: newAsset,
        limit: assetHoldingLimit,
      })
    )
    .setTimeout(30)
    .build();
  try {
    transaction.sign(keyPair);
    return await server.submitTransaction(transaction);
  } catch (error: any) {
    console.log("Error :>> ", error);
  }
};

const getAccountBalance = async (horizonURL: string, keyPair: Keypair) => {
  const server = new StellarSdk.Server(horizonURL);
  const { balances }: AccountResponse = await server.loadAccount(
    keyPair.publicKey()
  );
  return balances;
};

export {getRandomKeyPair,  activateAccount, createTrustline, getAccountBalance };
