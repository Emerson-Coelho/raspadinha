// Importação de todos os controllers
import { HomeController } from './home.controller.js';
import { LoginController } from './auth/login.controller.js';
import { RegisterController } from './auth/register.controller.js';
import { ProfileController } from './profile/profile.controller.js';
import { GameDetailController } from './games/game-detail.controller.js';
import { PaymentController } from './payment/payment.controller.js';
import { NotFoundController } from './not-found.controller.js';

// Controllers da área de administração
import { AdminDashboardController } from './admin/dashboard.controller.js';
import { AdminUsersController } from './admin/users.controller.js';
import { AdminGamesController } from './admin/games.controller.js';

// Obter a referência para o módulo
const app = angular.module('raspadinhaApp');

// Registrar controllers
app.controller('HomeController', HomeController);
app.controller('LoginController', LoginController);
app.controller('RegisterController', RegisterController);
app.controller('ProfileController', ProfileController);
app.controller('GameDetailController', GameDetailController);
app.controller('PaymentController', PaymentController);
app.controller('NotFoundController', NotFoundController);

// Registrar controllers de administração
app.controller('AdminDashboardController', AdminDashboardController);
app.controller('AdminUsersController', AdminUsersController);
app.controller('AdminGamesController', AdminGamesController); 