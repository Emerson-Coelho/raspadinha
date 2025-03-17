import SystemLog from '../models/SystemLog.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import { Op } from 'sequelize';

/**
 * @desc    Obter todos os logs do sistema
 * @route   GET /api/admin/logs
 * @access  Privado (Admin)
 */
export const getLogs = asyncHandler(async (req, res, next) => {
  // Parâmetros de paginação e filtros
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const startIndex = (page - 1) * limit;
  
  // Filtros
  const type = req.query.type; // error, warning, info
  const source = req.query.source; // gateway_deposit, gateway_withdraw, etc.
  const resolved = req.query.resolved === 'true' ? true : (req.query.resolved === 'false' ? false : undefined);
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const search = req.query.search;
  
  // Construir condições de filtro
  const whereConditions = {};
  
  if (type) {
    whereConditions.type = type;
  }
  
  if (source) {
    whereConditions.source = source;
  }
  
  if (resolved !== undefined) {
    whereConditions.resolved = resolved;
  }
  
  // Filtro por data
  if (startDate || endDate) {
    whereConditions.createdAt = {};
    
    if (startDate) {
      whereConditions.createdAt[Op.gte] = new Date(startDate);
    }
    
    if (endDate) {
      whereConditions.createdAt[Op.lte] = new Date(endDate);
    }
  }
  
  // Filtro por texto
  if (search) {
    whereConditions[Op.or] = [
      { message: { [Op.iLike]: `%${search}%` } },
      { 'details.message': { [Op.iLike]: `%${search}%` } }
    ];
  }
  
  // Contar total de logs com os filtros aplicados
  const total = await SystemLog.count({ where: whereConditions });
  
  // Buscar logs com paginação e ordenação
  const logs = await SystemLog.findAll({
    where: whereConditions,
    order: [['createdAt', 'DESC']],
    limit,
    offset: startIndex
  });
  
  // Informações de paginação
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
  
  res.status(200).json({
    success: true,
    pagination,
    data: logs
  });
});

/**
 * @desc    Obter um log específico por ID
 * @route   GET /api/admin/logs/:id
 * @access  Privado (Admin)
 */
export const getLogById = asyncHandler(async (req, res, next) => {
  const log = await SystemLog.findByPk(req.params.id);
  
  if (!log) {
    return next(new ErrorResponse(`Log com ID ${req.params.id} não encontrado`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: log
  });
});

/**
 * @desc    Marcar um log como resolvido
 * @route   PATCH /api/admin/logs/:id/resolve
 * @access  Privado (Admin)
 */
export const resolveLog = asyncHandler(async (req, res, next) => {
  const { notes } = req.body;
  
  const log = await SystemLog.findByPk(req.params.id);
  
  if (!log) {
    return next(new ErrorResponse(`Log com ID ${req.params.id} não encontrado`, 404));
  }
  
  // Atualizar o log
  await log.update({
    resolved: true,
    resolvedAt: new Date(),
    resolvedBy: req.admin.id,
    resolutionNotes: notes || ''
  });
  
  res.status(200).json({
    success: true,
    data: log
  });
});

/**
 * @desc    Obter estatísticas de logs
 * @route   GET /api/admin/logs/stats
 * @access  Privado (Admin)
 */
export const getLogStats = asyncHandler(async (req, res, next) => {
  // Total de logs por tipo
  const typeStats = await SystemLog.findAll({
    attributes: ['type', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['type']
  });
  
  // Total de logs por origem
  const sourceStats = await SystemLog.findAll({
    attributes: ['source', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['source'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
    limit: 10
  });
  
  // Total de logs resolvidos vs não resolvidos
  const resolutionStats = await SystemLog.findAll({
    attributes: ['resolved', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['resolved']
  });
  
  // Logs por dia (últimos 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const dailyStats = await SystemLog.findAll({
    attributes: [
      [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: {
      createdAt: {
        [Op.gte]: thirtyDaysAgo
      }
    },
    group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
    order: [[sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'ASC']]
  });
  
  res.status(200).json({
    success: true,
    data: {
      byType: typeStats,
      bySource: sourceStats,
      byResolution: resolutionStats,
      byDay: dailyStats
    }
  });
});

/**
 * @desc    Excluir logs antigos (mais de 90 dias)
 * @route   DELETE /api/admin/logs/cleanup
 * @access  Privado (Super Admin)
 */
export const cleanupOldLogs = asyncHandler(async (req, res, next) => {
  // Verificar se o usuário é super_admin
  if (req.admin.role !== 'super_admin') {
    return next(new ErrorResponse('Apenas super administradores podem limpar logs antigos', 403));
  }
  
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  // Contar logs a serem excluídos
  const count = await SystemLog.count({
    where: {
      createdAt: {
        [Op.lt]: ninetyDaysAgo
      }
    }
  });
  
  // Excluir logs antigos
  await SystemLog.destroy({
    where: {
      createdAt: {
        [Op.lt]: ninetyDaysAgo
      }
    }
  });
  
  res.status(200).json({
    success: true,
    message: `${count} logs antigos foram excluídos com sucesso.`
  });
}); 