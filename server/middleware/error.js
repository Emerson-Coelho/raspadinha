import ErrorResponse from '../utils/errorResponse.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log para o console para desenvolvimento
  console.log(err.stack);

  // Sequelize erro de validação
  if (err.name === 'SequelizeValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  // Sequelize erro de chave única
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Valor duplicado inserido';
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erro no servidor'
  });
};

export default errorHandler; 