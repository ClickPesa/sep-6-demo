export const retrieveSEP6Info = async ({
  token,
  transferServerUrl,
}: {
  transferServerUrl: string;
  token: string;
}) => {
  const REQUEST_URL_STR: string = `${transferServerUrl}/info`;
  const REQUEST_URL = new URL(REQUEST_URL_STR);

  const response = await fetch(`${REQUEST_URL}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
};
