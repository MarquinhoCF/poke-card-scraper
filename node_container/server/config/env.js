require('dotenv').config({ path: './server/.env' });

module.exports = {
  port: process.env.PORT || 3000,
  dataDir: process.env.DATA_DIR,
  submitsPath: process.env.SUBMITS_PATH,
};