import crypto from "crypto";

export const generateDeviceId = (userAgent: string, ipAddress: string) => {
  const hash = crypto.createHash("sha256");
  hash.update(userAgent + ipAddress);
  return hash.digest("hex");
};