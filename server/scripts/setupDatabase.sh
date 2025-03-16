#!/bin/bash

# Script para configurar o banco de dados antes de criar os usuários

# Diretório do projeto
PROJECT_DIR="/Users/adm/Documents/node/raspadinha"
TABLE_SCRIPT_PATH="server/scripts/createUsersTable.js"

echo "Configurando banco de dados..."
echo "Criando tabela de usuários..."

node "$PROJECT_DIR/$TABLE_SCRIPT_PATH"

if [ $? -eq 0 ]; then
    echo "Configuração do banco de dados concluída com sucesso!"
    echo "Agora você pode executar o script de criação de usuários:"
    echo "  ./testCreateUsers.sh    # Para testar com 10 usuários"
    echo "  ./runCreateUsers.sh     # Para criar 300.000 usuários"
else
    echo "Erro ao configurar o banco de dados."
    exit 1
fi

exit 0 