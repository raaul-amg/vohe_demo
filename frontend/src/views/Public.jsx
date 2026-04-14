import { useState, useEffect } from "react";
import { io } from 'socket.io-client'

const url = import.meta.env ? "http://localhost:8080" : '/';
const socket = io(url);

export default function Public() {
    const [usuario, setUsuario] = useState({
        nombre: '',
        delegación: '',
        admin: false,
    });
    
    const [asamblea, setAsamblea] = useState({
        cola: [],
        hablando: null,
        tema: {titulo: "Cargando"},
        turnoAbierto: true,
    });
    const [tiempo, setTiempo] = useState(0);

    useEffect(() => {
        socket.on('estado_actualizado', (estado) => setAsamblea(estado));
        socket.on('tiempo', (t) => setTiempo(t));
        return () => {
            socket.off('estado_actualizado');
            socket.off('tiempo');
        };
    }, []);

    const pedirTurno = (datos) => {
        
        const prioridades = {
            'Apunte Técnico': 5,
            'Punto de información': 4,
            'Respuesta por alusión directa': 3,
            'Respuesta normal': 2,
            'Intervención': 1,
        };

        socket.emit('agregarTurno', {
            nombre: nombre,
            delegacion: delegacion,
            tipo: tipo,
            prioridad: prioridades[tipo]
        });

        setNombre('');
        setDelegacion('');

  };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
}
