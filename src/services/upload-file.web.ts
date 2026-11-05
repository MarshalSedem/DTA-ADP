/** Web: the picker returns a blob:/data: URI, so read it into a File with its real type. */
export async function toUploadFile(uri: string) {
  const blob = await (await fetch(uri)).blob();
  const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
  return new File([blob], `photo.${ext}`, { type: blob.type || 'image/jpeg' });
}
