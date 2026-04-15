import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../config/Auth';

const url = import.meta.env.DEV ? "http://localhost:8080" : '/';
const socket = io(url);

export default function Admin(){

  // const { usuario } = useAuth();

  //  if (usuario === null){
  //    return <Login />
  //  } else if (usuario.admin !== true) {
  //    return <Public />
  //  }

  const [tema, setTema] = useState('');
  const [nombre, setNombre] = useState('');
  const [delegacion, setDelegacion] = useState('');
  const [minutos, setMinutos] = useState(3);
  const [tiempo, setTiempo] = useState(0);

  const [asamblea, setAsamblea] = useState({
      turnos: [],
      historial: [],
      hablando: null,
      timerActivo: false,
      tema: '',
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

  const cambiarTema = (e) => {
    
    e.preventDefault();
    if(!tema.trim()) return;

    socket.emit('actualizarTema', {
      tema: tema, 
      archivo: null,
    });

    setTema('');
  };

  const filtroRepresentante = (e) => {
    let representante = e.split(' - ');
    setNombre(representante[0]);
    setDelegacion(representante[1]);
  }

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
        solicitud: false,
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
      <h1>Panel de control</h1>
      
      <form onSubmit = {cambiarTema}>

        <h3>Tema</h3>
        <h2>{asamblea.tema || "Sin tema seleccionado"}</h2>
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

        <select id="min" onChange={(e) => setMinutos(e.target.value)}>
          <option value="null">Sin duración</option>
          <option value="1">1 min</option>
          <option value="2">2 min</option>
          <option value="3">3 min</option>
          <option value="4">4 min</option>
          <option value="5" selected="selected">5 min</option>
        </select>

        <button type="submit">Enviar</button>

      </form>

      <form>
        <h3>Agregar manualmente a un representante</h3>
        <input 
          type="text"
          list="listaRepresentantes"
          onChange={(e) => filtroRepresentante(e.target.value)}
          placeholder="Representante"
        />
        <datalist id="listaRepresentantes">
          {representantes.map((r, i) => <option key={i} value={`${r.nombre} - ${r.delegacion}`}/>)}
        </datalist>
        
        <br/>
        
        <select value={minutos} onChange={(e) => setMinutos(Number(e.target.value))}>
          <option value="null">Sin duración</option>
          <option value="1">1 min</option>
          <option value="2">2 min</option>
          <option value="3">3 min</option>
          <option value="4">4 min</option>
          <option value="5">5 min</option>
        </select>

        <br/>
        
        <button type="reset" onClick={() => agregarTurno('Apunte técnico')}>Apunte técnico</button>
        <button type="reset" onClick={() => agregarTurno('Punto de información')}>Punto de información</button>
        <button type="reset" onClick={() => agregarTurno('Respuesta por alusión directa')}>Respuesta por alusión directa</button>
        <button type="reset" onClick={() => agregarTurno('Respuesta normal')}>Respuesta normal</button>
        <button type="reset" onClick={() => agregarTurno('Intervención')}>Intervención</button>
      </form>

      <h2>Turnos</h2>

      <div>

        {asamblea.turnos.map((turno, index) => 
        <div key={turno.id}>
          <div>
            <span>{index + 1 + ". "}</span>
            <span>{`${turno.nombre} - ${turno.delegacion}: `}</span>
            <span>{turno.intervencion}</span>
          </div>
          <button type="button" onClick={() => socket.emit('eliminarTurno', turno.id)}>Eliminar</button>
        </div>
      )}

      </div>

    </div>
  );

}