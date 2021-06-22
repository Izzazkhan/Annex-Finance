export function promisify(fn, ...args) {
  // eslint-disable-next-line no-undef
  return new Promise((resolve, reject) => {
    fn.apply(null, [...args, resolve, reject]);
  });
}
