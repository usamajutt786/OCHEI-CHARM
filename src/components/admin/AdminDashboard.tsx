import React, { useState, useMemo } from 'react';
import { User, AccountStatus } from '../../types';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  Search, 
  UserPlus, 
  MoreVertical, 
  Calendar, 
  Ban, 
  Trash2, 
  Eye, 
  Edit3, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { UserModal } from './UserModal';
import { UserDetailDrawer } from './UserDetailDrawer';
import { ExtendSubscriptionModal } from './ExtendSubscriptionModal';
import { ConfirmModal } from '../common/ConfirmModal';

interface AdminDashboardProps {
  users: User[];
  onCreateUser: (userData: any) => void;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onExtendSubscription: (id: string, days: number) => void;
  onToggleBlock: (id: string) => void;
  onResetDemoData: () => void;
  onSwitchToEditorAsUser: (user: User) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onExtendSubscription,
  onToggleBlock,
  onResetDemoData,
  onSwitchToEditorAsUser,
}) => {
  // State filters & pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [extendUser, setExtendUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToToggleBlock, setUserToToggleBlock] = useState<User | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Active action menu row id
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Summary counts
  const summary = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const expired = users.filter(u => u.status === 'expired').length;
    const blocked = users.filter(u => u.status === 'blocked').length;
    return { total, active, expired, blocked };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.planName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  return (
    <div className="flex-1 bg-[#090d16] text-slate-100 overflow-y-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header & Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2.5">
              <span>Studio Subscription Administration</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage photographer licenses, extend access durations, and inspect authentication history.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-amber-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
              title="Reset all demo users to initial state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-all shadow-lg shadow-violet-900/20 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create User</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-[#0f1523] border border-slate-800/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Studio Accounts</span>
              <div className="p-2 rounded-xl bg-slate-800/60 text-slate-300">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono-data text-white">{summary.total}</span>
              <span className="text-xs text-slate-500">enrolled</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f1523] border border-slate-800/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Active Subscriptions</span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono-data text-emerald-400">{summary.active}</span>
              <span className="text-xs text-slate-500">
                ({Math.round((summary.active / (summary.total || 1)) * 100)}%)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f1523] border border-slate-800/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Expired Subscriptions</span>
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono-data text-amber-400">{summary.expired}</span>
              <span className="text-xs text-slate-500">need renewal</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f1523] border border-slate-800/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Blocked / Suspended</span>
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono-data text-rose-400">{summary.blocked}</span>
              <span className="text-xs text-slate-500">restricted</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0e1422] p-3 rounded-2xl border border-slate-800/80">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email, or plan..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {(['all', 'active', 'expired', 'blocked'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* User Table */}
        <div className="bg-[#0e1422] border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400 font-medium">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Plan / Expiry Date</th>
                  <th className="py-3 px-4 text-center">Remaining Days</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 text-slate-600" />
                        <p className="text-sm font-medium text-slate-400">No users match your criteria</p>
                        <p className="text-xs text-slate-500">Try adjusting your search query or status filter.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr 
                      key={user.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-xs font-semibold text-white uppercase shrink-0 border border-slate-700">
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">{user.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium capitalize ${
                          user.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : user.status === 'expired'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'active' ? 'bg-emerald-400' : user.status === 'expired' ? 'bg-amber-400' : 'bg-rose-400'
                          }`} />
                          <span>{user.status}</span>
                        </span>
                      </td>

                      {/* Plan & Expiry */}
                      <td className="py-3.5 px-4">
                        <p className="text-slate-200 font-medium truncate">{user.planName}</p>
                        <p className="text-[11px] text-slate-400 font-mono-data">
                          Expires: {new Date(user.subscriptionExpiry).toLocaleDateString()}
                        </p>
                      </td>

                      {/* Remaining Days */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-mono-data font-semibold text-sm ${
                          user.remainingDays === 0
                            ? 'text-amber-400'
                            : user.remainingDays <= 14
                            ? 'text-amber-300'
                            : 'text-slate-200'
                        }`}>
                          {user.remainingDays}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">days</span>
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4">
                        <p className="text-slate-300 text-[11px]">{user.lastLogin}</p>
                        <p className="text-[10px] text-slate-500">{user.role.replace('_', ' ')}</p>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSwitchToEditorAsUser(user)}
                            className="p-1.5 text-slate-400 hover:text-violet-300 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Open Editor as this user"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDetailUser(user)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Inspect User Details & Login History"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setExtendUser(user)}
                            className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Extend Subscription Days"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setEditUser(user)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setUserToToggleBlock(user)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.status === 'blocked'
                                ? 'text-emerald-400 hover:bg-emerald-950/40'
                                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
                            }`}
                            title={user.status === 'blocked' ? 'Unblock User' : 'Block User'}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setUserToDelete(user)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredUsers.length > 0 && (
            <div className="py-3 px-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing <strong className="text-white">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                <strong className="text-white">
                  {Math.min(currentPage * pageSize, filteredUsers.length)}
                </strong>{' '}
                of <strong className="text-white">{filteredUsers.length}</strong> studio users
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals and Dialogs */}
      {isCreateOpen && (
        <UserModal
          isOpen={isCreateOpen}
          mode="create"
          onClose={() => setIsCreateOpen(false)}
          onSubmit={onCreateUser}
        />
      )}

      {editUser && (
        <UserModal
          isOpen={!!editUser}
          mode="edit"
          user={editUser}
          onClose={() => setEditUser(null)}
          onSubmit={(data) => {
            onUpdateUser(editUser.id, data);
            setEditUser(null);
          }}
        />
      )}

      {detailUser && (
        <UserDetailDrawer
          isOpen={!!detailUser}
          user={detailUser}
          onClose={() => setDetailUser(null)}
          onExtendClick={(u) => {
            setDetailUser(null);
            setExtendUser(u);
          }}
          onToggleBlock={(u) => {
            onToggleBlock(u.id);
            setDetailUser(null);
          }}
        />
      )}

      {extendUser && (
        <ExtendSubscriptionModal
          isOpen={!!extendUser}
          user={extendUser}
          onClose={() => setExtendUser(null)}
          onExtend={(userId, days) => onExtendSubscription(userId, days)}
        />
      )}

      {/* Delete User Confirmation */}
      <ConfirmModal
        isOpen={!!userToDelete}
        title="Delete Studio User Account"
        message={`Are you sure you want to permanently delete the account for ${userToDelete?.name} (${userToDelete?.email})? All allocated subscription passes will be revoked.`}
        confirmLabel="Delete Account"
        isDestructive={true}
        onConfirm={() => {
          if (userToDelete) {
            onDeleteUser(userToDelete.id);
            setUserToDelete(null);
          }
        }}
        onCancel={() => setUserToDelete(null)}
      />

      {/* Block/Unblock Confirmation */}
      <ConfirmModal
        isOpen={!!userToToggleBlock}
        title={userToToggleBlock?.status === 'blocked' ? 'Unblock Studio Account' : 'Suspend / Block Studio Account'}
        message={
          userToToggleBlock?.status === 'blocked'
            ? `Re-activate access for ${userToToggleBlock?.name}? They will immediately regain access to the photo editor.`
            : `Are you sure you want to block access for ${userToToggleBlock?.name}? They will see an Access Restricted notice when logging in.`
        }
        confirmLabel={userToToggleBlock?.status === 'blocked' ? 'Unblock User' : 'Block Access'}
        isDestructive={userToToggleBlock?.status !== 'blocked'}
        onConfirm={() => {
          if (userToToggleBlock) {
            onToggleBlock(userToToggleBlock.id);
            setUserToToggleBlock(null);
          }
        }}
        onCancel={() => setUserToToggleBlock(null)}
      />

      {/* Reset Demo Data Confirmation */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset All Demo Data"
        message="This will restore all default studio photographers, subscription periods, login histories, and sample irises to their initial factory settings."
        confirmLabel="Reset Everything"
        isDestructive={true}
        onConfirm={() => {
          onResetDemoData();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
