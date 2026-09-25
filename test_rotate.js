const rotationRef = { current: { x: 0, y: 0 } };
const delta = (16.66 * 0.03) / 16.66;
const wrapAngleSigned = (deg) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
rotationRef.current.y = wrapAngleSigned(rotationRef.current.y - delta);
console.log(rotationRef.current);
