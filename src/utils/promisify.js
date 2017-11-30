function promisify() {
  let args = Array.prototype.slice.call(arguments);
  const boundArgs = [];
  args[0].forEach(v => boundArgs.push(v));
  const func = boundArgs[0];
  boundArgs.splice(0, 1);
  args.splice(0, 1);
  args = [...boundArgs, ...args];
  return new Promise((resolve, reject) => {
    func(...args, (e, d) => {
      if (e)
        reject(e);
      resolve(d);
    });
  });
}

module.exports = function () {
  const args = Array.prototype.slice.call(arguments);
  return promisify.bind(this, args);
};
