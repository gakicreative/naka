export async function uploadFile(file: File, _path?: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }

  const { url } = await res.json();
  return url;
}
