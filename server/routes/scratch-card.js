import express from 'express';
const router = express.Router();

// Dados simulados para desenvolvimento
const scratchCards = [
  {
    id: '1',
    name: 'Raspadinha Premium',
    description: 'Raspadinha com prêmios maiores',
    price: 10,
    imageUrl: '/images/scratch-premium.webp',
    type: 'premium',
    prizes: [
      { id: '1', value: 0, probability: 70, description: 'Não foi dessa vez' },
      { id: '2', value: 5, probability: 15, description: 'Prêmio de R$ 5,00' },
      { id: '3', value: 10, probability: 10, description: 'Prêmio de R$ 10,00' },
      { id: '4', value: 50, probability: 4, description: 'Prêmio de R$ 50,00' },
      { id: '5', value: 100, probability: 1, description: 'Prêmio de R$ 100,00' }
    ],
    isActive: true
  },
  {
    id: '2',
    name: 'Raspadinha Regular',
    description: 'Raspadinha com prêmios menores',
    price: 5,
    imageUrl: '/images/scratch-regular.webp',
    type: 'regular',
    prizes: [
      { id: '1', value: 0, probability: 60, description: 'Não foi dessa vez' },
      { id: '2', value: 2, probability: 20, description: 'Prêmio de R$ 2,00' },
      { id: '3', value: 5, probability: 15, description: 'Prêmio de R$ 5,00' },
      { id: '4', value: 10, probability: 4, description: 'Prêmio de R$ 10,00' },
      { id: '5', value: 50, probability: 1, description: 'Prêmio de R$ 50,00' }
    ],
    isActive: true
  },
  {
    id: '3',
    name: 'Raspadinha Especial',
    description: 'Raspadinha com prêmios especiais',
    price: 20,
    imageUrl: '/images/scratch-special.webp',
    type: 'special',
    prizes: [
      { id: '1', value: 0, probability: 65, description: 'Não foi dessa vez' },
      { id: '2', value: 10, probability: 20, description: 'Prêmio de R$ 10,00' },
      { id: '3', value: 20, probability: 10, description: 'Prêmio de R$ 20,00' },
      { id: '4', value: 100, probability: 4, description: 'Prêmio de R$ 100,00' },
      { id: '5', value: 500, probability: 1, description: 'Prêmio de R$ 500,00' }
    ],
    isActive: true
  }
];

// Resultados de raspadinhas dos usuários
const scratchCardResults = [
  {
    id: '1',
    scratchCardId: '1',
    userId: '1',
    prize: 10,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
    isRevealed: true
  },
  {
    id: '2',
    scratchCardId: '2',
    userId: '1',
    prize: 0,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
    isRevealed: true
  }
];

// Rota para obter todas as raspadinhas disponíveis
router.get('/', (req, res) => {
  res.json({ scratchCards });
});

// Rota para comprar uma raspadinha
router.post('/buy', (req, res) => {
  const { scratchCardId } = req.body;
  const userId = '1'; // Em um ambiente real, seria obtido do token JWT
  
  // Verificar se a raspadinha existe
  const scratchCard = scratchCards.find(card => card.id === scratchCardId);
  if (!scratchCard) {
    return res.status(404).json({ message: 'Raspadinha não encontrada' });
  }
  
  // Verificar se a raspadinha está ativa
  if (!scratchCard.isActive) {
    return res.status(400).json({ message: 'Esta raspadinha não está disponível no momento' });
  }
  
  // Simular o resultado da raspadinha
  const randomValue = Math.random() * 100;
  let cumulativeProbability = 0;
  let selectedPrize = scratchCard.prizes[0]; // Default para o primeiro prêmio (geralmente 0)
  
  for (const prize of scratchCard.prizes) {
    cumulativeProbability += prize.probability;
    if (randomValue <= cumulativeProbability) {
      selectedPrize = prize;
      break;
    }
  }
  
  // Criar o resultado da raspadinha
  const result = {
    id: (scratchCardResults.length + 1).toString(),
    scratchCardId,
    userId,
    prize: selectedPrize.value,
    createdAt: new Date().toISOString(),
    isRevealed: false
  };
  
  // Adicionar o resultado à lista (em um ambiente real, seria salvo no banco de dados)
  scratchCardResults.push(result);
  
  // Retornar o resultado
  res.json({ result });
});

// Rota para revelar uma raspadinha
router.post('/reveal', (req, res) => {
  const { resultId } = req.body;
  const userId = '1'; // Em um ambiente real, seria obtido do token JWT
  
  // Buscar o resultado
  const resultIndex = scratchCardResults.findIndex(r => r.id === resultId && r.userId === userId);
  if (resultIndex === -1) {
    return res.status(404).json({ message: 'Resultado não encontrado' });
  }
  
  // Verificar se a raspadinha já foi revelada
  if (scratchCardResults[resultIndex].isRevealed) {
    return res.status(400).json({ message: 'Esta raspadinha já foi revelada' });
  }
  
  // Marcar a raspadinha como revelada
  scratchCardResults[resultIndex].isRevealed = true;
  
  // Retornar o resultado atualizado
  res.json({ result: scratchCardResults[resultIndex] });
});

// Rota para obter os resultados das raspadinhas do usuário
router.get('/results', (req, res) => {
  const userId = '1'; // Em um ambiente real, seria obtido do token JWT
  
  // Filtrar os resultados do usuário
  const userResults = scratchCardResults.filter(r => r.userId === userId);
  
  // Retornar os resultados
  res.json({ results: userResults });
});

export default router; 