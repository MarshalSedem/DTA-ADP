/**
 * Turn a local photo URI into a multipart file part. React Native's fetch uploads
 * `{ uri, name, type }` objects directly from disk.
 */
export async function toUploadFile(uri: string) {
  const name = uri.split('/').pop()?.split('?')[0] || 'photo.jpg';
  return { uri, name, type: mimeFromName(name) } as unknown as Blob;
}

/** The API checks that the declared type matches the file, so infer it from the extension. */
function mimeFromName(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}
