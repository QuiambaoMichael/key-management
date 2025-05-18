const SerialPort = require('serialport').SerialPort;
const ReadlineParser = require('@serialport/parser-readline').ReadlineParser;
const axios = require('axios');

// --- CONFIGURATION ---
const SERIAL_PORT = 'COM3'; // Change to your actual port
const BAUD_RATE = 9600;
const API_URL = 'https://key-management-mz1o.onrender.com/api/logEvent'; // Replace with your real API

// Create serial port
const port = new SerialPort({
  path: SERIAL_PORT,
  baudRate: BAUD_RATE,
});

// Create a parser to split by new lines
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

port.on('open', () => {
  console.log(`📡 Listening to Arduino on ${SERIAL_PORT}...`);
});

parser.on('data', async (line) => {
  const trimmed = line.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const data = JSON.parse(trimmed);
      console.log('📨 Received:', data);

      // Post to Render API
      try {
        const response = await axios.post(API_URL, data);
        console.log('✅ API response:', response.data);
      } catch (apiErr) {
        console.error('❌ API error:', apiErr.response?.data || apiErr.message);
      }
    } catch (err) {
      console.warn('⚠️ Invalid JSON:', trimmed);
    }
  }
});

port.on('error', (err) => {
  console.error('❌ Serial port error:', err.message);
});
