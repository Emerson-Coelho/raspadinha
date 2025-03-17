#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando script para adicionar a coluna apiEndpoint à tabela payment_gateways...${NC}"

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js não está instalado. Por favor, instale o Node.js para continuar.${NC}"
    exit 1
fi

# Verificar se o arquivo .env existe
if [ ! -f "../.env" ]; then
    echo -e "${RED}Arquivo .env não encontrado. Por favor, crie o arquivo .env na raiz do projeto.${NC}"
    exit 1
fi

# Executar o script
echo -e "${YELLOW}Executando script de migração...${NC}"
node addApiEndpointToGateways.js

# Verificar se o script foi executado com sucesso
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Script executado com sucesso!${NC}"
    echo -e "${GREEN}A coluna apiEndpoint foi adicionada à tabela payment_gateways.${NC}"
    exit 0
else
    echo -e "${RED}Erro ao executar o script. Verifique os logs acima.${NC}"
    exit 1
fi 