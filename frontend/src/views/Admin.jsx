const { useEffect } = require("react")

import { useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../config/Auth';

const socket = io();

export default function Admin(){

  // const { usuario } = useAuth();

  //  if (usuario === null){
  //    return <Login />
  //  } else if (usuario.admin !== true) {
  //    return <Public />
  //  }

  const {tema, setTema} = useState('');
  const [nombre, setNombre] = useState('');
  const [delegacion, setDelegacion] = useState('');
  const [minutos, setMinutos] = useState(3);
  const [horaPeticion, setHoraPeticion] = useState(0);
  const [tiempo, setTiempo] = useState(0);

  const [asamblea, setAsamblea] = useState({
      cola: [],
      historial: [],
      hablando: null,
      timerActivo: false,
      tema: { titulo: '', archivo: ''},
      turnoAbierto: true,
    });

  const odd = [
    { titulo: "1. Aprobación, si procede, del orden del día.", archivo: "/1.ODD.pdf" },
    { titulo: "2. Aprobación, si procede, del acta de la asamblea general anterior.", archivo: " " },
    { titulo: "3. Lectura y puesta en conocimiento de documentación relevante.", archivo: "/3.Dimision_A.Espada.pdf" },
    { titulo: "4. Ratificación, si procede, del nuevo modelo de acreditaciones.", archivo: "/4.AcreditacionRepresentatividad.pdf" },
    { titulo: "5. Punto de información sobre el estado de las cuentas de la asociación.", archivo: " " },
    { titulo: "6. Informe de la Presidencia", archivo: "/6.InformePresidencia.pdf" },
  ];

  const representantes = [
    { nombre: 'Olga', delegacion: 'UPV' },
    { nombre: 'David', delegacion: 'Secretaría' },
    { nombre: 'Susi', delegacion: 'UC3M' },
    { nombre: 'Marcos', delegacion: 'UEx' },
    { nombre: 'José Antonio', delegacion: 'UEx' },
    { nombre: 'Julio', delegacion: 'UC' },
    { nombre: 'Vera', delegacion: 'UPV' },
    { nombre: 'Raúl', delegacion: 'UPM'},
  ];

  useEffect(() => {

    socket.on('estado_actualizado', (estado) => setAsamblea(estado));
    socket.on('tiempo', (t) => setTiempo(t));

    return () => {
        socket.off('estado_actualiado');
        socket.off('tiempo');
    };

  }, []);

  const cambiarTema = () => {
    
    if(!tema.trim()) return;

    const temaEncontrado = odd.find(t => t.titulo === tema);
    const payload = temaEncontrado ? temaEncontrado : {titulo: inputTema, archivo: null};
    socket.emit('actualizar_tema', payload);
    setTema('');
  };

  const cambiarNombre = (e) => setNombre(e);

  const agregarTurno = (intervencion) => {
    if (!nombre.trim() || !delegacion.trim()) return alert("Falta nombre o delegación");
    
    const prioridades = {
        'Apunte Técnico': 5,
        'Punto de información': 4,
        'Respuesta por alusión directa': 3,
        'Respuesta normal': 2,
        'Intervención': 1,
    };

    socket.emit('agregarTurno', {
        tema: tema,
        nombre: nombre,
        delegacion: delegacion,
        intervencion: intervencion,
        prioridad: prioridades[intervencion],
        minutos: minutos,
        // que hay de los demás atributos???
    });

    setNombre('');
    setDelegacion('');

  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60); 
    const s = secs % 60; 
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const exportarHistorial = () => {
    // a ver como lo hacemos...
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <h2>Admin View</h2>
      
      <form onSubmit = {cambiarTema}>

        <h3>Tema</h3>
        <h2>{asamblea.tema?.titulo || "Sin tema seleccionado"}</h2>
        <input 
          type="text" 
          list="listaTemas" 
          value={tema} 
          onChange={(e) => setTema(e.target.value)} 
          placeholder="Escribe o selecciona el tema" 
        />
        <datalist id="listaTemas">
          {odd.map((t, i) => <option key={i} value={t.titulo} />)}
        </datalist>
        <button type="submit">Enviar</button>

      </form>

      <form onSubmit = {agregarTurno}>
        <h3>Nombre</h3>
        <input 
          type="text"
          list="listaNombres"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
        />
        <datalist id="listaNombres">
          {representantes.map((t, i) => <option key={i} value={`${t.nombre} (${t.delegacion})`} />)}
        </datalist>
        <input 
          type="text"
          value={delegacion}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Delegación"
        />

        <select>
          <option value="1" onChange={(e) => setMinutos(e.target.value)}></option>
          <option value="2" onChange={(e) => setMinutos(e.target.value)}></option>
          <option value="3" onChange={(e) => setMinutos(e.target.value)}></option>
          <option value="4" onChange={(e) => setMinutos(e.target.value)}></option>
          <option value="5" onChange={(e) => setMinutos(e.target.value)}></option>
        </select>
        
        <button type="submit" onClick={() => agregarTurno('Apunte técnico')}>Apunte técnico</button>
        <button type="submit" onClick={() => agregarTurno('Punto de información')}>Punto de información</button>
        <button type="submit" onClick={() => agregarTurno('Respuesta por alusión directa')}>Respuesta por alusión directa</button>
        <button type="submit" onClick={() => agregarTurno('Respuesta normal')}>Respuesta normal</button>
        <button type="submit" onClick={() => agregarTurno('Intervención')}>Intervención</button>
      </form>

    </div>
  );

}