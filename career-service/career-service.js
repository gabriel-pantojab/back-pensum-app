const fs = require("fs");

const readSchedules = (path) => {
  const pensum = fs.readFileSync(path, "utf8");
  return JSON.parse(pensum);
};

function getSchedulesAndPensum(path) {
  const pensum = readSchedules(path);
  let pensumFormat = [];
  Object.keys(pensum).forEach((nivel) => {
    const materiasPensum = pensum[nivel];
    let materias = [];
    materiasPensum.forEach((materia) => {
      const grupos = materia.grupos.map((grupo) => {
        if (Object.keys(grupo.titular).length === 0) {
          return {
            ...grupo,
            titular: {
              empty: true,
            },
          };
        }
        if (Object.keys(grupo.auxiliar).length === 0) {
          return {
            ...grupo,
            auxiliar: {
              empty: true,
            },
          };
        }
        return grupo;
      });
      materias.push({
        sis: materia.sis,
        nombreMateria: materia.nombre,
        grupos,
      });
    });
    pensumFormat.push({
      nombreNivel: nivel,
      materias,
    });
  });
  let levels = [];
  pensumFormat.forEach((nivel, index) => {
    const nameNivel = nivel.nombreNivel;
    const idNivel = index + 1;
    const materias = nivel.materias;
    let subjects = [];
    materias.forEach((materia, i) => {
      const nameMateria = materia.nombreMateria;
      const idMateria = i + 1;
      subjects.push({
        id: idMateria,
        name: nameMateria,
        state: "No Cursada",
      });
    });
    levels.push({
      id: idNivel,
      name: nameNivel,
      subjects,
    });
  });
  return {
    levels,
    schedules: pensumFormat,
  };
}

module.exports = {
  getSchedulesAndPensum,
};
