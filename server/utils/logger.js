import SystemLog from '../models/SystemLog.js';

/**
 * Serviço para registrar logs do sistema
 */
class Logger {
  /**
   * Registra um log de erro
   * @param {string} source - Origem do erro (gateway, auth, etc)
   * @param {string} message - Mensagem de erro
   * @param {Object} details - Detalhes adicionais
   * @param {string} userId - ID do usuário relacionado (opcional)
   * @param {string} adminId - ID do administrador relacionado (opcional)
   * @returns {Promise<SystemLog>} - O log criado
   */
  static async error(source, message, details = {}, userId = null, adminId = null) {
    try {
      const log = await SystemLog.create({
        type: 'error',
        source,
        message,
        details,
        userId,
        adminId
      });
      
      console.error(`[ERRO][${source}] ${message}`, details);
      
      return log;
    } catch (err) {
      console.error('Erro ao registrar log de erro:', err);
      return null;
    }
  }
  
  /**
   * Registra um log de aviso
   * @param {string} source - Origem do aviso
   * @param {string} message - Mensagem de aviso
   * @param {Object} details - Detalhes adicionais
   * @param {string} userId - ID do usuário relacionado (opcional)
   * @param {string} adminId - ID do administrador relacionado (opcional)
   * @returns {Promise<SystemLog>} - O log criado
   */
  static async warning(source, message, details = {}, userId = null, adminId = null) {
    try {
      const log = await SystemLog.create({
        type: 'warning',
        source,
        message,
        details,
        userId,
        adminId
      });
      
      console.warn(`[AVISO][${source}] ${message}`, details);
      
      return log;
    } catch (err) {
      console.error('Erro ao registrar log de aviso:', err);
      return null;
    }
  }
  
  /**
   * Registra um log informativo
   * @param {string} source - Origem da informação
   * @param {string} message - Mensagem informativa
   * @param {Object} details - Detalhes adicionais
   * @param {string} userId - ID do usuário relacionado (opcional)
   * @param {string} adminId - ID do administrador relacionado (opcional)
   * @returns {Promise<SystemLog>} - O log criado
   */
  static async info(source, message, details = {}, userId = null, adminId = null) {
    try {
      const log = await SystemLog.create({
        type: 'info',
        source,
        message,
        details,
        userId,
        adminId
      });
      
      console.info(`[INFO][${source}] ${message}`);
      
      return log;
    } catch (err) {
      console.error('Erro ao registrar log informativo:', err);
      return null;
    }
  }
  
  /**
   * Marca um log como resolvido
   * @param {string} logId - ID do log
   * @param {string} adminId - ID do administrador que resolveu
   * @param {string} notes - Notas sobre a resolução
   * @returns {Promise<SystemLog>} - O log atualizado
   */
  static async resolve(logId, adminId, notes = '') {
    try {
      const log = await SystemLog.findByPk(logId);
      
      if (!log) {
        throw new Error(`Log com ID ${logId} não encontrado`);
      }
      
      await log.update({
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: adminId,
        resolutionNotes: notes
      });
      
      return log;
    } catch (err) {
      console.error('Erro ao marcar log como resolvido:', err);
      return null;
    }
  }
}

export default Logger; 