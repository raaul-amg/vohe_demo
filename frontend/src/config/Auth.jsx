import { createContext, useState, useContext, useEffect } from "react";
import { io } from 'socket.io-client';

const socket = io();
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(() => {
        const session = window.localStorage.getItem('sesionVohe');
        return session ? JSON.parse(session) : null;
    });

    useEffect(() => {
        if (usuario) {
            window.localStorage.setItem('sesionVohe', JSON.stringify(usuario));
        } else {
            window.localStorage.removeItem('sesionVohe');
        }
    }, [usuario]);

    useEffect(() => {
        socket.on('resLogin', (respuesta) => {
            if (respuesta !== false) {
                setUsuario({
                    usuario: respuesta.usuario,
                    delegacion: respuesta.delegacion,
                    rol: respuesta.rol,
                    admin: respuesta.admin,
                    });
            } else {
                alert("Acceso denegado");
            }
        });

        return () => socket.off('resLogin')
    }, []);

    const login = (usuario, password) => {
        const payload = {
            usuario: usuario,
            password: password,
        }
        socket.emit('login', payload);
    };

    return (
        <AuthContext.Provider value = {{usuario, login}}>
            {children}
        </AuthContext.Provider>
    );

};

export const useAuth = () => useContext(AuthContext);