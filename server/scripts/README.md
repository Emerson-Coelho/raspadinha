# Scripts para Criação de Usuários de Teste

Este diretório contém scripts para criar usuários de teste no banco de dados.

## Arquivos

- `createUsersTable.js`: Script para criar a tabela de usuários no banco de dados
- `setupDatabase.sh`: Script shell para configurar o banco de dados
- `createTestUsers.js`: Script principal para criar usuários de teste
- `runCreateUsers.sh`: Script shell para executar a criação de usuários em lotes
- `testCreateUsers.sh`: Script shell para testar a criação de um número menor de usuários

## Requisitos

- Node.js v14 ou superior
- Banco de dados PostgreSQL configurado no arquivo `.env`

## Como usar

### Configuração do banco de dados

Antes de criar os usuários, é necessário configurar o banco de dados:

```bash
./setupDatabase.sh
```

Este script criará a tabela `users` no banco de dados, caso ela ainda não exista.

### Teste rápido

Para testar a criação de 10 usuários:

```bash
./testCreateUsers.sh
```

### Criação completa

Para criar 300.000 usuários (padrão):

```bash
./runCreateUsers.sh
```

### Opções

O script `runCreateUsers.sh` aceita as seguintes opções:

- `--count=N`: Número total de usuários a serem criados (padrão: 300000)
- `--batch=N`: Número de usuários por lote (padrão: 10000)
- `--continue`: Continuar a partir do último usuário criado
- `--help`, `-h`: Mostrar ajuda

Exemplos:

```bash
# Criar 50.000 usuários
./runCreateUsers.sh --count=50000

# Criar 100.000 usuários em lotes de 5.000
./runCreateUsers.sh --count=100000 --batch=5000

# Continuar a criação a partir do último usuário
./runCreateUsers.sh --continue
```

## Detalhes dos usuários criados

Os usuários criados terão as seguintes características:

- Email: `usuarioN@teste.com` (onde N é um número sequencial)
- Senha: `senha123` (para todos os usuários)
- CPF: Gerado automaticamente e único para cada usuário
- Telefone: Gerado automaticamente
- Saldo: Valor aleatório entre 0 e 100.000,00
- Função: 90% usuários normais, 10% VIP
- Status: 95% ativos, 2,5% inativos, 2,5% suspensos

## Observações

- O script utiliza inserção em lote para melhor desempenho
- Em caso de erro em um lote, o script tentará inserir os usuários individualmente
- O script pode ser interrompido e continuado posteriormente usando a opção `--continue`
- Para evitar sobrecarga do banco de dados, há uma pausa de 5 segundos entre os lotes 