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
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm mx-auto my-auto">
      <h2 className="text-ceet text-4xl font-ceet bg-clip-text mb-8 mx-auto">Inicio de sesión</h2>
      
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