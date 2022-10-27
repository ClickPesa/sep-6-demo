import { Utils } from "stellar-sdk";

const requestChallengeTransaction= async ({
  publicKey,
  anchorHomeDomain,
  anchorAuthEndpoint,
  serverSigningKey
}: {
  publicKey: string;
  anchorHomeDomain: string;
  anchorAuthEndpoint: string;
  serverSigningKey: string;
}) => {
  const params = {
    account: publicKey,
    home_domain: new URL(anchorHomeDomain).host,
  };
  const authURL = new URL(anchorAuthEndpoint);
  Object.entries(params).forEach(([key, value]) => {
    authURL.searchParams.append(key, value);
  });
  try {
    const result = await fetch(authURL.toString());
    const resultJson = await result.json();

    if (!resultJson.transaction) {
      throw new Error("The response didn’t contain a transaction");
    }
  ;
    const { tx } = Utils.readChallengeTx(
      resultJson.transaction,
      serverSigningKey,
      resultJson.network_passphrase,
      new URL(anchorHomeDomain).host,
      authURL.host,
    );
    return tx;
  } catch (error) {
    console.log("Error :>> ", error);
  }
};

export default requestChallengeTransaction;
