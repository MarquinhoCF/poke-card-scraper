const express = require('express');
const path = require('path');
const { port } = require('./config/env');
const routes = require('./routes.js');
require('./cron/tasks');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', routes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
