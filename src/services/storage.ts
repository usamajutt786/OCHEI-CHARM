import { User, IrisImage } from '../types';
import { INITIAL_USERS, INITIAL_SAMPLE_IMAGES } from './sampleData';

const USERS_STORAGE_KEY = 'iris_studio_users_v1';
const CURRENT_USER_KEY = 'iris_studio_current_user';
const IMAGES_STORAGE_KEY = 'iris_studio_images_metadata_v1';

export function calculateRemainingDays(expiryDateStr: string): number {
  const expiry = new Date(expiryDateStr);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      const initialized = INITIAL_USERS.map(u => ({
        ...u,
        remainingDays: calculateRemainingDays(u.subscriptionExpiry)
      }));
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialized));
      return initialized;
    }
    const parsed: User[] = JSON.parse(raw);
    return parsed.map(u => ({
      ...u,
      remainingDays: calculateRemainingDays(u.subscriptionExpiry)
    }));
  } catch (e) {
    console.error('Error reading stored users:', e);
    return INITIAL_USERS;
  }
}

export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to storage:', e);
  }
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      // Default to Active Studio User (Elena Vance) so first visit lands immediately in working editor
      const users = getStoredUsers();
      const defaultUser = users.find(u => u.id === 'usr-elena-02') || users[0];
      if (defaultUser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
        return defaultUser;
      }
      return null;
    }
    const user: User = JSON.parse(raw);
    user.remainingDays = calculateRemainingDays(user.subscriptionExpiry);
    // Sync with main users list in case status or expiry changed in admin panel
    const users = getStoredUsers();
    const fresh = users.find(u => u.id === user.id);
    if (fresh) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return user;
  } catch (e) {
    console.error('Error getting current user:', e);
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Error setting current user:', e);
  }
}

export function createNewUser(userData: {
  name: string;
  email: string;
  role: 'admin' | 'studio_user';
  planName: string;
  durationDays: number;
  notes?: string;
}): User {
  const users = getStoredUsers();
  const now = new Date();
  const expiry = new Date(now.getTime() + userData.durationDays * 24 * 60 * 60 * 1000);
  
  const newUser: User = {
    id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    status: 'active',
    subscriptionExpiry: expiry.toISOString(),
    remainingDays: userData.durationDays,
    planName: userData.planName || 'Pro Iris Photographer',
    createdAt: now.toISOString(),
    lastLogin: 'Never',
    notes: userData.notes || '',
    loginHistory: [],
  };

  const updated = [newUser, ...users];
  saveUsers(updated);
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;

  const current = users[index];
  const updatedUser: User = {
    ...current,
    ...updates,
  };

  if (updates.subscriptionExpiry) {
    updatedUser.remainingDays = calculateRemainingDays(updates.subscriptionExpiry);
    if (updatedUser.remainingDays > 0 && updatedUser.status === 'expired') {
      updatedUser.status = 'active';
    }
  }

  users[index] = updatedUser;
  saveUsers(users);

  // Sync current user session if modified
  const sessionUser = getCurrentUser();
  if (sessionUser && sessionUser.id === id) {
    setCurrentUser(updatedUser);
  }

  return updatedUser;
}

export function extendUserSubscription(id: string, additionalDays: number): User | null {
  const users = getStoredUsers();
  const user = users.find(u => u.id === id);
  if (!user) return null;

  const currentExpiry = new Date(user.subscriptionExpiry);
  const now = new Date();
  // If already expired, extend from today; otherwise extend from existing expiry
  const baseTime = currentExpiry.getTime() > now.getTime() ? currentExpiry.getTime() : now.getTime();
  const newExpiry = new Date(baseTime + additionalDays * 24 * 60 * 60 * 1000);

  return updateUser(id, {
    subscriptionExpiry: newExpiry.toISOString(),
    status: user.status === 'expired' ? 'active' : user.status,
  });
}

export function toggleUserBlockStatus(id: string): User | null {
  const users = getStoredUsers();
  const user = users.find(u => u.id === id);
  if (!user) return null;

  const newStatus = user.status === 'blocked' 
    ? (calculateRemainingDays(user.subscriptionExpiry) > 0 ? 'active' : 'expired')
    : 'blocked';

  return updateUser(id, { status: newStatus });
}

export function deleteUserAccount(id: string): boolean {
  const users = getStoredUsers();
  const filtered = users.filter(u => u.id !== id);
  saveUsers(filtered);

  const sessionUser = getCurrentUser();
  if (sessionUser && sessionUser.id === id) {
    setCurrentUser(null);
  }
  return true;
}

export function resetDemoData(): void {
  localStorage.removeItem(USERS_STORAGE_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(IMAGES_STORAGE_KEY);
  // Re-seed default users
  getStoredUsers();
}
