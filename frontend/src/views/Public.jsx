import { useState, useEffect } from "react";
import { useAuth } from "../config/Auth";
import { socket } from "../config/socket";

export default function Public() {
  const { usuario, setUsuario } = useAuth();

  const [conectado, setConectado] = useState(false);

  const [asamblea, setAsamblea] = useState({
    turnos: [],
    historial: [],
    tema: "",
    turnoAbierto: true,
  });

  const [tiempo, setTiempo] = useState(0);

  useEffect(() => {
    socket.on("estadoActualizado", (estado) => {
      setAsamblea(estado);
      setConectado(true);
    });

    socket.on("tiempo", (t) => setTiempo(t));

    socket.emit("pedirUpdate");

    return () => {
      socket.off("estadoActualizado");
      socket.off("tiempo");
    };
  }, []);

  const pedirTurno = (intervencion) => {
    const prioridades = {
      "Apunte técnico": 5,
      "Punto de información": 4,
      "Respuesta por alusión directa": 3,
      "Respuesta normal": 2,
      Intervención: 1,
    };

    socket.emit("pedirTurno", {
      nombre: usuario.nombre,
      delegacion: usuario.delegacion,
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

  const cerrarSesion = (e) => {
    e.preventDefault();
    localStorage.removeItem("ceettoken");
    setUsuario(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center w-full gap-7">
      <h1>Vista pública</h1>

      <div>
        <span className="text-gray-400 font-bold font-ceet">
          {usuario.rol !== null
            ? `Has iniciado sesión como: ${usuario.nombre} - ${usuario.delegacion}`
            : `Has iniciado sesión como: ${usuario.nombre} - ${usuario.delegacion} (${usuario.rol})`}
        </span>
      </div>

      <div className="w-full py-4 flex flex-col justify-center overflow-hidden">
        <div className="py-4 bg-ceet text-white">
          <h2 className="gap-2 text-white font-ceet pl-4 animate-pulse">
            Ahora hablando sobre...
          </h2>
          <div className="w-full overflow-hidden mt-1 @container gap-2">
            <h3 className="text-4xl font-bold text-white font-ceet whitespace-nowrap inline-block animate-reveal w-max pl-4 pr-4">
              {asamblea.tema || "Sin tema seleccionado"}
            </h3>
          </div>
        </div>

        <h2 className="py-2 text-ceet font-ceet pl-4">
          Descargar la documentación de este punto
        </h2>
      </div>

      <br />

      <div>
        <h2>Turnos</h2>

        <div>
          <span>
            {asamblea.turnoAbierto ? (
              <>
                <button
                  type="button"
                  onClick={() => pedirTurno("Apunte técnico")}
                >
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
                <button
                  type="button"
                  onClick={() => pedirTurno("Respuesta normal")}
                >
                  Respuesta normal
                </button>
                <button
                  type="button"
                  onClick={() => pedirTurno("Intervención")}
                >
                  Intervención
                </button>
              </>
            ) : (
              <span>Turno cerrado (womp womp)</span>
            )}
          </span>
        </div>

        <br />

        <div className="flex flex-col gap-5">
          {asamblea.turnos.map((turno, index) => (
            <div className="flex flex-row" key={turno.id}>
              <div className="flex flex-row gap-5 w-full border border-ceet radius-md">
                <span className="font-semibold text-gray-600 ">
                  {index + 1}.
                </span>
                <span className="font-semibold text-ceet">
                  {turno.nombre} - {turno.delegacion}:
                </span>
                <span className="text-gray-600">{turno.intervencion}</span>
              </div>
              <span className="border border-red-800">
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
          ))}
        </div>
      </div>
      <button
        className="border border-red-800 radius-md"
        type="button"
        onClick={cerrarSesion}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
