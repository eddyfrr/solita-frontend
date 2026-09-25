/**
 * Upload carousel photos one after another and report failures instead of
 * swallowing them. Returns a sentence for the admin, or "" if all succeeded.
 */
export async function uploadExtraPhotos(
  files: File[],
  upload: (data: FormData) => Promise<unknown>,
  startOrder = 0,
): Promise<string> {
  const failures: string[] = [];
  for (const [idx, file] of files.entries()) {
    const fd = new FormData();
    fd.append("image", file);
    fd.append("sort_order", String(startOrder + idx + 1));
    try {
      await upload(fd);
    } catch (err) {
      failures.push(err instanceof Error ? err.message : "upload failed");
    }
  }
  if (failures.length === 0) return "";
  const reasons = [...new Set(failures)].join("; ");
  return `${failures.length} of ${files.length} extra photo${files.length === 1 ? "" : "s"} didn't upload (${reasons}).`;
}
