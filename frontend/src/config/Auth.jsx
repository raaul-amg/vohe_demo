import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  
  const [usuario, setUsuario] = useState({
      usuario: '',
      nombre: '',
      delegacion: '',
      rol: '',
      admin: false,
    });

  return (
    <AuthContext.Provider value={{ usuario, setUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);