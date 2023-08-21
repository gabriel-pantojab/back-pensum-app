require("dotenv").config();
const {
  generateSchedulesCareer,
} = require("./career-service/generateSchedulesCareer");
const { getSchedulesAndPensum } = require("./career-service/career-service");
const { subirCarrera } = require("./firebase/main");
const { actualizarHorariosCarrera } = require("./firebase/db");

const gestion = "II-2023";
const nameFilePDF = "320902";
const nameCareer = "LICENCIATURA EN INGENIERÍA CIVIL (NUEVO)";
const sisCareer = "320902";
const totalMaterias = 70;
const totalNiveles = 10;

const PATH_PDF = `./schedules-pdf/${gestion}/${nameFilePDF}.pdf`;

async function uploadCaeer() {
  try {
    const { nameFileJson } = await generateSchedulesCareer({
      pathPDF: PATH_PDF,
      gestion,
    });

    const { levels, schedules } = await getSchedulesAndPensum(
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

async function updateSchedulesCareer(path_pdf = PATH_PDF) {
  try {
    const { nameFileJson } = await generateSchedulesCareer({
      pathPDF: PATH_PDF,
      gestion,
    });

    const { schedules } = await getSchedulesAndPensum(
      `./careers-datas-json/${gestion}/${nameFileJson}.json`
    );

    const res = await actualizarHorariosCarrera({
      sis: sisCareer,
      horarios: schedules,
    });
    return res;
  } catch (error) {
    console.log(error);
  }
}
