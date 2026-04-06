export type EmailTemplate =
  | 'welcome'
  | 'email_verification'
  | 'account_approved'
  | 'account_disabled'
  | 'password_reset'
  | 'prompt_approved'
  | 'prompt_denied'
  | 'usecase_approved'
  | 'usecase_denied'
  | 'usecase_status_change'
  | 'comment_reply'
  | 'comment_mention'
  | 'assessment_complete';

export interface EmailTemplateDefinition {
  subject: string;
  body: (data: Record<string, unknown>) => string;
}

export const templates: Record<EmailTemplate, EmailTemplateDefinition> = {
  welcome: {
    subject: 'Welcome to Pipeline!',
    body: (data) =>
      `Hi ${data.firstName},\n\nYour account has been created. You can now log in and start exploring AI use cases, prompts, and automation assessments.\n\nWelcome aboard!`,
  },

  email_verification: {
    subject: 'Verify your email address',
    body: (data) =>
      `Hi ${data.firstName},\n\nPlease verify your email address by clicking the link below:\n\n${data.verificationUrl}\n\nIf you did not create an account, you can ignore this email.`,
  },

  account_approved: {
    subject: 'Your Pipeline account has been approved',
    body: (data) =>
      `Hi ${data.firstName},\n\nYour account has been approved. You now have full access to Pipeline.\n\nLog in to get started.`,
  },

  account_disabled: {
    subject: 'Your Pipeline account has been disabled',
    body: (data) =>
      `Hi ${data.firstName},\n\nYour Pipeline account has been disabled. If you believe this is an error, please contact your administrator.`,
  },

  password_reset: {
    subject: 'Reset your Pipeline password',
    body: (data) =>
      `Hi ${data.firstName},\n\nA password reset was requested for your account. Use the link below to set a new password:\n\n${data.resetUrl}\n\nIf you did not request this, you can ignore this email.`,
  },

  prompt_approved: {
    subject: 'Your prompt has been approved',
    body: (data) =>
      `Hi ${data.firstName},\n\nYour prompt "${data.itemTitle}" has been approved and is now visible in the Prompt Library.${data.reviewNotes ? `\n\nReviewer notes: ${data.reviewNotes}` : ''}`,
  },

  prompt_denied: {
    subject: 'Your prompt was not approved',
    body: (data) =>
      `Hi ${data.firstName},\n\nYour prompt "${data.itemTitle}" was not approved.${data.reviewNotes ? `\n\nReviewer notes: ${data.reviewNotes}` : ''}\n\nYou can update and resubmit your prompt at any time.`,
  },

  usecase_approved: {
    subject: 'Your use case has been approved',
    body: (data) =>
      `Hi ${data.firstName},\n\nYour use case "${data.itemTitle}" has been approved and is now visible in the Use Case Library.${data.reviewNotes ? `\n\nReviewer notes: ${data.reviewNotes}` : ''}`,
  },

  usecase_denied: {
    subject: 'Your use case was not approved',
    body: (data) =>
      `Hi ${data.firstName},\n\nYour use case "${data.itemTitle}" was not approved.${data.reviewNotes ? `\n\nReviewer notes: ${data.reviewNotes}` : ''}\n\nYou can update and resubmit your use case at any time.`,
  },

  usecase_status_change: {
    subject: 'Use case status updated',
    body: (data) =>
      `Hi ${data.firstName},\n\nThe status of your use case "${data.itemTitle}" has been changed to "${data.newStatus}".`,
  },

  comment_reply: {
    subject: 'Someone replied to your comment',
    body: (data) =>
      `Hi ${data.firstName},\n\n${data.replierName} replied to your comment on "${data.itemTitle}":\n\n"${data.commentPreview}"`,
  },

  comment_mention: {
    subject: 'You were mentioned in a comment',
    body: (data) =>
      `Hi ${data.firstName},\n\n${data.mentionerName} mentioned you in a comment on "${data.itemTitle}":\n\n"${data.commentPreview}"`,
  },

  assessment_complete: {
    subject: 'Your assessment is complete',
    body: (data) =>
      `Hi ${data.firstName},\n\nAll 5 checkpoints have been scored for your assessment "${data.itemTitle}". You can now review the results and optionally promote it to a use case.`,
  },
};
