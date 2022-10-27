import { Transaction } from "stellar-sdk";

const submitSignedTransactionChallenge = async ({
  signedChallengeTransaction,
  anchorAuthEndpoint,
}: {
  signedChallengeTransaction: Transaction;
  anchorAuthEndpoint: string;
}) => {
  const params = {
    transaction: signedChallengeTransaction.toEnvelope().toXDR("base64"),
  };
  try {
    const urlParams = new URLSearchParams(params);
    const result = await fetch(anchorAuthEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: urlParams.toString(),
    });
    const resultJson = await result.json();
    if (!resultJson.token) {
      throw new Error("No token returned from `/auth`");
    }
    return resultJson.token;
  } catch (error) {
    console.log("Error :>> ", error);
  }
};

export default submitSignedTransactionChallenge;
