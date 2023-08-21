const { database } = require("./firebaseConfig");
const { ref, update } = require("firebase/database");

async function agregarCarrera({ sis, nombre, totalMaterias, totalNiveles }) {
  try {
    return await update(ref(database, "carreras/"), {
      [sis]: {
        nombre,
        totalMaterias,
        totalNiveles,
      },
    });
  } catch (error) {
    console.log(error);
  }
}

async function crearHorariosCarrera({ sis, horarios }) {
  try {
    return await update(ref(database, "carreras/" + sis), {
      horarios,
    });
  } catch (error) {
    console.log(error);
  }
}

async function actualizarHorariosCarrera({ sis, horarios }) {
  try {
    return await update(ref(database, "carreras/" + sis), {
      horarios,
    });
  } catch (error) {
    console.log(error);
  }
}

async function crearNivelesCarrera({ sis, niveles }) {
  try {
    return await update(ref(database, "carreras/" + sis), {
      niveles,
    });
  } catch (error) {
    console.log(error);
  }
}

async function actualizarInfoCarrera({ sis, info }) {
  try {
    return await update(ref(database, "carreras/" + sis), {
      ...info,
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  agregarCarrera,
  crearHorariosCarrera,
  crearNivelesCarrera,
  actualizarInfoCarrera,
  actualizarHorariosCarrera,
};
