import StellarSdk, {
  Account,
  Asset,
  BASE_FEE,
  Keypair,
  Memo,
  MemoHash,
  MemoType,
  Transaction,
  TransactionBuilder,
} from "stellar-sdk";

const transferAssetToAnchor = async ({
  keyPair,
  asset,
  issuerKey,
  networkPassphrase,
  horizonURL,
  anchorAccountId,
  amount,
  memo_type,
  memo,
}: {
  keyPair: Keypair;
  asset: string;
  issuerKey: string;
  networkPassphrase: string;
  horizonURL: string;
  anchorAccountId: string;
  amount: string;
  memo_type: MemoType;
  memo: any;
}) => {
  const server = new StellarSdk.Server(horizonURL);
  const assetInstance: Asset = new StellarSdk.Asset(asset, issuerKey);
  const account: Account = await server.loadAccount(keyPair.publicKey());
  const fee: number = (await server.fetchBaseFee()) || +BASE_FEE;

  const base64ToHex = (base64Str: string) => {
    const bf = Buffer.from(base64Str, "base64");
    return bf.toString("hex");
  };

  if (memo_type === MemoHash) {
    memo = new Memo(memo_type, base64ToHex(memo));
  } else {
    memo = new Memo(memo_type, memo);
  }

  const transaction: Transaction = new TransactionBuilder(account, {
    fee: fee.toString(),
    networkPassphrase: networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: anchorAccountId,
        asset: assetInstance,
        amount,
        memo,
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

export { transferAssetToAnchor };
