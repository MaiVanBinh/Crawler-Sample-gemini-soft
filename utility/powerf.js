exports.sleep = () => {
  return new Promise((resolve) => setTimeout(resolve, Math.random()));
}