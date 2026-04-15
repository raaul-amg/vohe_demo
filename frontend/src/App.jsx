import { useState } from 'react'
import { useAuth } from './config/Auth'
import Login from './views/Login'
import Admin from './views/Admin'
import Public from './views/Public'
import './App.css'

export default function vista() {

    const [vistaActual, setVistaActual] = useState('menu');

    if (vistaActual === 'admin'){
      return <Admin/>
    }

    if (vistaActual === 'public'){
      return <Public/>
    }

  return (
    <div>
      <button onClick={() => setVistaActual('admin')}>Vista admin</button>
      <button onClick={() => setVistaActual('public')}>Vista público</button>
    </div>
  )

  // const {usuario} = useAuth();

  // if (!usuario) { return <Login/> } 
  // else if (usuario.admin === true) { return <Admin/> } 
  // else if (usuario.admin === false) { return <Public/> } 
  
}