import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Por favor, forneça um nome' }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Por favor, forneça um email válido' }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: { args: [6, 100], msg: 'Senha deve ter pelo menos 6 caracteres' }
    }
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Por favor, forneça um CPF' }
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Por favor, forneça um número de telefone' }
    }
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'vip'),
    defaultValue: 'user'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true
});

// Hook para criptografar senha antes de salvar
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Método para verificar se a senha está correta
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para gerar e retornar um JWT
User.prototype.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this.id, role: this.role },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: process.env.JWT_EXPIRATION || '1h' }
  );
};

// Método para gerar e retornar um token de atualização
User.prototype.getRefreshToken = function() {
  return jwt.sign(
    { id: this.id },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
  );
};

export default User; 