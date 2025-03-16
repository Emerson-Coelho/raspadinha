#!/bin/bash

# Script para testar a criação de um número menor de usuários

# Diretório do projeto
PROJECT_DIR="/Users/adm/Documents/node/raspadinha"
SCRIPT_PATH="server/scripts/createTestUsers.js"

echo "Testando criação de usuários..."
echo "Criando 10 usuários de teste..."

node "$PROJECT_DIR/$SCRIPT_PATH" --count=10

if [ $? -eq 0 ]; then
    echo "Teste concluído com sucesso!"
else
    echo "Erro ao executar o teste."
    exit 1
fi

exit 0 