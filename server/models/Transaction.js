import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('deposit', 'withdraw'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('pix', 'card'),
    allowNull: false
  },
  gatewayId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gatewayTransactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'transactions'
});

export default Transaction; 