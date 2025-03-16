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
- **Morgan**: Middleware de logging HTTP

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
│   ├── routes/           # Rotas da API
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
   - Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`

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
  - `GET /api/lucky-numbers/draws`: Listar sorteios disponíveis
  - `POST /api/lucky-numbers/play`: Participar de um sorteio
  - `GET /api/lucky-numbers/results`: Resultados dos sorteios

## 👥 Contribuição

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
