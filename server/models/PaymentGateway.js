import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

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
  apiEndpoint: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'https://app.unifypay.co'
  },
  publicKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      return this.getDataValue('publicKey');
    },
    set(value) {
      this.setDataValue('publicKey', value);
    }
  },
  secretKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      return this.getDataValue('secretKey');
    },
    set(value) {
      this.setDataValue('secretKey', value);
    }
  },
  forDeposit: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  forWithdraw: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  allowPix: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  allowCard: {
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
    apiEndpoint: values.apiEndpoint || 'https://app.unifypay.co',
    apiKeys: {
      publicKey: values.publicKey || '',
      secretKey: values.secretKey || ''
    },
    usageConfig: {
      forDeposit: values.forDeposit,
      forWithdraw: values.forWithdraw
    },
    paymentMethods: {
      allowPix: values.allowPix,
      allowCard: values.allowCard
    },
    createdAt: values.createdAt,
    updatedAt: values.updatedAt
  };
};

export default PaymentGateway; 