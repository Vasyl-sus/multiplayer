const formatNDigits = (num, n) => {
  return num?.toLocaleString("en-US", {
    minimumIntegerDigits: n,
    useGrouping: false,
  });
}

const numberOfFaces = 19;
const faces = [];
for (let i = 1; i <= numberOfFaces; i++) {
  const index = formatNDigits(i, 4);
  faces.push(require(`../assets/images/avatars/face${index}.png`));
}

const numberOfTops = 18;
const tops = [];
for (let i = 1; i <= numberOfTops; i++) {
  const index = formatNDigits(i, 4);
  tops.push(require(`../assets/images/avatars/top${index}.png`));
}

const numberOfShapes = 2;
const shapes = [];
for (let i = 1; i <= numberOfShapes; i++) {
  const index = formatNDigits(i, 4);
  shapes.push(require(`../assets/images/avatars/shape${index}.png`));
}

export {
  faces,
  tops,
  shapes,
}