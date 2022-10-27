
export const initiateDeposit = async ({
   amount,
   assetCode,
   publicKey,
   token,
   transferServerUrl,
 }:{
   amount: string;
   assetCode: string;
   publicKey: string;
   transferServerUrl: string;
   token: string;
}) => {
   const REQUEST_URL_STR : string = `${transferServerUrl}/deposit`;
   const REQUEST_URL = new URL(REQUEST_URL_STR);

   const depositParams = {
     asset_code: assetCode,
     account: publicKey,
     amount,
   };

   Object.entries(depositParams).forEach(([key, value]) => {
      REQUEST_URL.searchParams.append(key, value);
    });

   const response = await fetch(`${REQUEST_URL}`, {
     method: 'GET',
     headers: {
       Authorization: `Bearer ${token}`,
     },
   });

   const depositJson = await response.json();
   return depositJson;
 };
