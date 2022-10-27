import { StellarTomlResolver } from "stellar-sdk";

const getToml = async (homeDomain: string) => {
  const tomlURL = new URL(homeDomain);
  tomlURL.pathname = "/.well-known/stellar.toml";

  const tomlResponse =
    tomlURL.protocol === "http:"
      ? await StellarTomlResolver.resolve(tomlURL.host, {
          allowHttp: true,
        })
      : await StellarTomlResolver.resolve(tomlURL.host);

  return tomlResponse;
};

export default getToml;
