import express from 'express';
const router = express.Router();

// Dados simulados para desenvolvimento
const luckyDraws = [
  {
    id: '1',
    name: 'Sorteio Semanal',
    description: 'Sorteio realizado toda sexta-feira',
    prizeAmount: 1000,
    prizeDescription: 'R$ 1.000,00 em dinheiro',
    drawDate: new Date(Date.now() + 604800000).toISOString(), // 7 dias no futuro
    price: 5,
    maxNumbers: 100,
    availableNumbers: Array.from({ length: 100 }, (_, i) => i + 1),
    isActive: true
  },
  {
    id: '2',
    name: 'Sorteio Especial',
    description: 'Sorteio especial de fim de mês',
    prizeAmount: 5000,
    prizeDescription: 'R$ 5.000,00 em dinheiro',
    drawDate: new Date(Date.now() + 2592000000).toISOString(), // 30 dias no futuro
    price: 10,
    maxNumbers: 200,
    availableNumbers: Array.from({ length: 200 }, (_, i) => i + 1),
    isActive: true
  }
];

// Números comprados pelos usuários
const userLuckyNumbers = [
  {
    id: '1',
    drawId: '1',
    userId: '1',
    number: 42,
    purchaseDate: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
    isWinner: null
  },
  {
    id: '2',
    drawId: '2',
    userId: '1',
    number: 77,
    purchaseDate: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
    isWinner: null
  }
];

// Resultados de sorteios anteriores
const drawResults = [
  {
    id: '1',
    drawId: '3', // Um sorteio anterior
    winningNumber: 27,
    drawDate: new Date(Date.now() - 604800000).toISOString(), // 7 dias atrás
    winnerId: 'user123'
  },
  {
    id: '2',
    drawId: '4', // Um sorteio anterior
    winningNumber: 54,
    drawDate: new Date(Date.now() - 1209600000).toISOString(), // 14 dias atrás
    winnerId: 'user456'
  }
];

// Rota para obter todos os sorteios disponíveis
router.get('/', (req, res) => {
  res.json({ draws: luckyDraws });
});

// Rota para comprar um número
router.post('/buy', (req, res) => {
  const { drawId, number } = req.body;
  const userId = '1'; // Em um ambiente real, seria obtido do token JWT
  
  // Verificar se o sorteio existe
  const draw = luckyDraws.find(d => d.id === drawId);
  if (!draw) {
    return res.status(404).json({ message: 'Sorteio não encontrado' });
  }
  
  // Verificar se o sorteio está ativo
  if (!draw.isActive) {
    return res.status(400).json({ message: 'Este sorteio não está disponível no momento' });
  }
  
  // Verificar se o número está disponível
  if (!draw.availableNumbers.includes(number)) {
    return res.status(400).json({ message: 'Este número não está disponível' });
  }
  
  // Remover o número da lista de disponíveis
  const drawIndex = luckyDraws.findIndex(d => d.id === drawId);
  if (drawIndex !== -1) {
    luckyDraws[drawIndex].availableNumbers = luckyDraws[drawIndex].availableNumbers.filter(n => n !== number);
  }
  
  // Criar o registro de compra do número
  const userNumber = {
    id: (userLuckyNumbers.length + 1).toString(),
    drawId,
    userId,
    number,
    purchaseDate: new Date().toISOString(),
    isWinner: null
  };
  
  // Adicionar o número à lista do usuário (em um ambiente real, seria salvo no banco de dados)
  userLuckyNumbers.push(userNumber);
  
  // Retornar o número comprado
  res.json({ userNumber });
});

// Rota para obter os números comprados pelo usuário
router.get('/user-numbers', (req, res) => {
  const userId = '1'; // Em um ambiente real, seria obtido do token JWT
  
  // Filtrar os números do usuário
  const numbers = userLuckyNumbers.filter(n => n.userId === userId);
  
  // Retornar os números
  res.json({ numbers });
});

// Rota para obter os resultados dos sorteios
router.get('/results', (req, res) => {
  res.json({ results: drawResults });
});

export default router; 