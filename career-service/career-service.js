const fs = require("node:fs/promises");

const readSchedules = async (path) => {
  const schedules = await fs.readFile(path, "utf8");
  return JSON.parse(schedules);
};

const getSchedules = async ({ path }) => {
  const schedules = await readSchedules(path);
  let schedulesFormat = [];
  Object.keys(schedules).forEach((nivel) => {
    const materiasPensum = schedules[nivel];
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
    schedulesFormat.push({
      nombreNivel: nivel,
      materias,
    });
  });
  return { schedulesFormat };
};

const getPensum = ({ schedules }) => {
  let levels = [];
  schedules.forEach((nivel, index) => {
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
  return { levels };
};

async function getSchedulesAndPensum(path) {
  let { schedulesFormat } = await getSchedules({ path });

  let { levels } = getPensum({ schedules: schedulesFormat });

  return {
    levels,
    schedules: schedulesFormat,
  };
}

module.exports = {
  getSchedulesAndPensum,
};
