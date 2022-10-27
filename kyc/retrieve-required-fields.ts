const retrieveKYCFieldsToBeCollected = async ({
  publicKey,
  kycServer,
  token,
}: {
  publicKey: string;
  kycServer: string;
  token: string;
}) => {
  const params = {
    account: publicKey,
  };
  const urlParams = new URLSearchParams(params);
  try {
    const result = await fetch(
      `${kycServer}/customer?${urlParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const resultJson = await result.json();
    const fieldsToCollect = Object.entries(resultJson.fields ?? {}).reduce(
      (collectResult: any, field: any) => {
        const [key, props] = field;
        // check status per field to collect only the fields that had issues
        if (
          !props.status ||
          props.status === "NOT_PROVIDED" ||
          (props.status === "REJECTED" && resultJson.status === "NEEDS_INFO")
        ) {
          return { ...collectResult, [key]: props };
        }
        return collectResult;
      },
      {}
    );
    return fieldsToCollect;
  } catch (error) {
    console.log("Error :>> ", error);
  }
};

export default retrieveKYCFieldsToBeCollected;
