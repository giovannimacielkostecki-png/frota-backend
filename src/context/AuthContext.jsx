import { createContext, useContext, useState } from 'react';

import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function login(email, senha) {
    const response = await api.post('/auth/login', {
      email,
      senha,
    });

    const { token, usuario } = response.data;

    localStorage.setItem('@frota:token', token);
    localStorage.setItem('@frota:user', JSON.stringify(usuario));

    setUser(usuario);
  }

  function logout() {
    localStorage.removeItem('@frota:token');
    localStorage.removeItem('@frota:user');

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}