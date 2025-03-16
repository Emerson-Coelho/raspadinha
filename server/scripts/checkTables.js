import sequelize from '../config/database.js';

async function checkTables() {
  try {
    console.log('Verificando tabelas no banco de dados...');
    
    // Consultar todas as tabelas no schema public
    const [tables] = await sequelize.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Tabelas encontradas:');
    tables.forEach(table => {
      console.log(`- ${table.table_name} (schema: ${table.table_schema})`);
    });
    
    // Verificar especificamente a tabela 'users'
    const userTable = tables.find(t => t.table_name === 'users');
    if (userTable) {
      console.log('\nTabela "users" encontrada!');
      
      // Verificar a estrutura da tabela users
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);
      
      console.log('\nEstrutura da tabela "users":');
      columns.forEach(column => {
        console.log(`- ${column.column_name} (${column.data_type}, ${column.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
      // Verificar se há registros na tabela
      const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM users`);
      console.log(`\nTotal de registros na tabela "users": ${countResult[0].count}`);
      
      if (parseInt(countResult[0].count) > 0) {
        // Mostrar alguns registros de exemplo
        const [sampleUsers] = await sequelize.query(`
          SELECT id, name, email, role, status
          FROM users
          LIMIT 5
        `);
        
        console.log('\nExemplos de usuários:');
        sampleUsers.forEach(user => {
          console.log(`- ${user.name} (${user.email}), role: ${user.role}, status: ${user.status}`);
        });
      }
    } else {
      console.log('\nTabela "users" NÃO encontrada!');
    }
    
    // Verificar se há tabelas com nomes similares que possam conter usuários
    const userRelatedTables = tables.filter(t => 
      t.table_name.toLowerCase().includes('user') || 
      t.table_name.toLowerCase().includes('usuario')
    );
    
    if (userRelatedTables.length > 0 && !userTable) {
      console.log('\nTabelas relacionadas a usuários encontradas:');
      userRelatedTables.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error);
  } finally {
    process.exit(0);
  }
}

checkTables(); 