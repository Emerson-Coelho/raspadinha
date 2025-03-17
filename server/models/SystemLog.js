import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SystemLog = sequelize.define('SystemLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('error', 'warning', 'info'),
    allowNull: false,
    defaultValue: 'info'
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Origem do log (gateway, auth, etc)'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Detalhes adicionais em formato JSON'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID do usuário relacionado, se aplicável'
  },
  adminId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID do administrador relacionado, se aplicável'
  },
  resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indica se o problema foi resolvido'
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID do administrador que resolveu o problema'
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'system_logs'
});

export default SystemLog; 