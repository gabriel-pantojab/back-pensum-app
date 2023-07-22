const {
  agregarCarrera,
  crearHorariosCarrera,
  crearNivelesCarrera,
} = require("./db");

async function subirCarrera({
  carrera,
  sis,
  totalMaterias,
  totalNiveles,
  horarios,
  levels,
}) {
  await agregarCarrera({
    sis,
    nombre: carrera,
    totalMaterias,
    totalNiveles,
  });

  await crearHorariosCarrera({
    sis,
    horarios,
  });

  await crearNivelesCarrera({
    sis,
    niveles: levels,
  });
}

module.exports = {
  subirCarrera,
};
