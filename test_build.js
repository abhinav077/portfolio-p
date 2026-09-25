const seg = 35;
const startX = -(seg - 1);
const xCols = Array.from({ length: seg }, (_, i) => startX + i * 2);
console.log(xCols[0], xCols[xCols.length - 1]);
