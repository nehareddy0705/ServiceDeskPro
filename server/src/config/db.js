const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where setting DNS servers is not supported
}

const connectDB = async () => {
  try {
    const mongoUri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/servicedesk_pro').trim();
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
