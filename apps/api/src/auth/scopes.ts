/** OAuth scopes mirrored from openapi.yaml#/components/securitySchemes/oauth2/flows. */
export type Scope =
  | "read:today"
  | "read:search"
  | "write:quest"
  | "write:event"
  | "admin:bench";

export const DEFAULT_USER_SCOPES: Scope[] = [
  "read:today",
  "read:search",
  "write:quest",
  "write:event",
];
