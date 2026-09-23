import { Storage, GetSignedUrlConfig } from "@google-cloud/storage";

// Storage bucket name from environment
const bucketName = process.env.GCS_BUCKET_NAME || process.env.NEXT_PUBLIC_GCS_BUCKET_NAME || "linguaclass-media";
const projectId = process.env.GCP_PROJECT_ID;

// Singleton GCS Storage client
const storage = new Storage({
  ...(projectId ? { projectId } : {}),
});

const bucket = storage.bucket(bucketName);

/**
 * Generates a pre-signed V4 PUT URL allowing clients to directly upload files to GCS.
 *
 * @param storageKey Destination path inside the bucket (e.g. `lessons/lesson-123/attachment.pdf`)
 * @param contentType MIME type of the file (e.g. `application/pdf`, `image/png`)
 * @param expiresSeconds Time before the upload URL expires (default: 15 minutes)
 */
export async function generateV4UploadSignedUrl(
  storageKey: string,
  contentType: string,
  expiresSeconds = 900
): Promise<{ url: string; storageKey: string; bucket: string }> {
  const file = bucket.file(storageKey);

  const options: GetSignedUrlConfig = {
    version: "v4",
    action: "write",
    expires: Date.now() + expiresSeconds * 1000,
    contentType,
  };

  const [url] = await file.getSignedUrl(options);

  return {
    url,
    storageKey,
    bucket: bucketName,
  };
}

/**
 * Generates a pre-signed V4 GET URL for temporary, secure private file downloads/viewing.
 *
 * @param storageKey Path inside the bucket
 * @param expiresSeconds Time before read access expires (default: 1 hour)
 */
export async function generateV4ReadSignedUrl(
  storageKey: string,
  expiresSeconds = 3600
): Promise<string> {
  const file = bucket.file(storageKey);

  const options: GetSignedUrlConfig = {
    version: "v4",
    action: "read",
    expires: Date.now() + expiresSeconds * 1000,
  };

  const [url] = await file.getSignedUrl(options);
  return url;
}

/**
 * Deletes a file from Google Cloud Storage.
 */
export async function deleteStorageFile(storageKey: string): Promise<boolean> {
  try {
    const file = bucket.file(storageKey);
    await file.delete({ ignoreNotFound: true });
    return true;
  } catch (error) {
    console.error(`Failed to delete storage key: ${storageKey}`, error);
    return false;
  }
}

/**
 * Returns the public URL for publicly accessible objects.
 */
export function getPublicStorageUrl(storageKey: string): string {
  return `https://storage.googleapis.com/${bucketName}/${storageKey}`;
}

export { storage, bucket };
