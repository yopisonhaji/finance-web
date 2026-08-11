import crypto from 'crypto';

/**
 * Validates the HMAC SHA-256 signature from Meta Webhooks.
 *
 * @param payload - The raw JSON string of the request body.
 * @param signatureHeader - The value of the X-Hub-Signature-256 header (e.g., "sha256=...").
 * @param appSecret - The Meta App Secret from your developer dashboard.
 * @returns boolean - True if the signature matches, false otherwise.
 */
export function verifyMetaSignature(
  payload: string,
  signatureHeader: string | null,
  appSecret: string | undefined
): boolean {
  if (!signatureHeader || !appSecret) {
    return false;
  }

  // Extract the hash value from the header (format: sha256=HASH)
  const signatureParts = signatureHeader.split('=');
  if (signatureParts.length !== 2 || signatureParts[0] !== 'sha256') {
    return false;
  }
  const signature = signatureParts[1];

  try {
    // Generate our own HMAC SHA-256 hash based on the payload and our app secret
    const expectedSignature = crypto
      .createHmac('sha256', appSecret)
      .update(payload, 'utf8')
      .digest('hex');

    // Perform a timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error verifying Meta signature:', error);
    return false;
  }
}
