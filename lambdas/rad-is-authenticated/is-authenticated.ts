import { ServiceClient } from "perron";

export const isAuthenticated = async (token: string) => {
  const securityClient = new ServiceClient(process.env.SECURITY_URL ?? "");
  const pathname = "/api/users/is-authenticated";

  try {
    const response = await securityClient.request({
      pathname,
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    return Boolean((<any>response.body).isAuthenticated);
  } catch {
    return false;
  }
};
