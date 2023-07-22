const fs = require("fs");
const PDFJS = require("pdfjs-dist");

let subjectsInfo = [];
let carrera = "";

const readPDF = async (path) => {
  const rawData = new Uint8Array(fs.readFileSync(path));

  const loadingTask = PDFJS.getDocument(rawData);
  const pdfDocument = await loadingTask.promise;

  // Recorrer las páginas del PDF
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const contentPDF = await page.getTextContent();
    const contentWithoutSpaces = contentPDF.items
      .map((item) => item.str.split(" "))
      .map((item) => item.filter((word) => word.length > 0))
      .filter((item) => item.length > 0);

    let temp = [];
    let contentByRows = [];
    let nivelDeEstudios = "";

    contentWithoutSpaces.forEach((item, index) => {
      if (item.includes("Docente")) {
        carrera = getNameCarrera(contentWithoutSpaces, index + 1);
      }
      if (item.includes("Horario") && item.includes("Plan")) {
        nivelDeEstudios = contentWithoutSpaces[index - 1];
      }
      if (
        (!isNaN(item[0]) && item[0].length === 7) ||
        item[0].includes("Si", "Unica")
      ) {
        if (temp.length > 0) {
          contentByRows.push([...temp, ["$nivel:" + nivelDeEstudios]]);
          temp = [];
        }
      }
      temp.push(item);
    });

    const subjectsInPage = contentByRows
      .map((item) => item.join(" ").replace(/,/g, " "))
      .filter((word) => !isNaN(word.substring(0, 8)));
    subjectsInfo = subjectsInfo.concat(subjectsInPage);
  }
  return subjectsInfo;
};

function getNameCarrera(contentWithoutSpaces, index) {
  let carrera = "";
  let i = index;
  while (!contentWithoutSpaces[i][0].includes("(")) {
    carrera += contentWithoutSpaces[i].join(" ").replace(/,/g, " ") + " ";
    i++;
  }
  carrera += contentWithoutSpaces[i].join(" ").replace(/,/g, " ");

  return carrera;
}

// Ejecutar la función de lectura del PDF
async function getPdfToJson(path) {
  const subjectsInfoPDF = await readPDF(path);

  const subjectsInfo = subjectsInfoPDF.map((subjectInfoPDF) =>
    subjectFormat(subjectInfoPDF)
  );
  const subjectsWithoutFormat = {};
  subjectsInfo.forEach((subject) => {
    if (!subjectsWithoutFormat[subject.name]) {
      subjectsWithoutFormat[subject.name] = [subject];
    } else {
      subjectsWithoutFormat[subject.name].push(subject);
    }
  });
  const subjectsFormat = {};
  Object.keys(subjectsWithoutFormat).forEach((key) => {
    let SIS = "",
      nivel = "";
    const groupsWithoutFormat = {};
    const subject = subjectsWithoutFormat[key];
    subject.forEach((group) => {
      SIS = group.sis;
      nivel = group.nivel;
      groupsWithoutFormat[group.group]
        ? groupsWithoutFormat[group.group].push({
            group: group.group,
            day: group.day,
            hour: group.hour,
            teacher: group.teacher,
            classroom: group.classroom,
            auxiliar: group.auxiliar,
          })
        : (groupsWithoutFormat[group.group] = [
            {
              group: group.group,
              day: group.day,
              hour: group.hour,
              teacher: group.teacher,
              classroom: group.classroom,
              auxiliar: group.auxiliar,
            },
          ]);
    });
    let groupsFormat = [];
    Object.keys(groupsWithoutFormat).forEach((key) => {
      const group = groupsWithoutFormat[key];
      const groupFormat = {
        grupo: "",
        titular: {},
        auxiliar: {},
      };
      groupFormat.grupo = group[0].group;
      group.forEach((g) => {
        if (!g.auxiliar) {
          if (groupFormat.titular.docente) {
            groupFormat.titular.horarios.push({
              dia: g.day,
              hora: g.hour,
              aula: g.classroom,
            });
          } else {
            groupFormat.titular.docente = g.teacher;
            groupFormat.titular.horarios = [
              {
                dia: g.day,
                hora: g.hour,
                aula: g.classroom,
              },
            ];
          }
        } else {
          if (groupFormat.auxiliar.nombre) {
            groupFormat.auxiliar.horarios.push({
              dia: g.day,
              hora: g.hour,
              aula: g.classroom,
            });
          } else {
            groupFormat.auxiliar.nombre = g.teacher;
            groupFormat.auxiliar.horarios = [
              {
                dia: g.day,
                hora: g.hour,
                aula: g.classroom,
              },
            ];
          }
        }
      });
      groupsFormat.push(groupFormat);
    });
    if (subjectsFormat[nivel]) {
      subjectsFormat[nivel].push({
        nombre: key,
        sis: SIS,
        nivel,
        grupos: groupsFormat,
      });
    } else {
      subjectsFormat[nivel] = [
        {
          nombre: key,
          sis: SIS,
          nivel,
          grupos: groupsFormat,
        },
      ];
    }
  });
  const nameFileJson = carrera.split(" ").join("");
  return {
    nameFileJson,
    content: subjectsFormat,
  };
}

function isDay(text) {
  const days = ["LU", "MA", "MI", "JU", "VI", "SA"];
  return days.includes(text);
}

function isGroup(pos, textToken) {
  return isDay(textToken[pos + 1]);
}

function getSubjectName(textToken) {
  let subjectName = "";
  for (let i = 0; i < textToken.length; i++) {
    if (isGroup(i, textToken)) {
      break;
    }
    subjectName += textToken[i] + " ";
  }
  return subjectName.trim();
}

function getSchedule(text) {
  const schedule = text.split(/[()]/);
  const time = schedule[0].split("-");
  return {
    hour: formatHour(time[0]) + "-" + formatHour(time[1]),
    classroom: schedule[1],
  };
}

//815 -> 8:15
// 1330 -> 13:30
function formatHour(text) {
  let hour = text.substring(0, 2);
  let min = text.substring(2, text.length);
  if (hour > 24) {
    hour = text.substring(0, 1);
    min = text.substring(1, text.length);
  }
  return `${hour}:${min}`;
}

function subjectFormat(subjectInfoPDF) {
  let textToken = subjectInfoPDF.split(" ");
  const sis = textToken[0];
  const name = getSubjectName(textToken.slice(1));
  textToken = textToken.slice(name.split(" ").length + 1);

  const group = textToken[0];
  const day = textToken[1];
  const { hour, classroom } = getSchedule(textToken[2]);
  const teacherToken = textToken.slice(3, textToken.length - 1);
  const teacher = teacherToken[teacherToken.length - 1].includes("*")
    ? teacherToken.slice(0, teacherToken.length - 1).join(" ")
    : teacherToken.slice(0).join(" ");
  const auxiliar = teacherToken[teacherToken.length - 1].includes("*");
  const nivel = textToken[textToken.length - 1].split(":")[1];
  return { sis, name, group, day, teacher, auxiliar, hour, classroom, nivel };
}

module.exports = {
  getPdfToJson,
};
