const fs = require("node:fs/promises");
const { convertPdfToJson } = require("../pdf-service/pdf-service");

async function generateInfoCareer({ pathPDF, gestion }) {
  try {
    const { nameFileJson, content } = await convertPdfToJson(pathPDF);

    await fs.writeFile(
      `./careers-datas-json/${gestion}/${nameFileJson}.json`,
      JSON.stringify(content)
    );

    return {
      nameFileJson,
    };
  } catch (error) {
    console.log("Error in generateInfoCareer: ", error);
  }
}

module.exports = {
  generateInfoCareer,
};
