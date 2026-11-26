
import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import mongoose from "mongoose";

const TOKEN_LIFETIME_SECONDS = 30;

interface QrTokenPayload {
  sessionId: string;
  expiresAt: number;
}

const getSecret = (): string => {
  const secret = process.env.QR_ATTENDANCE_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "QR_ATTENDANCE_SECRET must be configured with at least 32 characters"
    );
  }

  return secret;
};

const signPayload = (payload: string): string => {
  return createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
};

export const generateQrAttendanceToken = (
  attendanceSessionId: string
): { token: string; expiresAt: Date } => {
  if (!mongoose.isValidObjectId(attendanceSessionId)) {
    throw new Error("Invalid attendance session ID");
  }

  const expiresAt = Math.floor(Date.now() / 1000) +
    TOKEN_LIFETIME_SECONDS;

  const payload: QrTokenPayload = {
    sessionId: attendanceSessionId,
    expiresAt,
  };

  const encodedPayload = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64url");

  const signature = signPayload(encodedPayload);

  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: new Date(expiresAt * 1000),
  };
};

export const verifyQrAttendanceToken = (
  token: string
): QrTokenPayload => {
  if (typeof token !== "string" || token.length > 2048) {
    throw new Error("Invalid QR attendance token");
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    throw new Error("Invalid QR attendance token");
  }

  const [encodedPayload, receivedSignature] = parts;

  if (!encodedPayload || !receivedSignature) {
    throw new Error("Invalid QR attendance token");
  }

  const expectedSignature = signPayload(encodedPayload);

  const receivedBuffer = Buffer.from(
    receivedSignature,
    "base64url"
  );

  const expectedBuffer = Buffer.from(
    expectedSignature,
    "base64url"
  );

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid QR attendance token");
  }

  let payload: QrTokenPayload;

  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    );
  } catch {
    throw new Error("Invalid QR attendance token");
  }

  if (
    !payload ||
    typeof payload.sessionId !== "string" ||
    !mongoose.isValidObjectId(payload.sessionId) ||
    typeof payload.expiresAt !== "number" ||
    !Number.isSafeInteger(payload.expiresAt)
  ) {
    throw new Error("Invalid QR attendance token");
  }

  if (Date.now() >= payload.expiresAt * 1000) {
    throw new Error("QR attendance token has expired");
  }

  if (
    payload.expiresAt * 1000 >
    Date.now() + TOKEN_LIFETIME_SECONDS * 1000 + 2000
  ) {
    throw new Error("Invalid QR attendance token expiry");
  }

  return payload;
};
