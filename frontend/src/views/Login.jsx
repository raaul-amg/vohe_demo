import { useEffect, useState } from "react";
import { useAuth } from "../config/Auth";
import { socket } from "../config/socket";

export default function Login() {
  const { usuario, setUsuario } = useAuth();

  const [usuarioTemp, setUsuarioTemp] = useState("");
  const [password, setPassword] = useState("");

  const enviar = (e) => {
    e.preventDefault();
    if (password.trim() === "") return;

    const payload = {
      usuario: usuarioTemp,
      password: password,
    };

    socket.emit("login", payload);
  };

  useEffect(() => {
    socket.on("resLogin", (datos) => {
      if (!datos) {
        alert("Usuario o contraseña incorrectos");
        return;
      }

      localStorage.setItem("ceettoken", datos.token);
      setUsuario(datos.userData);
    });

    return () => {
      socket.off("resLogin");
    };
  }, [setUsuario]);

  return (
    <div className="bg-ceet min-h-screen w-full flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col gap-6 w-full max-w-md">
        <h2 className="text-2xl text-ceet font-ceet font-bold text-center">
          Inicio de sesión
        </h2>
        <form className="flex flex-col gap-3" onSubmit={enviar}>
          <input
            className="h-9 border border-ceet w-full text-ceet font-ceet text-center gap-5 rounded-md"
            type="text"
            placeholder="Usuario"
            value={usuarioTemp}
            onChange={(e) => setUsuarioTemp(e.target.value)}
          />
          <input
            className="h-9 border border-ceet w-full text-ceet font-ceet text-center gap-5 rounded-md"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="h-9 border border-ceet w-full bg-ceet text-white font-ceet text-center gap-5 rounded-md transform active:scale-95 transition-transform"
            type="submit"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
