import React, { createContext, useContext, useState, useEffect } from 'react';
import { createMMKV } from 'react-native-mmkv';
import { User, Role } from './types';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  changePassword: (newPassword: string, newUsername?: string) => boolean;
  createUser: (name: string, username: string, role: Role, salary: number) => { tempPass: string; user: User } | null;
  promoteUser: (userId: string, newRole: Role) => void;
  praiseUser: (userId: string, tag: string) => void;
  deleteUser: (userId: string) => void;
}

const storage = createMMKV();
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Senha inicial padrão do admin
const DEFAULT_ADMIN: User = {
  id: 'admin-id-1',
  name: 'Administrador Principal',
  username: 'admin',
  role: 'admin',
  passwordHash: 'admin123', // Em produção seria um hash criptográfico
  isTempPassword: true,
  salary: 10000,
  tags: [],
  promotions: []
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  // Inicializar usuários e carregar sessão atual do MMKV
  useEffect(() => {
    try {
      // Carregar lista de usuários
      const storedUsers = storage.getString('pdv_users');
      let loadedUsers: User[] = [];
      if (storedUsers) {
        loadedUsers = JSON.parse(storedUsers);
        // Migração: se o admin padrão 'admin' ainda existe e está com a senha padrão 'admin123',
        // garante que isTempPassword é true para forçar a redefinição de segurança.
        const adminIndex = loadedUsers.findIndex(u => u.id === 'admin-id-1' && u.username === 'admin');
        if (adminIndex !== -1 && loadedUsers[adminIndex].passwordHash === 'admin123' && !loadedUsers[adminIndex].isTempPassword) {
          loadedUsers[adminIndex].isTempPassword = true;
          storage.set('pdv_users', JSON.stringify(loadedUsers));
        }
      } else {
        // Inicializar com administrador padrão
        loadedUsers = [DEFAULT_ADMIN];
        storage.set('pdv_users', JSON.stringify(loadedUsers));
      }
      setUsers(loadedUsers);

      // Carregar usuário logado
      const storedSession = storage.getString('pdv_current_user');
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        // Garantia de sessão atual para o admin padrão
        if (parsed.id === 'admin-id-1' && parsed.username === 'admin' && parsed.passwordHash === 'admin123' && !parsed.isTempPassword) {
          parsed.isTempPassword = true;
          storage.set('pdv_current_user', JSON.stringify(parsed));
        }
        setCurrentUser(parsed);
      }
    } catch (e) {
      console.error("Erro ao carregar dados de autenticação:", e);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (foundUser && foundUser.passwordHash === password) {
      setCurrentUser(foundUser);
      storage.set('pdv_current_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof storage.remove === 'function') {
      storage.remove('pdv_current_user');
    } else if (typeof (storage as any).delete === 'function') {
      (storage as any).delete('pdv_current_user');
    } else if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('pdv_current_user');
    }
    router.replace('/login' as any);
  };

  const changePassword = (newPassword: string, newUsername?: string): boolean => {
    if (!currentUser) return false;

    let finalUsername = currentUser.username;
    if (newUsername) {
      const normalizedUsername = newUsername.toLowerCase().trim();
      if (!normalizedUsername) return false;
      
      const taken = users.some(
        u => u.id !== currentUser.id && u.username.toLowerCase() === normalizedUsername
      );
      if (taken) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Nome de usuário já está em uso!'
        });
        return false;
      }
      finalUsername = normalizedUsername;
    }

    const updatedUser = {
      ...currentUser,
      username: finalUsername,
      passwordHash: newPassword,
      isTempPassword: false
    };

    // Atualizar na lista
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    
    setUsers(updatedUsers);
    storage.set('pdv_users', JSON.stringify(updatedUsers));

    setCurrentUser(updatedUser);
    storage.set('pdv_current_user', JSON.stringify(updatedUser));

    return true;
  };

  const createUser = (name: string, username: string, role: Role, salary: number) => {
    // Validar username único
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Nome de usuário já existe!'
      });
      return null;
    }

    // Gerar senha temporária de 6 dígitos numéricos
    const tempPass = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      username,
      role,
      passwordHash: tempPass,
      isTempPassword: true,
      salary,
      tags: [],
      promotions: []
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    storage.set('pdv_users', JSON.stringify(updatedUsers));

    return { tempPass, user: newUser };
  };

  const promoteUser = (userId: string, newRole: Role) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const promotion = {
          oldRole: u.role,
          newRole: newRole,
          date: new Date().toISOString()
        };
        return {
          ...u,
          role: newRole,
          promotions: [...u.promotions, promotion]
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    storage.set('pdv_users', JSON.stringify(updatedUsers));

    // Se o usuário promovido for o atual, atualiza a sessão
    if (currentUser && currentUser.id === userId) {
      const updatedCurrent = updatedUsers.find(u => u.id === userId)!;
      setCurrentUser(updatedCurrent);
      storage.set('pdv_current_user', JSON.stringify(updatedCurrent));
    }
  };

  const praiseUser = (userId: string, tag: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const newTag = {
          tag,
          date: new Date().toISOString()
        };
        return {
          ...u,
          tags: [...u.tags, newTag]
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    storage.set('pdv_users', JSON.stringify(updatedUsers));

    if (currentUser && currentUser.id === userId) {
      const updatedCurrent = updatedUsers.find(u => u.id === userId)!;
      setCurrentUser(updatedCurrent);
      storage.set('pdv_current_user', JSON.stringify(updatedCurrent));
    }
  };

  const deleteUser = (userId: string) => {
    if (currentUser && currentUser.id === userId) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Você não pode excluir a si mesmo!'
      });
      return;
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    storage.set('pdv_users', JSON.stringify(updatedUsers));
    
    Toast.show({
      type: 'success',
      text1: 'Sucesso',
      text2: 'Funcionário removido!'
    });
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      login,
      logout,
      changePassword,
      createUser,
      promoteUser,
      praiseUser,
      deleteUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
}
