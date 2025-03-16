import User from '../models/User.js';
import { Op } from 'sequelize';

// @desc    Obter todos os usuários com paginação e filtros
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    // Parâmetros de paginação
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Parâmetros de ordenação
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Construir filtros
    const filters = {};
    
    // Filtro por nome
    if (req.query.name) {
      filters.name = { [Op.iLike]: `%${req.query.name}%` };
    }
    
    // Filtro por email
    if (req.query.email) {
      filters.email = { [Op.iLike]: `%${req.query.email}%` };
    }
    
    // Filtro por CPF
    if (req.query.cpf) {
      filters.cpf = { [Op.iLike]: `%${req.query.cpf}%` };
    }
    
    // Filtro por telefone
    if (req.query.phone) {
      filters.phone = { [Op.iLike]: `%${req.query.phone}%` };
    }
    
    // Filtro por papel (role)
    if (req.query.role) {
      filters.role = req.query.role;
    }
    
    // Filtro por status
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    // Filtro por saldo (maior que)
    if (req.query.minBalance) {
      filters.balance = { ...filters.balance, [Op.gte]: parseFloat(req.query.minBalance) };
    }
    
    // Filtro por saldo (menor que)
    if (req.query.maxBalance) {
      filters.balance = { ...filters.balance, [Op.lte]: parseFloat(req.query.maxBalance) };
    }
    
    // Filtro por data de criação (a partir de)
    if (req.query.createdAfter) {
      filters.createdAt = { ...filters.createdAt, [Op.gte]: new Date(req.query.createdAfter) };
    }
    
    // Filtro por data de criação (até)
    if (req.query.createdBefore) {
      filters.createdAt = { ...filters.createdAt, [Op.lte]: new Date(req.query.createdBefore) };
    }
    
    // Filtro por último login (a partir de)
    if (req.query.lastLoginAfter) {
      filters.lastLogin = { ...filters.lastLogin, [Op.gte]: new Date(req.query.lastLoginAfter) };
    }
    
    // Filtro por último login (até)
    if (req.query.lastLoginBefore) {
      filters.lastLogin = { ...filters.lastLogin, [Op.lte]: new Date(req.query.lastLoginBefore) };
    }

    // Buscar usuários com paginação e filtros
    const { count, rows: users } = await User.findAndCountAll({
      where: filters,
      order: [[sortField, sortOrder]],
      limit,
      offset,
      attributes: { exclude: ['password'] } // Excluir senha dos resultados
    });

    // Calcular total de páginas
    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      count,
      totalPages,
      currentPage: page,
      users
    });
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter usuários',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obter um usuário pelo ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Atualizar um usuário
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Campos permitidos para atualização
    const { name, email, cpf, phone, role, status, balance } = req.body;

    // Atualizar campos
    if (name) user.name = name;
    if (email) user.email = email;
    if (cpf) user.cpf = cpf;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (status) user.status = status;
    if (balance !== undefined) user.balance = balance;

    await user.save();

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
        balance: user.balance,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Excluir um usuário
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Alterar a senha de um usuário
// @route   PUT /api/admin/users/:id/change-password
// @access  Private/Admin
export const changeUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A nova senha deve ter pelo menos 6 caracteres'
      });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar senha',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 