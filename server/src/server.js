const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`ServiceDesk Pro Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    process.on('unhandledRejection', (err) => {
      console.error(`Unhandled Rejection Error: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`Server initialization failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
