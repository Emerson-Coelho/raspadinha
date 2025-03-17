# 🎮 Raspadinha - Plataforma de Jogos Online

Uma plataforma moderna de jogos online com raspadinhas virtuais e números da sorte, desenvolvida com Vue 3, TypeScript e Tailwind CSS.

![Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![Licença](https://img.shields.io/badge/licença-MIT-green)

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [API Backend](#-api-backend)
- [Banco de Dados](#-banco-de-dados)
- [Inicialização do Sistema](#-inicialização-do-sistema)
- [Solução de Problemas](#-solução-de-problemas)
- [Gateways de Pagamento](#-gateways-de-pagamento)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

## 🌟 Visão Geral

Raspadinha é uma plataforma de jogos online que oferece uma experiência interativa e divertida para os usuários. A plataforma inclui jogos como raspadinhas virtuais e números da sorte, com uma interface moderna e responsiva que funciona perfeitamente em dispositivos móveis e desktop.

## ✨ Funcionalidades

- **Autenticação de Usuários**: Cadastro, login e gerenciamento de perfil
- **Raspadinhas Virtuais**: Diversos tipos de raspadinhas com diferentes prêmios
- **Números da Sorte**: Escolha seus números e concorra a prêmios
- **Histórico de Jogos**: Acompanhe seus jogos anteriores e prêmios ganhos
- **Painel de Ganhadores**: Veja os últimos ganhadores da plataforma
- **Design Responsivo**: Interface adaptada para dispositivos móveis e desktop
- **Carrossel Interativo**: Navegação por toque/arrasto nos banners promocionais
- **Gateways de Pagamento**: Integração com múltiplos gateways para depósitos e saques
- **Painel Administrativo**: Gerenciamento completo da plataforma

## 🛠️ Tecnologias

### Frontend
- **Vue 3**: Framework JavaScript progressivo
- **TypeScript**: Superset tipado de JavaScript
- **Vite**: Build tool e servidor de desenvolvimento
- **Pinia**: Gerenciamento de estado
- **Vue Router**: Roteamento de páginas
- **Tailwind CSS**: Framework CSS utilitário
- **Element Plus**: Biblioteca de componentes UI
- **Canvas Confetti**: Efeitos visuais para celebrações

### Backend
- **Node.js**: Ambiente de execução JavaScript
- **Express**: Framework web para Node.js
- **Sequelize**: ORM para banco de dados
- **PostgreSQL/SQLite**: Banco de dados relacional
- **JWT**: Autenticação baseada em tokens
- **Morgan**: Middleware de logging HTTP
- **Bcrypt**: Criptografia de senhas

## 📁 Estrutura do Projeto

```
raspadinha/
├── src/                  # Código-fonte do frontend
│   ├── assets/           # Recursos estáticos (imagens, fontes)
│   ├── components/       # Componentes Vue reutilizáveis
│   ├── composables/      # Composables Vue (lógica reutilizável)
│   ├── router/           # Configuração de rotas
│   ├── stores/           # Stores Pinia (gerenciamento de estado)
│   ├── types/            # Definições de tipos TypeScript
│   ├── utils/            # Funções utilitárias
│   ├── views/            # Componentes de página
│   ├── App.vue           # Componente raiz
│   ├── main.ts           # Ponto de entrada da aplicação
│   └── style.css         # Estilos globais
├── server/               # Código-fonte do backend
│   ├── config/           # Configurações do servidor
│   ├── controllers/      # Controladores da API
│   ├── middleware/       # Middlewares Express
│   ├── models/           # Modelos Sequelize
│   ├── routes/           # Rotas da API
│   ├── scripts/          # Scripts de inicialização
│   ├── utils/            # Funções utilitárias
│   ├── .env              # Variáveis de ambiente
│   └── index.js          # Ponto de entrada do servidor
├── public/               # Arquivos públicos
├── index.html            # Página HTML principal
├── tailwind.config.js    # Configuração do Tailwind CSS
├── vite.config.ts        # Configuração do Vite
└── package.json          # Dependências e scripts
```

## 🚀 Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/raspadinha.git
   cd raspadinha
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na pasta `server/` baseado no exemplo abaixo:
   
   ```
   PORT=3000
   NODE_ENV=development
   API_URL=http://localhost:3000
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=seu_segredo_jwt_aqui
   JWT_EXPIRE=30d
   DB_TYPE=sqlite
   ```
   
   - Crie um arquivo `.env.local` na raiz do projeto para o frontend:
   
   ```
   VITE_API_URL=http://localhost:3000/api
   ```
   
   > **Importante**: Certifique-se de que a variável `VITE_API_URL` inclua o caminho completo até a API, incluindo o prefixo `/api`.

## 🖥️ Uso

### Desenvolvimento

Execute o frontend e o backend simultaneamente:
```bash
npm run dev
```

Ou execute-os separadamente:
```bash
# Frontend
npm run dev:frontend

# Backend
npm run dev:backend
```

#### Definindo variáveis de ambiente no Windows

Se estiver usando Windows e precisar definir variáveis de ambiente para o backend:

**PowerShell:**
```powershell
$env:NODE_ENV="development"; node --watch server/index.js
```

**CMD:**
```cmd
set NODE_ENV=development && node --watch server/index.js
```

### Criação de usuários administrativos

Para criar um super administrador:
```bash
npm run create-admin
```

Para criar um usuário de teste:
```bash
npm run create-test-user
```

### Produção

1. Construa o aplicativo:
   ```bash
   npm run build
   ```

2. Visualize a versão de produção localmente:
   ```bash
   npm run preview
   ```

## 🔌 API Backend

O backend fornece as seguintes APIs:

- **Autenticação**
  - `POST /api/auth/register`: Registrar novo usuário
  - `POST /api/auth/login`: Login de usuário
  - `GET /api/auth/profile`: Obter perfil do usuário

- **Raspadinhas**
  - `GET /api/scratch-cards`: Listar raspadinhas disponíveis
  - `POST /api/scratch-cards/play`: Jogar uma raspadinha
  - `GET /api/scratch-cards/history`: Histórico de jogos

- **Números da Sorte**
  - `GET /api/lucky-draws/draws`: Listar sorteios disponíveis
  - `POST /api/lucky-draws/play`: Participar de um sorteio
  - `GET /api/lucky-draws/results`: Resultados dos sorteios

- **Pagamentos**
  - `GET /api/payment-gateways/active`: Listar gateways de pagamento ativos
  - `POST /api/transactions/deposit`: Iniciar um depósito
  - `POST /api/transactions/withdraw`: Solicitar um saque

- **Administração**
  - `POST /api/admin/login`: Login de administrador
  - `GET /api/admin/users`: Listar usuários
  - `GET /api/admin/payment-gateways`: Listar gateways de pagamento
  - `PUT /api/admin/payment-gateways/:id`: Atualizar gateway de pagamento

## 💾 Banco de Dados

O projeto utiliza Sequelize como ORM e suporta os seguintes bancos de dados:

- **SQLite** (padrão para desenvolvimento)
- **PostgreSQL** (recomendado para produção)

Os modelos principais incluem:

- **User**: Usuários da plataforma
- **Admin**: Administradores do sistema
- **PaymentGateway**: Configurações de gateways de pagamento
- **Transaction**: Transações financeiras
- **SystemLog**: Logs do sistema

## 🔄 Inicialização do Sistema

Ao iniciar o servidor pela primeira vez, o sistema executa automaticamente:

1. **Sincronização de modelos**: Cria ou atualiza as tabelas no banco de dados
2. **Inicialização de gateways**: Configura os gateways de pagamento padrão
   - UnifyPay: Gateway para pagamentos via PIX e cartão
   - BSPay: Gateway para pagamentos via PIX

**Nota**: A rota `/api/admin/payment-gateways/initialize` só deve ser usada quando não existirem gateways no banco de dados. Se os gateways já existem, use apenas a rota `/api/admin/payment-gateways` para listá-los.

## 🔧 Solução de Problemas

### Problemas comuns

1. **Erro ao iniciar o backend no Windows**
   
   Se você encontrar erros como `'NODE_ENV' não é reconhecido como um comando interno`, use os comandos específicos para Windows mencionados na seção [Definindo variáveis de ambiente no Windows](#definindo-variáveis-de-ambiente-no-windows).

2. **Erro de CORS**
   
   Verifique se as URLs no arquivo `.env` estão configuradas corretamente e se o servidor backend está rodando.

3. **Erro de conexão com o backend**
   
   Certifique-se de que o servidor backend está rodando na porta especificada no arquivo `.env`.

4. **Erro 404 em requisições da API**
   
   Se você encontrar erros como `404 Not Found` para URLs como `http://localhost:5173/api/admin/login`, isso indica que as requisições estão sendo enviadas para o servidor frontend (Vite) em vez do servidor backend.
   
   **Solução**:
   - Certifique-se de que o arquivo `.env.local` esteja configurado corretamente:
     ```
     VITE_API_URL=http://localhost:3000/api
     ```
   - Verifique se todas as stores estão usando a variável de ambiente para a URL da API
   - Reinicie o servidor de desenvolvimento após realizar as alterações para garantir que as novas variáveis de ambiente sejam carregadas
   - Em ambientes de produção, configure o servidor para redirecionar as requisições de API para o backend

5. **Erro na inicialização de gateways**
   
   Se você encontrar o erro `Cannot POST /api/api/admin/payment-gateways/initialize`, isso indica uma duplicação de `/api/` no caminho da URL. Este erro ocorre quando os gateways já existem no banco de dados e a inicialização não é necessária. A store de pagamento foi atualizada para não chamar essa rota automaticamente.

6. **Duplicação de `/api` nas URLs**
   
   Se você encontrar erros como `Cannot GET /api/api/admin/payment-gateways`, isso indica uma duplicação do prefixo `/api/` nas URLs. Este problema pode ocorrer quando:
   
   - A variável de ambiente `VITE_API_URL` já inclui o prefixo `/api` e o código também adiciona esse prefixo
   - O Axios está configurado com uma baseURL que já inclui `/api` e as rotas também incluem esse prefixo
   
   **Solução**: 
   - Certifique-se de que a variável `VITE_API_URL` no arquivo `.env.local` inclua o caminho completo (ex: `http://localhost:3000/api`)
   - Use a função `buildApiUrl` implementada nas stores para garantir que as URLs sejam construídas corretamente
   - Adicione logs para depurar as URLs que estão sendo usadas nas requisições:
     ```javascript
     console.log('API_URL configurada:', API_URL);
     console.log('URL da requisição:', buildApiUrl('/caminho/endpoint'));
     ```

7. **Erro 404 nas rotas do UnifyPay**

   Se você encontrar erros como `Cannot POST /gateway/pix/receive` ao usar o gateway de pagamento UnifyPay, isso indica que a rota está incorreta.
   
   **Solução**:
   - A rota correta para geradores de código PIX na UnifyPay é: `/api/v1/gateway/pix/receive`
   - A rota correta para envios de PIX é: `/api/v1/gateway/pix/send` 
   - Para atualizar as rotas no sistema, configure os endpoints dos gateways no banco de dados:
     ```bash
     # Atualizar endpoint UnifyPay com o valor padrão
     npm run update-unifypay
     
     # Atualizar endpoint BSPay com o valor padrão
     npm run update-bspay
     
     # Atualizar ambos os endpoints com valores personalizados
     node server/scripts/updateGateways.js --unifypay=https://api.exemplo.com --bspay=https://api.outroexemplo.com
     ```
   - Verifique na interface de administração se o `apiEndpoint` está configurado corretamente
   - Nunca defina endpoints fixos no código - sempre use os valores do banco de dados
   - Reinicie o servidor após as alterações
   
   **Observação**: Nunca execute os scripts de atualização de gateways se já houver registros na tabela, a menos que você especifique parâmetros explícitos. Os scripts agora verificam se existem registros e não aplicam valores padrão quando encontram registros existentes.

8. **Erro porque o endpoint do gateway não está configurado**
   
   Se você encontrar o erro "Gateway não configurado corretamente. Endpoint da API não definido.", isso significa que o gateway no banco de dados não tem um endpoint configurado.
   
   **Solução**:
   - Atualize o endpoint do gateway utilizando um dos comandos acima
   - Ou acesse o painel de administração e configure o endpoint do gateway manualmente
   - Certifique-se de que o valor do endpoint seja o URL base completo sem a parte da API (ex: `https://api.unifypay.co`)

9. **Erro de autenticação com o UnifyPay**

   Se você encontrar erros de autenticação ou erros 401 Unauthorized ao se comunicar com o UnifyPay, verifique a configuração das chaves de API.
   
   **Solução**:
   - O UnifyPay utiliza cabeçalhos específicos para autenticação:
     ```
     x-public-key: SUA_CHAVE_PUBLICA_AQUI
     x-secret-key: SUA_CHAVE_PRIVADA_AQUI
     ```
   - Configure ambas as chaves (pública e privada) no painel administrativo
   - Verifique se as chaves foram inseridas nos campos corretos:
     - Chave Pública: campo "Chave Pública" na interface de administração
     - Chave Privada: campo "Chave Secreta" na interface de administração
   - Se estiver usando webhooks, a assinatura do webhook é calculada usando a chave privada
   - Não confunda o formato de autenticação do UnifyPay com o formato de outros gateways que podem usar Bearer tokens

## 💳 Gateways de Pagamento

### Carregamento Dinâmico de Configurações

O sistema foi projetado para garantir que as configurações dos gateways de pagamento, especialmente as chaves de API, sejam sempre carregadas diretamente do banco de dados a cada requisição, sem utilizar cache. Isso significa que:

1. **Atualizações em Tempo Real**: Quando um administrador altera as chaves de API ou configurações de um gateway no painel administrativo, essas alterações são aplicadas imediatamente na próxima requisição, sem necessidade de reiniciar o servidor.

2. **Segurança Aprimorada**: A função `getLatestGateway` busca diretamente no banco de dados a versão mais recente do gateway, garantindo que todas as chaves estejam sempre atualizadas.

3. **Logs de Diagnóstico**: O sistema registra no console quando carrega as chaves diretamente do banco de dados, facilitando o diagnóstico de problemas relacionados à autenticação.

### Chaves de API em Texto Simples

Por questões de compatibilidade, as chaves de API agora são armazenadas em texto simples no banco de dados, sem criptografia. Isso facilita o diagnóstico de problemas relacionados à autenticação e garante que as chaves sejam carregadas corretamente.

#### Alterações Realizadas

1. **Modelo PaymentGateway**:
   - Removida a criptografia nos getters e setters das propriedades `publicKey` e `secretKey`
   - Os valores são salvos e recuperados diretamente do banco de dados em texto simples
   - Os métodos `get()` e `set()` foram mantidos para compatibilidade, mas não realizam mais criptografia/descriptografia

2. **Scripts de Atualização**:
   - Adicionados novos parâmetros para configurar as chaves via linha de comando:
     - `--unifypay-public-key`
     - `--unifypay-secret-key`
     - `--bspay-public-key`
     - `--bspay-secret-key`

3. **Scripts no package.json**:
   - Adicionados novos scripts para facilitar a atualização das chaves:
     - `update-unifypay-keys`: Atualiza as chaves do UnifyPay
     - `update-bspay-keys`: Atualiza as chaves do BSPay

#### Configurando Chaves via Linha de Comando

É possível configurar as chaves de API diretamente via linha de comando:

```bash
# Configurar chaves do UnifyPay (substitua pelos valores reais)
npm run update-unifypay-keys

# Personalizar as chaves do UnifyPay
node server/scripts/updateGateways.js --unifypay-public-key=SUA_CHAVE_PUBLICA_AQUI --unifypay-secret-key=SUA_CHAVE_SECRETA_AQUI

# Configurar chaves do BSPay
npm run update-bspay-keys

# Personalizar as chaves do BSPay
node server/scripts/updateGateways.js --bspay-public-key=SUA_CHAVE_PUBLICA_AQUI --bspay-secret-key=SUA_CHAVE_SECRETA_AQUI

# Configurar endpoint e chaves ao mesmo tempo
node server/scripts/updateGateways.js --unifypay=https://api.exemplo.com --unifypay-public-key=CHAVE --unifypay-secret-key=CHAVE
```

#### Cabeçalhos de Autenticação

O UnifyPay utiliza cabeçalhos específicos para autenticação:
```
x-public-key: SUA_CHAVE_PUBLICA_AQUI
x-secret-key: SUA_CHAVE_PRIVADA_AQUI
```

Ambas as chaves devem ser configuradas no painel administrativo ou via linha de comando como mostrado acima.

**Observação:** Por motivos de segurança, é recomendável que as chaves de API sejam mantidas em segredo e transmitidas de forma segura. Embora estejam armazenadas em texto simples para facilitar o diagnóstico, certifique-se de que o acesso ao banco de dados seja devidamente protegido.

### Tratamento de Webhooks

Os webhooks também utilizam o mesmo mecanismo para verificar assinaturas, garantindo que o sistema sempre utilizará as versões mais recentes das chaves para validar as requisições recebidas dos gateways de pagamento.

### Boas Práticas

1. **Rotação de Chaves**: É recomendável que as chaves de API sejam rotacionadas periodicamente por questões de segurança. Com esta implementação, você pode alterar as chaves no painel administrativo e elas serão aplicadas imediatamente.

2. **Monitoramento**: Adicione monitoramento para detectar falhas de autenticação, que podem indicar que as chaves foram alteradas ou revogadas pelo provedor do gateway.

3. **Backup de Chaves**: Mantenha um backup seguro das chaves de API, pois elas são essenciais para o funcionamento dos pagamentos.

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

1. Faça um fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

Desenvolvido com ❤️ por [Seu Nome/Equipe]
