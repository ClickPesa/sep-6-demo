"use strict";

import { Transaction } from "stellar-sdk";
require("dotenv").config();

import {
  activateAccount,
  createTrustline,
  getRandomKeyPair,
} from "./account/account-setup";
import requestChallengeTransaction from "./auth/request-challenge-transaction";
import signChallengeTransactionAccount from "./auth/sign-challenge-transaction";
import submitSignedTransactionChallenge from "./auth/submit-signed-transaction";
import retrieveKYCFieldsToBeCollected from "./kyc/retrieve-kyc-fields";
import getToml from "./shared/get-toml-details";

const horizonURL = process.env.HORIZON_NETWORK as string;
const networkPassphrase = process.env.STELLAR_NETWORK_PASSPHRASE as string;
const assetHoldingLimit = "10000000";
const anchorAsset = "TZS";
const anchorIssuerAccount =
  "GAH572DYUPXZDOKBI76H54WRKMIHDXZFLOFVFBDPKL3WIUTPGGHCQ5K7";
const anchorDomain = "https://sandbox.connect.clickpesa.com";

const main = async () => {
  // GET ANCHOR INFO - SEP1
  const TOML = await getToml(anchorDomain);
  const anchorAuthEndpoint = TOML.WEB_AUTH_ENDPOINT as string;
  const anchorKYCEndpoint = TOML.KYC_SERVER as string;

  // ACCOUNT SETUP
  const accountKeyPair = getRandomKeyPair();
  const { hash: activateAccountHash } = await activateAccount(accountKeyPair);
  const { hash: addTrustlineHash } = await createTrustline({
    horizonURL,
    keyPair: accountKeyPair,
    issuerKey: anchorIssuerAccount,
    asset: anchorAsset,
    networkPassphrase,
    assetHoldingLimit,
  });

  // AUTHENTICATION - SEP10
  const tx = await requestChallengeTransaction({
    publicKey: accountKeyPair.publicKey(),
    anchorHomeDomain: anchorDomain,
    anchorAuthEndpoint,
    serverSigningKey: TOML.SIGNING_KEY as string,
  });
  const signedChallengeTransaction = await signChallengeTransactionAccount({
    challengeTransaction: tx as Transaction,
    networkPassphrase: networkPassphrase as string,
    keyPair: accountKeyPair,
  });
  const JWTToken = await submitSignedTransactionChallenge({
    signedChallengeTransaction,
    anchorAuthEndpoint,
  });

  // KYC - SEP12
  const fieldsToCollect = await retrieveKYCFieldsToBeCollected({
    publicKey: accountKeyPair.publicKey(),
    kycServer: anchorKYCEndpoint,
    token: JWTToken,
  });
  console.log("fieldsToCollect :>> ", fieldsToCollect);

  // ACCOUNT BALANCE
  //const res = await getAccountBalance(accountKeyPair);
  //console.log("result :>> ", res);
};

main();
