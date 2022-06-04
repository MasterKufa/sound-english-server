export const consoleBlue = (...args) => {
  console.log('\x1b[34m%s\x1b[0m', ...args);
};
