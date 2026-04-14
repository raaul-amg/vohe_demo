import { useState } from 'react'
import { useAuth } from './config/Auth'
import Login from './views/Login'
import Admin from './views/Admin'
import Public from './views/Public'
import './App.css'

function App() {

  const {usuario} = useAuth();

  if (!usuario) { return <Login/> } 
  else if (usuario.admin === true) { return <Admin/> } 
  else if (usuario.admin === false) { return <Public/> } 
  
}

export default App
