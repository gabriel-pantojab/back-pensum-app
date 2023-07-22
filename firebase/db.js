const { ref, update } = require("firebase/database");

async function agregarCarrera({ sis, nombre, totalMateias, totalNiveles }) {
  try {
    return update(ref(database, "carreras/"), {
      [sis]: {
        nombre,
        totalMateias,
        totalNiveles,
      },
    });
  } catch (error) {
    console.log(error);
  }
}

async function crearHorariosCarrera({ sis, horarios }) {
  try {
    update(ref(database, "carreras/" + sis), {
      horarios,
    });
  } catch (error) {
    console.log(error);
  }
}

async function crearNivelesCarrera({ sis, niveles }) {
  try {
    update(ref(database, "carreras/" + sis), {
      niveles,
    });
  } catch (error) {
    console.log(error);
  }
}

function actualizarInfoCarrera({ sis, info }) {
  try {
    update(ref(database, "carreras/" + sis), {
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
};
