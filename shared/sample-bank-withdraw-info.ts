type sampleBankWithdrawDetailsType = {
  type: string;
  payout_channel_provider: string;
  payout_address_name: string;
  payout_address_account: string;
  routing_number: string;
  swift_number: string;
  dest: string;
};

const sampleBankWithdrawDetails = {
  type: "bank_account",
  payout_channel_provider: "Bank ABC",// For TZS,KES,RWF withdraw only
  payout_address_name: "Jumbe Mbukuzi",// For TZS,KES,RWF withdraw only
  payout_address_account: "NHB76166000",// For TZS,KES,RWF withdraw only
  routing_number: "98800",// For TZS,KES,RWF withdraw only
  swift_number: "0000", // For TZS,KES,RWF withdraw only
  dest: "NHB76166000" // For EURC withdraw only
};

export { sampleBankWithdrawDetails, sampleBankWithdrawDetailsType };
