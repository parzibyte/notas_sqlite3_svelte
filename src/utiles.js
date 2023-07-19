export const debounce = (callback, wait) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      callback(...args);
    }, wait);
  };
};
const formateador = new Intl.DateTimeFormat("es-MX", { dateStyle: 'medium', timeStyle: 'medium' });
export const milisegundosComoFecha = (milisegundos) => {
  if (!milisegundos) {
    return "";
  }
  return formateador.format(new Date(milisegundos));
};