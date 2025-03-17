import sequelize from '../config/database.js';

async function checkUserTable() {
  try {
    console.log('Verificando tabela de usuários...');
    
    // Verificar se a tabela users existe
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    if (tables.length === 0) {
      console.log('A tabela "users" não existe!');
      return;
    }
    
    console.log('A tabela "users" existe.');
    
    // Verificar a estrutura da tabela
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('\nEstrutura da tabela "users":');
    columns.forEach(column => {
      console.log(`- ${column.column_name} (${column.data_type}, ${column.is_nullable === 'YES' ? 'nullable' : 'not null'}, default: ${column.column_default || 'none'})`);
    });
    
    // Verificar restrições (constraints)
    const [constraints] = await sequelize.query(`
      SELECT c.conname as constraint_name, 
             c.contype as constraint_type,
             pg_get_constraintdef(c.oid) as constraint_definition
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      JOIN pg_class cl ON cl.oid = c.conrelid
      WHERE n.nspname = 'public' AND cl.relname = 'users'
    `);
    
    console.log('\nRestrições da tabela "users":');
    constraints.forEach(constraint => {
      let type = '';
      switch(constraint.constraint_type) {
        case 'p': type = 'PRIMARY KEY'; break;
        case 'u': type = 'UNIQUE'; break;
        case 'f': type = 'FOREIGN KEY'; break;
        case 'c': type = 'CHECK'; break;
        default: type = constraint.constraint_type;
      }
      console.log(`- ${constraint.constraint_name} (${type}): ${constraint.constraint_definition}`);
    });
    
    // Verificar índices
    const [indices] = await sequelize.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'users' AND schemaname = 'public'
    `);
    
    console.log('\nÍndices da tabela "users":');
    indices.forEach(index => {
      console.log(`- ${index.indexname}: ${index.indexdef}`);
    });
    
    // Verificar contagem de registros
    const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM users`);
    console.log(`\nTotal de registros: ${countResult[0].count}`);
    
    // Verificar tipos de dados dos campos role e status
    const [roleTypes] = await sequelize.query(`
      SELECT DISTINCT role FROM users
    `);
    
    console.log('\nValores distintos para "role":');
    roleTypes.forEach(r => console.log(`- ${r.role}`));
    
    const [statusTypes] = await sequelize.query(`
      SELECT DISTINCT status FROM users
    `);
    
    console.log('\nValores distintos para "status":');
    statusTypes.forEach(s => console.log(`- ${s.status}`));
    
    // Verificar se há registros com CPFs duplicados
    const [duplicateCpfs] = await sequelize.query(`
      SELECT cpf, COUNT(*) as count
      FROM users
      GROUP BY cpf
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateCpfs.length > 0) {
      console.log('\nCPFs duplicados encontrados:');
      duplicateCpfs.forEach(d => console.log(`- ${d.cpf}: ${d.count} ocorrências`));
    } else {
      console.log('\nNenhum CPF duplicado encontrado.');
    }
    
    // Verificar se há registros com emails duplicados
    const [duplicateEmails] = await sequelize.query(`
      SELECT email, COUNT(*) as count
      FROM users
      GROUP BY email
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateEmails.length > 0) {
      console.log('\nEmails duplicados encontrados:');
      duplicateEmails.forEach(d => console.log(`- ${d.email}: ${d.count} ocorrências`));
    } else {
      console.log('\nNenhum email duplicado encontrado.');
    }
    
  } catch (error) {
    console.error('Erro ao verificar tabela de usuários:', error);
  } finally {
    process.exit(0);
  }
}

checkUserTable(); 