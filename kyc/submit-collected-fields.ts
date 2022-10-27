const submitCollectedKYCFields = async ({
  publicKey,
  kycServer,
  token,
  collectedFields,
}: {
  publicKey: string;
  kycServer: string;
  token: string;
  collectedFields: any;
}) => {
  try {
    const data: { [key: string]: string } = {
      account: publicKey,
      ...collectedFields,
    };
    const body = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      body.append(key, value.toString());
    });
    const result = await fetch(`${kycServer}/customer`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "PUT",
      body,
    });
    return await result.json();
  } catch (error) {
    console.log("Error :>> ", error);
  }
};

export default submitCollectedKYCFields;
