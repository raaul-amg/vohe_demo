import { useState, useEffect } from 'react'
import { useAuth } from './config/Auth'
import { io } from 'socket.io-client';
import Login from './views/Login'
import Admin from './views/Admin'
import Public from './views/Public'
import './index.css'

const url = import.meta.env.DEV ? "http://localhost:8080" : '/';
const socket = io(url);

export default function App() {

  const { usuario, setUsuario } = useAuth();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('ceettoken');

    // socket.on('error', (mensaje) => alert(mensaje));

    // socket.on('connect_error', (err) => {
    //   console.log("Error de conexión:", err.message);
    //   alert("Has recargado demasiadas veces. Inténtalo más tarde.");
    //   setCargando(false);
    //   setUsuario(null);
    //   socket.disconnect(); 
    // });

    socket.on('resVerificacion', (datos) => {
      if (datos){
        setUsuario(datos);
      } else {
        localStorage.removeItem("ceettoken");
        setUsuario(null);
      }

      setCargando(false);
    });

    if (savedToken){
      socket.emit('verificacion', savedToken)
    } else {
      setUsuario(null);
      setCargando(false);
    }

    

    return () => socket.off('resVerificacion')
  }, []);

  if (cargando) {
    return <div>Cargando...</div>
  }

  if (usuario === null) { return <Login/> }
  else if (usuario.admin === 1 || usuario.admin === true) { return <Admin/> } 
  else { return <Public/> } 
}