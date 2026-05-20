import { ID_LENGTH } from "@/lib/config";

export function generateId(): string {
  return crypto.randomUUID().slice(0, ID_LENGTH);
}
