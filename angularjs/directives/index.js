// Importar diretivas
import { scratchCard } from './scratch-card.directive.js';
import { loadingSpinner } from './loading-spinner.directive.js';
import { balanceDisplay } from './balance-display.directive.js';

// Obter a referência para o módulo
const app = angular.module('raspadinhaApp');

// Registrar diretivas
app.directive('scratchCard', scratchCard);
app.directive('loadingSpinner', loadingSpinner);
app.directive('balanceDisplay', balanceDisplay); 