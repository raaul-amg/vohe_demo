import { useEffect, useState } from 'react';
import { useAuth } from '../config/Auth';
import { socket } from '../config/socket'

export default function Login() {

  const { usuario, setUsuario } = useAuth();

  const [usuarioTemp, setUsuarioTemp] = useState('');
  const [password, setPassword] = useState('');

  const enviar = (e) => {
        e.preventDefault();
        if (password.trim() === '') return;

        const payload = {
          usuario: usuarioTemp,
          password: password
        }

        socket.emit('login', payload)
    };

    useEffect(() => {

      socket.on('resLogin', (datos) => {

        if (!datos) {
          alert("Usuario o contraseña incorrectos");
          return;
        }

        localStorage.setItem('ceettoken', datos.token);
        setUsuario(datos.userData);
      })

      return () => {
        socket.off('resLogin');
      };
          
    }, [setUsuario]);

    return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <h2>Inicio de sesión</h2>
      
      <form onSubmit={enviar}>
        <input
            type="text"
            placeholder="Usuario"
            value={usuarioTemp}
            onChange={(e) => setUsuarioTemp(e.target.value)}
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