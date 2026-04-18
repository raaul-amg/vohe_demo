import { useState, useEffect } from 'react'
import { useAuth } from './config/Auth'
import { io } from 'socket.io-client';
import Login from './views/Login'
import Admin from './views/Admin'
import Public from './views/Public'
import './App.css'

const url = import.meta.env.DEV ? "http://localhost:8080" : '/';
const socket = io(url);

export default function App() {

  const { usuario, setUsuario } = useAuth();

  useEffect(() => {
    const savedToken = localStorage.getItem('ceettoken');
    if (savedToken){
      socket.emit('verificacion', savedToken)
    } else {
      setUsuario(null)
    }

    socket.on('resVerificacion', (datos) => {
      if (datos){
        setUsuario(datos);
      } else {
        localStorage.removeItem("ceettoken");
      }
    });

    return () => socket.off('resVerificacion')
  }, []);

  if (usuario === null) { return <Login/> }
  else if (usuario.admin === Number(true)) { return <Admin/> } 
  else { return <Public/> } 
}