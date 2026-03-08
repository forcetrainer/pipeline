export type Permission =
  | 'use-cases:read'
  | 'use-cases:create'
  | 'use-cases:update'
  | 'use-cases:delete'
  | 'use-cases:review'
  | 'prompts:read'
  | 'prompts:create'
  | 'prompts:update'
  | 'prompts:delete'
  | 'prompts:review'
  | 'prompts:star'
  | 'prompts:comment'
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'admin:dashboard';

export const rolePermissions: Record<string, Permission[]> = {
  user: [
    'use-cases:read',
    'use-cases:create',
    'use-cases:update', // own items only — enforced at route level
    'prompts:read',
    'prompts:create',
    'prompts:update', // own items only
    'prompts:star',
    'prompts:comment',
  ],
  admin: [
    'use-cases:read', 'use-cases:create', 'use-cases:update', 'use-cases:delete', 'use-cases:review',
    'prompts:read', 'prompts:create', 'prompts:update', 'prompts:delete', 'prompts:review', 'prompts:star', 'prompts:comment',
    'users:read', 'users:create', 'users:update', 'users:delete',
    'admin:dashboard',
  ],
};

export function hasPermission(role: string, permission: Permission): boolean {
  return (rolePermissions[role] || []).includes(permission);
}
