require("dotenv").config();

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const mariadb = require('mariadb')
const path = require('path')
const cors = require('cors')

const app = express()

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend/dist')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'))
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 20,
  connectTimeout: 10000,
  ssl: { rejectUnauthorized: false },
});

let asamblea = {
  hablando: null,
  timerActivo: false,
  tema: '',
  turnoAbierto: true,
};

io.on("connection", async (socket) => {

  console.log("Client connected (yay!)", socket.id);

  const update = async () => {
    const connection = await pool.getConnection();

    try {
      const turnosDB = await connection.query("SELECT * FROM turnos WHERE activo = true ORDER BY prioridad DESC, tiempo_peticion ASC");
      const historialDB = await connection.query("SELECT * FROM historial ORDER BY hora_fin DESC");
      const temaDB = await connection.query("SELECT * FROM tema WHERE activo = true");
      let tema = "Sin tema seleccionado";
      
      const turnos = turnosDB.map(item => ({
        id: item.id,
        nombre: item.nombre,
        delegacion: item.delegacion,
        intervencion: item.intervencion,
        prioridad: item.prioridad,
        solicitud: item.solicitud,
      }))

      if (temaDB && temaDB.length > 0){
        tema = temaDB[0].tema
      }

      io.emit('estado_actualizado', {
        ...asamblea,
        tema: tema,
        turnos: turnos,
        historial: historialDB,
      })
      
    } 
    catch (error) {console.error("Error:", error)} 
    finally {if (connection) connection.release()}

  };

  await update();

  socket.on('pedirUpdate', async () => {
    await update();
  });

  socket.on('actualizarTema', async (datos) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.query("UPDATE tema SET activo = false");

      let check = await connection.query("SELECT COUNT(*) AS existe FROM tema WHERE tema = ?", [datos.tema])

      if (Number(check[0].existe) === 0){
        await connection.query(
          "INSERT INTO tema (tema, archivo, activo) VALUES (?, ?, ?)",
          [datos.tema, datos.archivo, true]
        );
      } else {
        await connection.query("UPDATE tema SET activo = true WHERE tema = ?", [datos.tema])
      }
      
      await update();
    } 

    catch (error){console.error(error);} 
    finally {if (connection) connection.release();}
    
    await update();

  });

  socket.on('agregarTurno', async (datos) => {

    let connection;

    try {
      connection = await pool.getConnection();
      await connection.query(
        "INSERT INTO turnos (nombre, delegacion, intervencion, prioridad, minutos, solicitud) VALUES (?, ?, ?, ?, ?, ?)",
        [datos.nombre, datos.delegacion, datos.intervencion, datos.prioridad, datos.minutos, datos.solicitud]
      );
      await update();
    } 

    catch (error){console.error(error);} 
    finally {if (connection) connection.release();}
    
  });

  socket.on('pedirTurno', async (datos) => {

    let connection;
    
    try {
      connection = await pool.getConnection();
      await connection.query(
        "INSERT INTO turnos (nombre, delegacion, intervencion, prioridad, solicitud) VALUES (?, ?, ?, ?, ?)",
        [datos.nombre, datos.delegacion, datos.intervencion, datos.prioridad, datos.solicitud]
      );
      await update();
    }

    catch (error){console.error(error)}
    finally {if (connection) connection.release();}

  })

  socket.on('cortarTurno', async (datos) => {

    let connection;

    try {
      connection = await pool.getConnection();
      await connection.query(
        "UPDATE turnos SET activo = false WHERE id = ? AND nombre = ? AND delegacion = ?",
        [datos.id, datos.nombre, datos.delegacion]
      );
      await update();
    } 

    catch (error){console.error(error);} 
    finally {if (connection) connection.release();}

  })

  socket.on('eliminarTurno', async (datos) => {

    let connection;

    try {
      connection = await pool.getConnection();
      await connection.query(
        "UPDATE turnos SET activo = false WHERE id = ?", [datos]);
      await update();
    } 

    catch (error){console.error(error);} 
    finally {if (connection) connection.release();}

  })

  socket.on('login', async (datos) => {

    let connection;

    try {
      connection = await pool.getConnection();
      const usuario = datos.usuario;
      const sql = await connection.query("SELECT * FROM usuarios WHERE usuario = ?", [datos.usuario])

      if (sql.length === 0){
        socket.emit('resLogin', false);
        return;
      }

      if (datos.password === sql[0].password){
        socket.emit('resLogin', {
          usuario: sql[0].usuario,
          delegacion: sql[0].delegacion,
          rol: sql[0].rol,
          admin: sql[0].admin,
        })
      } else {
        socket.emit('resLogin', false)
      }
    } 

    catch (error){
      console.error(error);
      socket.emit('resLogin', false)
    } 
    finally {if (connection) connection.release();}

  })

});

const port = process.env.port || 8080;

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log(`http://localhost:${port}`);
})