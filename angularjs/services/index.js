// Exportação de todos os serviços
import { AuthService } from './auth.service.js';
import { AdminService } from './admin.service.js';
import { GameService } from './game.service.js';
import { UserService } from './user.service.js';
import { PaymentService } from './payment.service.js';

// Obter a referência para o módulo
const app = angular.module('raspadinhaApp');

// Registrar serviços
app.service('AuthService', AuthService);
app.service('AdminService', AdminService);
app.service('GameService', GameService);
app.service('UserService', UserService);
app.service('PaymentService', PaymentService); 