require("dotenv").config();
const { generateInfoCareer } = require("./career-service/generateInfoCareer");
const { getSchedulesAndPensum } = require("./career-service/career-service");
const { subirCarrera } = require("./firebase/main");

const gestion = "I-2023";
const nameFilePDF = "320902";
const nameCareer = "LICENCIATURA EN INGENIERÍA CIVIL (NUEVO)";
const sisCareer = "320902";
const totalMaterias = 70;
const totalNiveles = 10;

const PATH_PDF = `./schedules-pdf/${gestion}/${nameFilePDF}.pdf`;

async function main() {
  try {
    const { nameFileJson } = await generateInfoCareer({
      pathPDF: PATH_PDF,
      gestion,
    });
    const { levels, schedules } = getSchedulesAndPensum(
      `./careers-datas-json/${gestion}/${nameFileJson}.json`
    );

    const res = await subirCarrera({
      carrera: nameCareer,
      sis: sisCareer,
      totalMaterias,
      totalNiveles,
      horarios: schedules,
      levels,
    });
    console.log(res);
  } catch (error) {
    console.log(error);
  }
}

main();
