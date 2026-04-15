import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const url = import.meta.env.DEV ? "http://localhost:8080" : "/";
const socket = io(url);

export default function Public() {
  const [usuario, setUsuario] = useState({
    nombre: "Raúl",
    delegacion: "UPM",
    admin: false,
  });

  const [conectado, setConectado] = useState(false);

  const [asamblea, setAsamblea] = useState({
    turnos: [],
    hablando: null,
    tema: "",
    turnoAbierto: true,
  });

  const [tiempo, setTiempo] = useState(0);

  useEffect(() => {
    socket.on("estado_actualizado", (estado) => {
      setAsamblea(estado);
      setConectado(true);
    });

    socket.on("tiempo", (t) => setTiempo(t));

    socket.emit("pedirUpdate");

    return () => {
      socket.off("estado_actualizado");
      socket.off("tiempo");
    };
  }, []);

  const pedirTurno = (datos) => {
    const prioridades = {
      "Apunte Técnico": 5,
      "Punto de información": 4,
      "Respuesta por alusión directa": 3,
      "Respuesta normal": 2,
      Intervención: 1,
    };

    socket.emit("pedirTurno", {
      nombre: nombre,
      delegacion: delegacion,
      intervencion: intervencion,
      prioridad: prioridades[intervencion],
      solicitud: true,
    });

    setNombre("");
    setDelegacion("");
  };

  const cortarTurno = (datos) => {
    socket.emit("cortarTurno", {
      id: datos.id,
      nombre: datos.nombre,
      delegacion: datos.delegacion,
    });

    setNombre("");
    setDelegacion("");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div>
      <h1>Vista pública</h1>

      <div>
        <h2>Tema</h2>
        <h3>{asamblea.tema || "Sin tema seleccionado"}</h3>
      </div>

      <br />

      <div>
        <h2>Turnos</h2>

        <div>
          <button type="button" onClick={() => pedirTurno("Apunte técnico")}>
            Apunte técnico
          </button>
          <button
            type="button"
            onClick={() => pedirTurno("Punto de información")}
          >
            Punto de información
          </button>
          <button
            type="button"
            onClick={() => pedirTurno("Respuesta por alusión directa")}
          >
            Respuesta por alusión directa
          </button>
          <button type="button" onClick={() => pedirTurno("Respuesta normal")}>
            Respuesta normal
          </button>
          <button type="button" onClick={() => pedirTurno("Intervención")}>
            Intervención
          </button>
        </div>

        <div>
          {asamblea.turnos.map((turno, index) => (
            <div key={turno.id}>
              <div>
                <span>{index + 1 + ". "}</span>
                <span>{`${turno.nombre} - ${turno.delegacion}: `}</span>
                <span>{turno.intervencion}</span>
                <span>
                  {turno.nombre === usuario.nombre &&
                  turno.delegacion === usuario.delegacion ? (
                    <button type="button" onClick={() => cortarTurno(turno)}>
                      Cortar turno
                    </button>
                  ) : (
                    ""
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
