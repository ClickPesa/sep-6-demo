import { sampleBankWithdrawDetailsType } from "../shared/sample-bank-withdraw-info";

export const initiateWithdraw = async ({
  amount,
  assetCode,
  publicKey,
  token,
  transferServerUrl,
  withdrawDetails,
}: {
  amount: string;
  assetCode: string;
  publicKey: string;
  transferServerUrl: string;
  token: string;
  withdrawDetails: sampleBankWithdrawDetailsType;
}) => {
  const REQUEST_URL_STR: string = `${transferServerUrl}/withdraw`;
  const REQUEST_URL = new URL(REQUEST_URL_STR);

  const depositParams = {
    asset_code: assetCode,
    account: publicKey,
    amount,
    ...withdrawDetails,
  };

  Object.entries(depositParams).forEach(([key, value]) => {
    REQUEST_URL.searchParams.append(key, value);
  });

  const response = await fetch(`${REQUEST_URL}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const depositJson = await response.json();
  return depositJson;
};
