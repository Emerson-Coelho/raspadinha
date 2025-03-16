// Middleware para lidar com funções assíncronas e evitar try/catch repetitivos
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler; 