module.exports.clamp = (n, min, max) => {
  return Math.min(Math.max(n, min), max)
}
