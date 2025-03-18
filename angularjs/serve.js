/**
 * Servidor Express simples para servir a aplicação AngularJS
 */
const express = require('express');
const path = require('path');
const app = express();
const port = 5173;

// Servir arquivos estáticos da pasta atual
app.use(express.static(__dirname));

// Redirecionar todas as requisições para index.html
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Abra http://localhost:${port} no seu navegador para acessar a aplicação`);
}); 