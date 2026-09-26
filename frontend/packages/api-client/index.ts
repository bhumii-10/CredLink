// Abstract API Client interfaces for future backend connection
export interface CredLinkApiClient {
  issueCredential(payload: Record<string, unknown>): Promise<{ success: boolean }>;
  verifyRequest(requestId: string): Promise<{ status: string }>;
}
