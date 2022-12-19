"use strict";

require("dotenv").config();

import { Transaction } from "stellar-sdk";
import {
  activateAccount,
  createTrustline,
  getAccountBalance,
  getRandomKeyPair,
} from "./account/account-setup";
import requestChallengeTransaction from "./auth/request-challenge-transaction";
import signChallengeTransactionAccount from "./auth/sign-challenge-transaction";
import submitSignedTransactionChallenge from "./auth/submit-signed-transaction";
import retrieveKYCFieldsToBeCollected from "./kyc/retrieve-required-fields";
import getToml from "./shared/get-toml-details";
import submitCollectedKYCFields from "./kyc/submit-collected-fields";
import { sampleUser } from "./shared/sample-user-info";
import { initiateDeposit } from "./deposit/initiate-sep6-deposit";
import { retrieveSEP6Info } from "./deposit/retrieve-sep6-info";
import { getTransactionStatusUntilComplete } from "./shared/get-transaction-status";
import { initiateWithdraw } from "./withdraw/initiate-sep6-withdraw";
import { sampleBankWithdrawDetails } from "./shared/sample-bank-withdraw-info";
import { transferAssetToAnchor } from "./withdraw/initiate-asset-transfer";

const horizonURL = process.env.HORIZON_NETWORK as string;
const networkPassphrase = process.env.STELLAR_NETWORK_PASSPHRASE as string;

const anchorDomain = "https://sandbox.connect.clickpesa.com";
const anchorAsset = "TZS";

const main = async () => {
  // GET ANCHOR DETAILS - SEP1
  const TOML = await getToml(anchorDomain);
  const anchorAuthEndpoint = TOML.WEB_AUTH_ENDPOINT as string;
  const anchorKYCEndpoint = TOML.KYC_SERVER as string;
  const anchorIssuerAccount = TOML.CURRENCIES?.find(
    (currency) => currency.code === anchorAsset
  )?.issuer as string;
  const anchorTransferServer = TOML.TRANSFER_SERVER as string;

  // ACCOUNT SETUP
  const accountKeyPair = getRandomKeyPair();
  const { hash: activateAccountHash } = await activateAccount(accountKeyPair);
  const { hash: addTrustlineHash } = await createTrustline({
    horizonURL,
    keyPair: accountKeyPair,
    issuerKey: anchorIssuerAccount,
    asset: anchorAsset,
    networkPassphrase,
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

  const successfulKYCDUser = await submitCollectedKYCFields({
    publicKey: accountKeyPair.publicKey(),
    kycServer: anchorKYCEndpoint,
    token: JWTToken,
    collectedFields: sampleUser,
  });

  console.log("successfulKYCDUser :>> ", successfulKYCDUser);

  // DEPOSIT - SEP6
  const { deposit } = await retrieveSEP6Info({
    transferServerUrl: anchorTransferServer,
    token: JWTToken,
  });

  console.log("deppositInformation :>> ", deposit);

  const depositInstructions = await initiateDeposit({
    amount: deposit[anchorAsset].min_amount,
    assetCode: anchorAsset,
    publicKey: accountKeyPair.publicKey(),
    transferServerUrl: anchorTransferServer,
    token: JWTToken,
  });

  console.log("depositInstructions :>> ", depositInstructions);

  const { currentStatus } = await getTransactionStatusUntilComplete({  // COMMENT THIS WHEN TESTING MYKOBO WITHDRAW
    transactionId: depositInstructions.id,
    token: JWTToken,
    transferServerUrl: anchorTransferServer,
    trustAssetCallback: () => Promise.resolve(""),
  });

  console.log("currentStatus :>> ", currentStatus);

  // ACCOUNT BALANCE
  const res = await getAccountBalance(horizonURL, accountKeyPair);
  console.log("result :>> ", res);

  // WITHDRAW - SEP6
  const { withdraw } = await retrieveSEP6Info({
    transferServerUrl: anchorTransferServer,
    token: JWTToken,
  });

  console.log("withdrawInfo :>> ", JSON.stringify(withdraw));

  const withdrawInstructions = await initiateWithdraw({
    amount: withdraw[anchorAsset].min_amount,
    assetCode: anchorAsset,
    publicKey: accountKeyPair.publicKey(),
    transferServerUrl: anchorTransferServer,
    token: JWTToken,
    withdrawDetails: sampleBankWithdrawDetails,
  });

  console.log("withdrawInstructions :>> ", withdrawInstructions);

  const {
    memo_type,
    memo,
    account_id,
    id: withdrawaTransactionId,
  } = withdrawInstructions;
  const { hash: withdrawHash } = await transferAssetToAnchor({
    horizonURL,
    keyPair: accountKeyPair,
    issuerKey: anchorIssuerAccount,
    asset: anchorAsset,
    networkPassphrase,
    anchorAccountId: account_id,
    amount: withdraw[anchorAsset].min_amount.toString(),
    memo_type,
    memo,
  });

  console.log("withdrawHash :>> ", withdrawHash);
  console.log('withdrawaTransactionId :>> ', withdrawaTransactionId);

};

main();
