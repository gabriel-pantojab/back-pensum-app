const fs = require("fs");
const { convertPdfToJson } = require("../pdf-service/pdf-service");

async function generateInfoCareer({ pathPDF, gestion }) {
  const { nameFileJson, content } = await convertPdfToJson(pathPDF);

  fs.writeFileSync(
    `./careers-datas-json/${gestion}/${nameFileJson}.json`,
    JSON.stringify(content)
  );
}

module.exports = {
  generateInfoCareer,
};
