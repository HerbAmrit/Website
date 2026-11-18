import crypto from "crypto";

// 6-digit numeric code, zero-padded (e.g. "004821") so it's always exactly 6 digits.
export function generateOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

export function otpExpiry(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
