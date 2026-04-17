// Ejemplo de cómo debería ser tu AuthContext (resumido)
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);

  return (
    <AuthContext.Provider value={{ usuario, setUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);