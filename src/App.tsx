import React, { useState, useEffect } from 'react';
import { User, IrisImage, ToastMessage, AdjustmentValues, IrisMaskConfig } from './types';
import { 
  getStoredUsers, 
  getCurrentUser, 
  setCurrentUser as persistCurrentUser, 
  createNewUser, 
  updateUser, 
  deleteUserAccount, 
  extendUserSubscription, 
  toggleUserBlockStatus, 
  resetDemoData 
} from './services/storage';
import { INITIAL_SAMPLE_IMAGES } from './services/sampleData';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/Toast';
import { LoginView } from './components/auth/LoginView';
import { AccessRestrictedView } from './components/auth/AccessRestrictedView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Workspace } from './components/workspace/Workspace';

export default function App() {
  // User & Authentication State
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'workspace' | 'admin'>('workspace');
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  // Workspace Images State
  const [images, setImages] = useState<IrisImage[]>(INITIAL_SAMPLE_IMAGES);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(INITIAL_SAMPLE_IMAGES[0]?.id || null);

  // Modals state triggered via header
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isEffectsModalOpen, setIsEffectsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Toast Notification Queue
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize data on mount
  useEffect(() => {
    const loadedUsers = getStoredUsers();
    setUsers(loadedUsers);

    const sessionUser = getCurrentUser();
    if (sessionUser) {
      setCurrentUser(sessionUser);
      // If admin, open admin dashboard if requested, otherwise editor
      if (sessionUser.role === 'admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('workspace');
      }
    }
  }, []);

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      type,
      title,
      message,
    };
    setToasts(prev => [...prev.slice(-4), newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    persistCurrentUser(user);
    setIsLoggedOut(false);
    
    if (user.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('workspace');
    }

    addToast('success', `Welcome, ${user.name}`, `Signed in as ${user.role === 'admin' ? 'Administrator' : 'Studio Photographer'}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    persistCurrentUser(null);
    setIsLoggedOut(true);
    addToast('info', 'Logged out', 'Demo session concluded.');
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    persistCurrentUser(user);
    setIsLoggedOut(false);

    if (user.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('workspace');
    }

    addToast('info', 'Switched Account', `Now operating as ${user.name}`);
  };

  // Admin Actions
  const handleCreateUser = (userData: any) => {
    const created = createNewUser(userData);
    const updated = getStoredUsers();
    setUsers(updated);
    addToast('success', 'User Created', `Provisioned studio access for ${created.name}`);
  };

  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    const updated = updateUser(id, updates);
    if (updated) {
      setUsers(getStoredUsers());
      addToast('success', 'User Updated', `Saved profile changes for ${updated.name}`);
    }
  };

  const handleDeleteUser = (id: string) => {
    const target = users.find(u => u.id === id);
    deleteUserAccount(id);
    setUsers(getStoredUsers());
    addToast('warning', 'User Deleted', `Removed ${target?.name || 'account'} from studio roster.`);
  };

  const handleExtendSubscription = (id: string, days: number) => {
    const updated = extendUserSubscription(id, days);
    if (updated) {
      setUsers(getStoredUsers());
      if (currentUser?.id === id) {
        setCurrentUser(updated);
      }
      addToast('success', 'Subscription Extended', `Added +${days} days to ${updated.name}'s studio license.`);
    }
  };

  const handleToggleBlock = (id: string) => {
    const updated = toggleUserBlockStatus(id);
    if (updated) {
      setUsers(getStoredUsers());
      if (currentUser?.id === id) {
        setCurrentUser(updated);
      }
      addToast(
        updated.status === 'blocked' ? 'warning' : 'success',
        updated.status === 'blocked' ? 'Account Suspended' : 'Account Re-activated',
        `${updated.name} access state updated.`
      );
    }
  };

  const handleResetDemoData = () => {
    resetDemoData();
    const freshUsers = getStoredUsers();
    setUsers(freshUsers);
    setImages(INITIAL_SAMPLE_IMAGES);
    setSelectedImageId(INITIAL_SAMPLE_IMAGES[0]?.id || null);

    // Default to Elena Vance
    const defaultUser = freshUsers.find(u => u.id === 'usr-elena-02') || freshUsers[0];
    setCurrentUser(defaultUser);
    persistCurrentUser(defaultUser);
    setCurrentView('workspace');
    setIsLoggedOut(false);

    addToast('info', 'Demo Data Reset', 'Restored default users, subscription durations, and fine art samples.');
  };

  // Workspace Actions
  const handleAddImage = (newImg: IrisImage) => {
    setImages(prev => [newImg, ...prev]);
    setSelectedImageId(newImg.id);
  };

  const handleDeleteImage = (id: string) => {
    setImages(prev => {
      const remaining = prev.filter(img => img.id !== id);
      if (selectedImageId === id) {
        setSelectedImageId(remaining[0]?.id || null);
      }
      return remaining;
    });
  };

  const handleUpdateImageAdjustments = (id: string, adjustments: AdjustmentValues) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, adjustments } : img));
  };

  const handleUpdateImageMask = (id: string, maskConfig: IrisMaskConfig) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, maskConfig } : img));
  };

  const handleApplyEnhancedImage = (id: string, enhancedUrl: string) => {
    setImages(prev => prev.map(img => img.id === id ? { 
      ...img, 
      enhancedUrl, 
      isEnhanced: true 
    } : img));
  };

  // Check if current user is blocked or expired
  const isAccessRestricted = currentUser && (currentUser.status === 'expired' || currentUser.status === 'blocked');

  // If user is explicitly logged out, show LoginView
  if (isLoggedOut || !currentUser) {
    return (
      <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col">
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          availableUsers={users.length > 0 ? users : getStoredUsers()}
        />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  // If active user session is expired or blocked, show AccessRestrictedView
  if (isAccessRestricted && currentView !== 'admin') {
    return (
      <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col">
        <Header
          currentUser={currentUser}
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onLogout={handleLogout}
          onSwitchUser={handleSwitchUser}
          availableUsers={users}
          hasActiveImage={false}
          onResetDemoData={handleResetDemoData}
        />
        <AccessRestrictedView
          user={currentUser}
          onLogout={handleLogout}
          onSwitchToAdmin={() => {
            const adminUser = users.find(u => u.role === 'admin') || users[0];
            if (adminUser) {
              handleSwitchUser(adminUser);
            }
          }}
          onRequestReactivation={() => {
            addToast('info', 'Reactivation Requested', 'Simulated request sent to studio administration.');
          }}
        />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#070a12] text-slate-100 overflow-hidden select-none">
      {/* 3-Zone Clean Header */}
      <Header
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        availableUsers={users}
        onUploadClick={() => {
          const input = document.querySelector('input[type="file"]') as HTMLInputElement;
          input?.click();
        }}
        onEnhanceClick={() => setIsAiModalOpen(true)}
        onEffectsClick={() => setIsEffectsModalOpen(true)}
        onExportClick={() => setIsExportModalOpen(true)}
        onPrintClick={() => setIsPrintModalOpen(true)}
        hasActiveImage={!!selectedImageId}
        onResetDemoData={handleResetDemoData}
      />

      {/* Main View Area */}
      {currentView === 'admin' ? (
        <AdminDashboard
          users={users}
          onCreateUser={handleCreateUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onExtendSubscription={handleExtendSubscription}
          onToggleBlock={handleToggleBlock}
          onResetDemoData={handleResetDemoData}
          onSwitchToEditorAsUser={(user) => {
            handleSwitchUser(user);
            setCurrentView('workspace');
          }}
        />
      ) : (
        <Workspace
          images={images}
          selectedImageId={selectedImageId}
          onSelectImage={(id) => setSelectedImageId(id)}
          onAddImage={handleAddImage}
          onDeleteImage={handleDeleteImage}
          onUpdateImageAdjustments={handleUpdateImageAdjustments}
          onUpdateImageMask={handleUpdateImageMask}
          onApplyEnhancedImage={handleApplyEnhancedImage}
          currentUser={currentUser}
          onNotify={addToast}
          isAiModalOpen={isAiModalOpen}
          setIsAiModalOpen={setIsAiModalOpen}
          isEffectsModalOpen={isEffectsModalOpen}
          setIsEffectsModalOpen={setIsEffectsModalOpen}
          isExportModalOpen={isExportModalOpen}
          setIsExportModalOpen={setIsExportModalOpen}
          isPrintModalOpen={isPrintModalOpen}
          setIsPrintModalOpen={setIsPrintModalOpen}
        />
      )}

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
