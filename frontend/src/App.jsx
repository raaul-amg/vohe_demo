import { useState, useEffect } from 'react'
import { useAuth } from './config/Auth'
import { io } from 'socket.io-client';
import Login from './views/Login'
import Admin from './views/Admin'
import Public from './views/Public'
import './App.css'

const url = import.meta.env.DEV ? "http://localhost:8080" : '/';
const socket = io(url);

export default function vista() {

  const {usuario} = useAuth();

  useEffect(() => {
    const savedToken = localStorage.getItem('cettoken');
    if (savedToken){
      socket.emit('verificacion', savedToken)
    }

    socket.on('resVerificacion', (datos) => {
      if (datos){
        setUsuario(datos);
      } else {
        localStorage.removeItem('cettoken');
      }
    });

    return () => socket.off('resVerificacion')
  }, []);

  if (!usuario) { return <Login/> }
  else if (usuario.admin === true) { return <Admin/> } 
  else { return <Public/> } 
}