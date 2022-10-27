enum TransactionStatus {
  COMPLETED = "completed",
  ERROR = "error",
  INCOMPLETE = "incomplete",
  PENDING_ANCHOR = "pending_anchor",
  PENDING_CUSTOMER_INFO_UPDATE = "pending_customer_info_update",
  PENDING_EXTERNAL = "pending_external",
  PENDING_RECEIVER = "pending_receiver",
  PENDING_SENDER = "pending_sender",
  PENDING_STELLAR = "pending_stellar",
  PENDING_TRANSACTION_INFO_UPDATE = "pending_transaction_info_update",
  PENDING_TRUST = "pending_trust",
  PENDING_USER = "pending_user",
  PENDING_USER_TRANSFER_START = "pending_user_transfer_start",
}

export const getTransactionStatusUntilComplete = async ({
  transactionId,
  token,
  transferServerUrl,
  trustAssetCallback,
}: {
  transactionId: string;
  token: string;
  transferServerUrl: string;
  trustAssetCallback: () => Promise<string>;
}) => {
  let currentStatus = TransactionStatus.INCOMPLETE;
  let trustedAssetAdded;

  const transactionUrl = new URL(
    `${transferServerUrl}/transaction?id=${transactionId}`
  );

  console.log({
    title: `Polling for updates \`${transactionUrl.toString()}\``,
  });

  const endStatuses = [
    TransactionStatus.PENDING_EXTERNAL,
    TransactionStatus.COMPLETED,
    TransactionStatus.ERROR,
  ];

  while (!endStatuses.includes(currentStatus)) {
    const response = await fetch(transactionUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const transactionJson = await response.json();

    if (transactionJson.transaction.status !== currentStatus) {
      currentStatus = transactionJson.transaction.status;
      // eslint-disable-next-line no-param-reassign
      // popup.location.href = transactionJson.transaction.more_info_url;
      console.log({
        title: `Transaction \`${transactionId}\` is in \`${transactionJson.transaction.status}\` status`,
      });

      switch (currentStatus) {
        case TransactionStatus.PENDING_USER_TRANSFER_START: {
          console.log({
            title:
              "The anchor is waiting on you to take the action described in the popup",
          });
          break;
        }
        case TransactionStatus.PENDING_ANCHOR: {
          console.log({
            title: "The anchor is processing the transaction",
          });
          break;
        }
        case TransactionStatus.PENDING_STELLAR: {
          console.log({
            title: "The Stellar network is processing the transaction",
          });
          break;
        }
        case TransactionStatus.PENDING_EXTERNAL: {
          console.log({
            title: "The transaction is being processed by an external system",
          });
          break;
        }
        case TransactionStatus.PENDING_TRUST: {
          console.log({
            title:
              "You must add a trustline to the asset in order to receive your deposit",
          });

          try {
            // eslint-disable-next-line no-await-in-loop
            trustedAssetAdded = await trustAssetCallback();
          } catch (error) {
            console.log("error :>> ", error);
          }
          break;
        }
        case TransactionStatus.PENDING_USER: {
          console.log({
            title:
              "The anchor is waiting for you to take the action described in the popup",
          });
          break;
        }
        case TransactionStatus.ERROR: {
          console.log({
            title: "There was a problem processing your transaction",
          });
          break;
        }
        default:
        // do nothing
      }
    }

    // run loop every 2 seconds
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log({ title: `Transaction status \`${currentStatus}\`` });
  return { currentStatus, trustedAssetAdded };
};
