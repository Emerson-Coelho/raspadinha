import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sequelize from '../config/database.js';

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
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
  role: {
    type: DataTypes.ENUM('admin', 'super_admin'),
    defaultValue: 'admin'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'admins',
  timestamps: true
});

// Hook para criptografar senha antes de salvar
Admin.beforeCreate(async (admin) => {
  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(admin.password, salt);
});

Admin.beforeUpdate(async (admin) => {
  if (admin.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
  }
});

// Método para verificar se a senha está correta
Admin.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para gerar e retornar um JWT
Admin.prototype.getSignedJwtToken = function() {
  const payload = { id: this.id, role: this.role };
  const secret = process.env.JWT_SECRET || 'admin_secret_key';
  const options = { expiresIn: process.env.JWT_EXPIRE || '7d' };
  
  console.log('Gerando token JWT para admin:', this.id);
  console.log('Payload:', payload);
  console.log('Secret:', secret);
  console.log('Options:', options);
  
  const token = jwt.sign(payload, secret, options);
  console.log('Token gerado:', token.substring(0, 20) + '...');
  
  return token;
};

export default Admin; 