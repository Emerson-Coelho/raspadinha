#!/bin/bash

# Script para executar a criação de usuários em lotes

# Diretório do projeto
PROJECT_DIR="/Users/adm/Documents/node/raspadinha"
SCRIPT_PATH="server/scripts/createTestUsers.js"

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "Node.js não está instalado. Por favor, instale o Node.js para continuar."
    exit 1
fi

# Verificar argumentos
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo "Uso: $0 [opções]"
    echo "Opções:"
    echo "  --count=N     Número de usuários a serem criados (padrão: 300000)"
    echo "  --batch=N     Número de usuários por lote (padrão: 10000)"
    echo "  --continue    Continuar a partir do último usuário criado"
    echo "  --help, -h    Mostrar esta ajuda"
    exit 0
fi

# Configurar parâmetros
COUNT="300000"
BATCH="10000"
CONTINUE=""

# Processar argumentos
for arg in "$@"; do
    case $arg in
        --count=*)
        COUNT="${arg#*=}"
        ;;
        --batch=*)
        BATCH="${arg#*=}"
        ;;
        --continue)
        CONTINUE="--continue"
        ;;
    esac
done

echo "Iniciando criação de usuários..."
echo "Total de usuários: $COUNT"
echo "Tamanho do lote: $BATCH"
if [ -n "$CONTINUE" ]; then
    echo "Continuando a partir do último usuário criado"
fi

# Executar o script em lotes
REMAINING=$COUNT
CREATED=0

while [ $REMAINING -gt 0 ]; do
    if [ $REMAINING -gt $BATCH ]; then
        CURRENT_BATCH=$BATCH
    else
        CURRENT_BATCH=$REMAINING
    fi
    
    echo "Criando lote de $CURRENT_BATCH usuários..."
    
    if [ $CREATED -eq 0 ]; then
        # Primeiro lote
        if [ -n "$CONTINUE" ]; then
            node "$PROJECT_DIR/$SCRIPT_PATH" --count=$CURRENT_BATCH --continue
        else
            node "$PROJECT_DIR/$SCRIPT_PATH" --count=$CURRENT_BATCH
        fi
    else
        # Lotes subsequentes
        node "$PROJECT_DIR/$SCRIPT_PATH" --count=$CURRENT_BATCH --continue
    fi
    
    # Verificar se o comando foi executado com sucesso
    if [ $? -ne 0 ]; then
        echo "Erro ao executar o script. Abortando."
        exit 1
    fi
    
    CREATED=$((CREATED + CURRENT_BATCH))
    REMAINING=$((REMAINING - CURRENT_BATCH))
    
    echo "Progresso: $CREATED/$COUNT usuários criados. Restantes: $REMAINING"
    
    if [ $REMAINING -gt 0 ]; then
        echo "Aguardando 5 segundos antes do próximo lote..."
        sleep 5
    fi
done

echo "Criação de usuários concluída com sucesso!"
echo "Total de usuários criados: $CREATED"
exit 0 