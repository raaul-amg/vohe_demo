import { useState, useEffect } from "react";
import { useAuth } from "../config/Auth";
import { socket } from "../config/socket";
import { Dialog } from "@headlessui/react";

export default function Admin() {
  const { usuario, setUsuario } = useAuth();

  const [tema, setTema] = useState("");
  const [nombre, setNombre] = useState("");
  const [delegacion, setDelegacion] = useState("");
  const [minutos, setMinutos] = useState(3);
  const [tiempo, setTiempo] = useState(0);

  const [conectado, setConectado] = useState(false);

  const [asamblea, setAsamblea] = useState({
    turnos: [],
    historial: [],
    tema: "",
    turnoAbierto: true,
  });

  const odd = [
    {
      titulo: "1. Aprobación, si procede, del orden del día.",
      archivo: "/1.ODD.pdf",
    },
    {
      titulo:
        "2. Aprobación, si procede, del acta de la asamblea general anterior.",
      archivo: " ",
    },
    {
      titulo: "3. Lectura y puesta en conocimiento de documentación relevante.",
      archivo: "/3.Dimision_A.Espada.pdf",
    },
    {
      titulo:
        "4. Ratificación, si procede, del nuevo modelo de acreditaciones.",
      archivo: "/4.AcreditacionRepresentatividad.pdf",
    },
    {
      titulo:
        "5. Punto de información sobre el estado de las cuentas de la asociación.",
      archivo: " ",
    },
    {
      titulo: "6. Informe de la Presidencia",
      archivo: "/6.InformePresidencia.pdf",
    },
  ];

  const representantes = [
    { nombre: "Olga", delegacion: "UPV" },
    { nombre: "David", delegacion: "Secretaría" },
    { nombre: "Susi", delegacion: "UC3M" },
    { nombre: "Marcos", delegacion: "UEx" },
    { nombre: "José Antonio", delegacion: "UEx" },
    { nombre: "Julio", delegacion: "UC" },
    { nombre: "Vera", delegacion: "UPV" },
    { nombre: "Raúl", delegacion: "UPM" },
  ];

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

  const cambiarTema = (e) => {
    e.preventDefault();
    if (!tema.trim()) return;

    socket.emit("actualizarTema", {
      tema: tema,
      archivo: null,
    });

    setTema("");
    toggleOpen("tema");
  };

  const filtroRepresentante = (e) => {
    let representante = e.split(" - ");
    setNombre(representante[0]);
    setDelegacion(representante[1]);
  };

  const agregarTurno = (intervencion) => {
    if (!nombre.trim() || !delegacion.trim())
      return alert("Falta nombre o delegación");

    const prioridades = {
      "Apunte técnico": 5,
      "Punto de información": 4,
      "Respuesta por alusión directa": 3,
      "Respuesta normal": 2,
      Intervención: 1,
    };

    socket.emit("agregarTurno", {
      tema: tema,
      nombre: nombre,
      delegacion: delegacion,
      intervencion: intervencion,
      prioridad: prioridades[intervencion],
      minutos: minutos,
      solicitud: false,
      // que hay de los demás atributos???
    });

    setNombre("");
    setDelegacion("");
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const cerrarSesion = (e) => {
    e.preventDefault();
    localStorage.removeItem("ceettoken");
    setUsuario(null);
  };

  const exportarHistorial = () => {
    // a ver como lo hacemos...
  };

  const [isOpen, setIsOpen] = useState({
    tema: false,
    tiempo: false,
    turnoManual: false,
  });

  const toggleOpen = (id) => {
    setIsOpen((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col justify-top items-center w-fulls py-4 gap-2">
      <div className="w-full flex-row justify-between px-4 grid grid-cols-7">
        <span className="text-gray-400 font-bold font-ceet py-2 col-span-6 justify-between items-center">
          {usuario.rol !== null
            ? `Has iniciado sesión como: ${usuario.nombre} - ${usuario.delegacion}`
            : `Has iniciado sesión como: ${usuario.nombre} - ${usuario.delegacion} (${usuario.rol})`}
        </span>
        <button
          className="border font-ceet text-white border-red-700 bg-red-700 rounded-md col-span-1 transform active:scale-95 transition-transform"
          type="button"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>
      </div>

      <div className="flex-row gap-3 grid grid-cols-3 px-4">
        <button
          className="col-span-1 border border-ceet font-ceet bg-ceet text-white h-12 rounded-md font-bold"
          type="button"
          onClick={() => {
            toggleOpen("tema");
          }}
        >
          Cambiar tema
        </button>

        <button
          type="button"
          className="col-span-1 border border-ceet font-ceet bg-ceet text-white h-12 rounded-md font-bold"
          onClick={() => {
            toggleOpen("tiempo");
          }}
        >
          Cambiar tiempo
        </button>

        <button
          type="button"
          className="col-span-1 border border-ceet font-ceet bg-ceet text-white h-12 rounded-md font-bold"
          onClick={() => {
            toggleOpen("turnoManual");
          }}
        >
          Añadir un turno manualmente
        </button>
      </div>

      {/* <Transition show={isOpen} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0" enterTo="transform scale-100 opacity-100" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100" leaveTo="transform scale-95 opacity-0" as={Fragment}> */}

      <Dialog
        open={isOpen["tema"]}
        onClose={() => toggleOpen("tema")}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white">
            <form onSubmit={(e) => {
              cambiarTema(e);
            }}>
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
                {odd.map((t, i) => (
                  <option key={i} value={t.titulo} />
                ))}
              </datalist>
              <div className="mt-4 flex justify-end gap-2">
                      <button type="button" onClick={() => toggleOpen("tema")} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
                      <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-ceet rounded-md hover:bg-blue-600">Guardar</button>
                    </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
      {/* </Transition> */}

      <div className={isOpen["tiempo"] ? "" : "hidden"}>
        <form>
          <select id="min" onChange={(e) => setMinutos(e.target.value)}>
            <option value="null">Sin duración</option>
            <option value="1">1 min</option>
            <option value="2">2 min</option>
            <option value="3">3 min</option>
            <option value="4">4 min</option>
            <option value="5" selected="selected">
              5 min
            </option>
          </select>

          <button type="submit">Enviar</button>
        </form>
      </div>

      <div className={isOpen["turnoManual"] ? "" : "hidden"}>
        <form>
          <h3>Agregar manualmente a un representante</h3>
          <input
            type="text"
            list="listaRepresentantes"
            onChange={(e) => filtroRepresentante(e.target.value)}
            placeholder="Representante"
          />
          <datalist id="listaRepresentantes">
            {representantes.map((r, i) => (
              <option key={i} value={`${r.nombre} - ${r.delegacion}`} />
            ))}
          </datalist>

          <br />

          <select
            value={minutos}
            onChange={(e) => setMinutos(Number(e.target.value))}
          >
            <option value="null">Sin duración</option>
            <option value="1">1 min</option>
            <option value="2">2 min</option>
            <option value="3">3 min</option>
            <option value="4">4 min</option>
            <option value="5">5 min</option>
          </select>

          <br />

          <button type="reset" onClick={() => agregarTurno("Apunte técnico")}>
            Apunte técnico
          </button>
          <button
            type="reset"
            onClick={() => agregarTurno("Punto de información")}
          >
            Punto de información
          </button>
          <button
            type="reset"
            onClick={() => agregarTurno("Respuesta por alusión directa")}
          >
            Respuesta por alusión directa
          </button>
          <button type="reset" onClick={() => agregarTurno("Respuesta normal")}>
            Respuesta normal
          </button>
          <button type="reset" onClick={() => agregarTurno("Intervención")}>
            Intervención
          </button>
        </form>
      </div>

      <h2>Turnos</h2>

      <div>
        <span>
          {asamblea.turnoAbierto ? (
            <button type="button" onClick={() => socket.emit("cerrarTurno")}>
              Cerrar Turno
            </button>
          ) : (
            <button type="button" onClick={() => socket.emit("abrirTurno")}>
              Abrir Turno
            </button>
          )}
        </span>
      </div>

      <div className="flex flex-col gap-5 p-4 w-full">
        {asamblea.turnos.map((turno, index) => (
          <div className="flex flex-row w-full gap-1" key={turno.id}>
            <div className="grid grid-cols-7 gap-3 w-full h-10 justify-between items-center">
              <div className="h-full flex flex-col justify-center items-center font-semibold bg-ceet text-white border border-ceet col-span-1">
                {index + 1}.
              </div>
              <div className="h-full flex flex-col justify-center items-center font-ceet text-ceet font-bold border border-ceet col-span-2">
                {turno.nombre} - {turno.delegacion}
              </div>
              <div className="h-full flex flex-col justify-center items-center font-ceet text-ceet border border-ceet col-span-3">
                {turno.intervencion}
              </div>
              <button
                className="col-span-1"
                type="button"
                onClick={() => socket.emit("eliminarTurno", turno.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={cerrarSesion}>
        Cerrar sesión
      </button>
    </div>
  );
}
