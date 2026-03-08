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
//    - AZURE_REDIRECT_URI: Callback URL (e.g. http://localhost:3001/api/auth/sso/callback)
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
    //   1. getAuthorizationUrl() -> redirect user to Entra ID
    //   2. handleCallback(code) -> exchange code for tokens
    //   3. provisionUser(claims) -> create/update local user
    return {
      success: false,
      error: 'SSO authentication requires redirect flow, not direct credentials',
    };
  }

  /**
   * Generate the Entra ID authorization URL for the OIDC redirect flow.
   * When implemented, this will use MSAL to build the URL with:
   * - client_id, redirect_uri, response_type=code
   * - scopes: openid, profile, email
   * - state parameter for CSRF protection
   */
  getAuthorizationUrl(): string {
    // TODO: Implement with @azure/msal-node
    // const authUrlParams = {
    //   scopes: ['openid', 'profile', 'email'],
    //   redirectUri: process.env.AZURE_REDIRECT_URI,
    //   state: crypto.randomUUID(),
    // };
    // return await this.msalClient.getAuthCodeUrl(authUrlParams);
    throw new Error('SSO not yet implemented');
  }

  /**
   * Exchange the authorization code from Entra ID callback for tokens.
   * When implemented, this will:
   * 1. Call MSAL acquireTokenByCode with the auth code
   * 2. Validate the id_token
   * 3. Extract user claims (email, name, oid)
   * 4. Call provisionUser() to create/update local user
   * 5. Return AuthResult with user data
   */
  async handleCallback(_code: string): Promise<AuthResult> {
    // TODO: Implement with @azure/msal-node
    // const tokenRequest = {
    //   code,
    //   scopes: ['openid', 'profile', 'email'],
    //   redirectUri: process.env.AZURE_REDIRECT_URI,
    // };
    // const response = await this.msalClient.acquireTokenByCode(tokenRequest);
    // const claims = response.idTokenClaims;
    // const user = await this.provisionUser(claims);
    // return { success: true, user };
    return {
      success: false,
      error: 'SSO callback not yet implemented',
    };
  }

  /**
   * Create or update a local user from Entra ID claims.
   * On first SSO login, creates a new user with role 'user'.
   * On subsequent logins, updates the last login timestamp.
   */
  async provisionUser(_claims: { email: string; given_name: string; family_name: string; oid: string }): Promise<void> {
    // TODO: Implement user provisioning
    // const existing = db.select().from(users).where(eq(users.email, claims.email)).get();
    // if (!existing) {
    //   db.insert(users).values({
    //     id: crypto.randomUUID(),
    //     email: claims.email,
    //     firstName: claims.given_name,
    //     lastName: claims.family_name,
    //     role: 'user',
    //     password: '', // not used with SSO
    //     createdAt: new Date().toISOString(),
    //     updatedAt: new Date().toISOString(),
    //   }).run();
    // }
    throw new Error('User provisioning not yet implemented');
  }
}
