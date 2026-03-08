import { useState, useEffect, useMemo, type FormEvent } from 'react';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';
import { Card, Button, Modal, Input, Select, Badge, SearchBar } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import * as userService from '../../services/userService';
import type { User, UserRole } from '../../types';
import { AUTH_CONFIG } from '../../types';
import { format, parseISO } from 'date-fns';

type ModalMode = 'create' | 'edit' | null;

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

const emptyForm: UserFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'user',
};

function UserManagementPage() {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyForm);
  const [formError, setFormError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadUsers() {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    }
  }

  useEffect(() => {
    async function load() {
      await loadUsers();
      setLoading(false);
    }
    load();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !searchQuery ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  function openCreateModal() {
    setFormData(emptyForm);
    setFormError('');
    setEditingUserId(null);
    setModalMode('create');
  }

  function openEditModal(user: User) {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
    });
    setFormError('');
    setEditingUserId(user.id);
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setEditingUserId(null);
    setFormData(emptyForm);
    setFormError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setFormError('First name and last name are required');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return;
    }

    try {
      if (modalMode === 'create') {
        if (!formData.password) {
          setFormError('Password is required for new users');
          return;
        }
        if (formData.password.length < 8) {
          setFormError('Password must be at least 8 characters');
          return;
        }
        await userService.createUser({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
        });
      } else if (modalMode === 'edit' && editingUserId) {
        const updates: Partial<User> = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          role: formData.role,
        };
        if (formData.password) {
          if (formData.password.length < 8) {
            setFormError('Password must be at least 8 characters');
            return;
          }
          updates.password = formData.password;
        }
        await userService.updateUser(editingUserId, updates);
      }
      closeModal();
      await loadUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  async function handleDelete(userId: string) {
    if (userId === currentUser?.id) {
      setFormError('You cannot delete your own account');
      setDeleteConfirmId(null);
      return;
    }
    await userService.deleteUser(userId);
    setDeleteConfirmId(null);
    await loadUsers();
  }

  async function handleToggleRole(user: User) {
    if (user.id === currentUser?.id) return;
    const newRole: UserRole = user.role === 'admin' ? 'user' : 'admin';
    await userService.updateUser(user.id, { role: newRole });
    await loadUsers();
  }

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
  ];

  const filterRoleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-20">
      <p style={{ color: 'var(--nx-red-base)' }}>{error}</p>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users size={28} style={{ color: 'var(--nx-cyan-base)' }} />
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                color: 'var(--nx-text-primary)',
                letterSpacing: '0.05em',
              }}
            >
              User Management
            </h1>
          </div>
          <p style={{ color: 'var(--nx-text-secondary)' }} className="mt-1">
            Manage users, roles, and access.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={16} />
          Create User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar
            placeholder="Search by name or email..."
            value={searchQuery}
            onSearch={setSearchQuery}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={filterRoleOptions}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Users table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid rgba(0, 212, 255, 0.15)',
                }}
              >
                {['Name', 'Email', 'Role', 'Created', 'Actions'].map(
                  (header) => (
                    <th
                      key={header}
                      className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider"
                      style={{
                        color: 'var(--nx-text-ghost)',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-sm"
                    style={{ color: 'var(--nx-text-tertiary)' }}
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors"
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        'rgba(0, 212, 255, 0.03)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{
                            backgroundColor: 'rgba(0, 212, 255, 0.1)',
                            color: 'var(--nx-cyan-base)',
                            border: '1px solid rgba(0, 212, 255, 0.2)',
                          }}
                        >
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: 'var(--nx-text-secondary)' }}
                        >
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-sm"
                        style={{ color: 'var(--nx-text-tertiary)' }}
                      >
                        {user.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={user.role === 'admin' ? 'primary' : 'neutral'}
                        size="sm"
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-sm"
                        style={{ color: 'var(--nx-text-tertiary)' }}
                      >
                        {format(parseISO(user.createdAt), 'MMM d, yyyy')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleRole(user)}
                          disabled={user.id === currentUser?.id}
                          className="p-1.5 rounded-md transition-colors disabled:opacity-30"
                          style={{ color: 'var(--nx-text-tertiary)' }}
                          onMouseEnter={(e) => {
                            if (user.id !== currentUser?.id) {
                              e.currentTarget.style.color =
                                'var(--nx-cyan-base)';
                              e.currentTarget.style.backgroundColor =
                                'rgba(0, 212, 255, 0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color =
                              'var(--nx-text-tertiary)';
                            e.currentTarget.style.backgroundColor =
                              'transparent';
                          }}
                          title={
                            user.id === currentUser?.id
                              ? 'Cannot change own role'
                              : user.role === 'admin'
                                ? 'Demote to user'
                                : 'Promote to admin'
                          }
                        >
                          {user.role === 'admin' ? (
                            <ShieldOff size={16} />
                          ) : (
                            <ShieldCheck size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 rounded-md transition-colors"
                          style={{ color: 'var(--nx-text-tertiary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color =
                              'var(--nx-cyan-base)';
                            e.currentTarget.style.backgroundColor =
                              'rgba(0, 212, 255, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color =
                              'var(--nx-text-tertiary)';
                            e.currentTarget.style.backgroundColor =
                              'transparent';
                          }}
                          title="Edit user"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(user.id)}
                          disabled={user.id === currentUser?.id}
                          className="p-1.5 rounded-md transition-colors disabled:opacity-30"
                          style={{ color: 'var(--nx-text-tertiary)' }}
                          onMouseEnter={(e) => {
                            if (user.id !== currentUser?.id) {
                              e.currentTarget.style.color =
                                'var(--nx-red-base, #ff3366)';
                              e.currentTarget.style.backgroundColor =
                                'rgba(255, 51, 102, 0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color =
                              'var(--nx-text-tertiary)';
                            e.currentTarget.style.backgroundColor =
                              'transparent';
                          }}
                          title={
                            user.id === currentUser?.id
                              ? 'Cannot delete own account'
                              : 'Delete user'
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary */}
      <p
        className="text-xs mt-3"
        style={{ color: 'var(--nx-text-ghost)' }}
      >
        Showing {filteredUsers.length} of {users.length} users
      </p>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalMode !== null}
        onClose={closeModal}
        title={modalMode === 'create' ? 'Create User' : 'Edit User'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="John"
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Doe"
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder={`user@${AUTH_CONFIG.allowedDomain}`}
              helperText={`Must be an @${AUTH_CONFIG.allowedDomain} address`}
              required
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder={
                modalMode === 'edit'
                  ? 'Leave blank to keep current'
                  : 'Enter password'
              }
              helperText="Minimum 8 characters"
              required={modalMode === 'create'}
            />
            <Select
              label="Role"
              options={roleOptions}
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as UserRole,
                })
              }
            />

            {formError && (
              <p
                role="alert"
                className="text-sm text-center py-2 rounded-md"
                style={{
                  color: 'var(--nx-red-base, #ff3366)',
                  backgroundColor: 'rgba(255, 51, 102, 0.1)',
                  border: '1px solid rgba(255, 51, 102, 0.2)',
                }}
              >
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" type="button" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">
                {modalMode === 'create' ? 'Create User' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete User"
        size="sm"
      >
        <p
          className="text-sm mb-6"
          style={{ color: 'var(--nx-text-secondary)' }}
        >
          Are you sure you want to delete this user? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setDeleteConfirmId(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
          >
            Delete User
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default UserManagementPage;
