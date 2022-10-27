import { Transaction, Keypair } from "stellar-sdk";

const signChallengeTransactionAccount = async ({
  challengeTransaction,
  networkPassphrase,
  keyPair,
}: {
  challengeTransaction: Transaction;
  networkPassphrase: string;
  keyPair: Keypair;
}) => {
  const envelope = challengeTransaction.toEnvelope().toXDR("base64");
  const transaction = new Transaction(envelope, networkPassphrase);
  transaction.sign(keyPair);
  return transaction;
};

export default signChallengeTransactionAccount;
