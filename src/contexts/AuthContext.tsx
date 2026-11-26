import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/auth';
import { dbService } from '../services/storage/databaseService';
import { isFirebaseConfigured, auth as firebaseAuth } from '../services/firebase/config';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  departmentId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isFirebaseMode: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchUserRoleForTesting: (uid: string) => void;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_SESSION_KEY = 'sapie_active_session_uid';
const LEGACY_AUTH_STORAGE_KEY = 'sapie_current_user_uid';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Buang kunci auto-login lama dari localStorage supaya pengguna baru/tab baru sentiasa ke skrin Login dahulu
    localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);

    if (isFirebaseConfigured && firebaseAuth) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
        if (fbUser) {
          const profile = dbService.getUserByEmail(fbUser.email || '') || {
            uid: fbUser.uid,
            email: fbUser.email || '',
            fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Pengguna',
            role: 'pensyarah' as UserRole,
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setUser(profile);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Gunakan sessionStorage: hanya kekal jika pengguna sudah log masuk dalam tab semasa.
      // Jika baru buka pautan laman web, user = null -> automatik dibawa ke paparan /login dahulu!
      const savedUid = sessionStorage.getItem(AUTH_SESSION_KEY);
      if (savedUid) {
        const found = dbService.getUserById(savedUid);
        if (found && found.active) {
          setUser(found);
        } else {
          sessionStorage.removeItem(AUTH_SESSION_KEY);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setError(null);
    setLoading(true);

    try {
      if (isFirebaseConfigured && firebaseAuth) {
        await signInWithEmailAndPassword(firebaseAuth, email, password || '');
        const profile = dbService.getUserByEmail(email);
        if (profile) setUser(profile);
      } else {
        const foundUser = dbService.getUserByEmail(email);
        if (!foundUser) {
          setError('Alamat e-mel tidak berdaftar dalam sistem SAPIe.');
          setLoading(false);
          return false;
        }

        if (!foundUser.active) {
          setError('Akaun anda telah dinyahaktifkan oleh pihak pentadbir.');
          setLoading(false);
          return false;
        }

        setUser(foundUser);
        sessionStorage.setItem(AUTH_SESSION_KEY, foundUser.uid);

        dbService.createAuditLog({
          actorUid: foundUser.uid,
          actorName: foundUser.fullName,
          actorRole: foundUser.role,
          action: 'LOGIN',
          entityType: 'Auth',
          entityIdentifier: foundUser.email,
          outcome: 'Berjaya',
          details: `Log masuk berjaya ke sistem SAPIe (${foundUser.fullName} - ${foundUser.role})`,
        });
      }

      setLoading(false);
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Log masuk gagal. Sila semak kelayakan anda.');
      setLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    if (user) {
      dbService.createAuditLog({
        actorUid: user.uid,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'LOGOUT',
        entityType: 'Auth',
        entityIdentifier: user.email,
        outcome: 'Berjaya',
        details: `Log keluar dari sistem SAPIe`,
      });
    }

    if (isFirebaseConfigured && firebaseAuth) {
      await firebaseSignOut(firebaseAuth);
    }

    sessionStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
    setUser(null);
  };

  const switchUserRoleForTesting = (uid: string) => {
    const target = dbService.getUserById(uid);
    if (target) {
      setUser(target);
      sessionStorage.setItem(AUTH_SESSION_KEY, target.uid);
      dbService.createAuditLog({
        actorUid: target.uid,
        actorName: target.fullName,
        actorRole: target.role,
        action: 'LOGIN',
        entityType: 'Auth',
        entityIdentifier: target.email,
        outcome: 'Berjaya',
        details: `Log masuk ke sistem SAPIe: ${target.fullName} (${target.role})`,
      });
    }
  };

  const updateCurrentUserProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = dbService.updateUser(user.uid, updates, user);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        departmentId: user?.departmentId || null,
        isAuthenticated: Boolean(user),
        loading,
        error,
        isFirebaseMode: isFirebaseConfigured,
        login,
        logout,
        switchUserRoleForTesting,
        updateCurrentUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
