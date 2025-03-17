import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { encrypt, decrypt } from '../utils/encryption.js';

const PaymentGateway = sequelize.define('PaymentGateway', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  publicKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('publicKey');
      return value ? decrypt(value) : null;
    },
    set(value) {
      if (value) {
        this.setDataValue('publicKey', encrypt(value));
      } else {
        this.setDataValue('publicKey', null);
      }
    }
  },
  secretKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('secretKey');
      return value ? decrypt(value) : null;
    },
    set(value) {
      if (value) {
        this.setDataValue('secretKey', encrypt(value));
      } else {
        this.setDataValue('secretKey', null);
      }
    }
  },
  forDeposit: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  forWithdraw: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'payment_gateways'
});

// Método para converter para JSON com formato adequado para o frontend
PaymentGateway.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Formatar para o formato esperado pelo frontend
  return {
    id: values.id,
    name: values.name,
    description: values.description || '',
    logo: values.logo || '',
    isActive: values.isActive,
    apiKeys: {
      publicKey: values.publicKey || '',
      secretKey: values.secretKey || ''
    },
    usageConfig: {
      forDeposit: values.forDeposit,
      forWithdraw: values.forWithdraw
    },
    createdAt: values.createdAt,
    updatedAt: values.updatedAt
  };
};

export default PaymentGateway; 