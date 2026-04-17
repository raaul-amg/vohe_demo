import { useState } from 'react';
import { useAuth } from '../config/Auth';

export default function Login() {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');

    const { login } = useAuth();

    const enviar = (e) => {
        e.preventDefault();
        if (password.trim() === '') return;
        login(usuario, password);
    };

    return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <h2>Inicio de sesión</h2>
      
      <form onSubmit={enviar}>
        <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}