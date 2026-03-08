// ============================================================================
// SSO / Entra ID (Azure AD) Integration - Placeholder
// ============================================================================
//
// This file documents the integration points for Microsoft Entra ID
// (formerly Azure AD) single sign-on. When ready to implement:
//
// 1. CONFIGURATION (environment variables):
//    - AZURE_TENANT_ID:   Your Entra ID tenant (directory) ID
//    - AZURE_CLIENT_ID:   Application (client) ID from app registration
//    - AZURE_CLIENT_SECRET: Client secret for confidential client flow
//    - AZURE_REDIRECT_URI: Callback URL (e.g. http://localhost:3001/api/auth/callback)
//
// 2. TOKEN EXCHANGE FLOW:
//    a. Frontend redirects user to /api/auth/sso/login
//    b. Server redirects to Entra ID authorization endpoint:
//       https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/authorize
//       with params: client_id, redirect_uri, response_type=code, scope=openid+profile+email
//    c. User authenticates with Microsoft
//    d. Entra ID redirects back to AZURE_REDIRECT_URI with authorization code
//    e. Server exchanges code for tokens at:
//       https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token
//    f. Server validates id_token, extracts user claims (email, name, oid)
//    g. Server issues local JWT for subsequent API calls
//
// 3. USER PROVISIONING (first SSO login):
//    - Check if user exists in local DB by email
//    - If not, create new user record with:
//      - id: generated UUID
//      - email: from Entra ID claims
//      - firstName/lastName: from Entra ID profile
//      - role: 'user' (default, admin promotes manually)
//      - password: empty/placeholder (not used with SSO)
//    - If exists, update last login timestamp
//
// 4. RECOMMENDED PACKAGES:
//    - @azure/msal-node for MSAL integration
//    - Or use passport-azure-ad with Fastify adapter
//
// ============================================================================

import type { AuthStrategy, AuthResult } from './strategies.js';

export type AuthMode = 'local' | 'sso' | 'hybrid';

export class SSOStrategy implements AuthStrategy {
  // TODO: Initialize MSAL ConfidentialClientApplication
  //
  // constructor() {
  //   const msalConfig = {
  //     auth: {
  //       clientId: process.env.AZURE_CLIENT_ID!,
  //       authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
  //       clientSecret: process.env.AZURE_CLIENT_SECRET!,
  //     },
  //   };
  //   this.msalClient = new msal.ConfidentialClientApplication(msalConfig);
  // }

  async authenticate(_email: string, _password: string): Promise<AuthResult> {
    // SSO does not use email/password authentication.
    // Instead, the flow is:
    //   1. getAuthUrl() -> redirect user to Entra ID
    //   2. handleCallback(code) -> exchange code for tokens
    //   3. Validate and provision user
    return {
      success: false,
      error: 'SSO authentication requires redirect flow, not direct credentials',
    };
  }

  // TODO: Implement these methods when SSO is enabled
  //
  // async getAuthUrl(): Promise<string> {
  //   // Generate authorization URL with MSAL
  //   // Include scopes: ['openid', 'profile', 'email']
  // }
  //
  // async handleCallback(code: string): Promise<AuthResult> {
  //   // Exchange authorization code for tokens
  //   // Validate id_token claims
  //   // Provision or update local user
  //   // Return AuthResult with user data
  // }
}
