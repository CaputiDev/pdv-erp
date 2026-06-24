/**
 * Generates an RFC4122 v4 compliant UUID.
 * Ensures the generated UUID does not conflict with any ID in the provided array of existing IDs.
 */
export function generateUniqueUUID(existingIds: string[]): string {
  const generateUUID = (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  let uuid = generateUUID();
  while (existingIds.includes(uuid)) {
    uuid = generateUUID();
  }
  return uuid;
}
