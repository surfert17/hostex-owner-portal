const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Use env var, but allow boot without it for now
const HOSTEX_API_TOKEN = process.env.HOSTEX_API_TOKEN || 'TEMP';

// Health check
app.get('/', (req, res) => {
  res.send('Hostex Owner Portal Backend Running');
});

// Get all upcoming reservations (no owner filtering yet)
app.get('/reservations', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.hostex.io/reservations',
      {
        headers: {
          Authorization: `Bearer ${HOSTEX_API_TOKEN}`
        },
        params: {
          startDate: new Date().toISOString()
        }
      }
    );

    const rawData = response.data;

    // Log raw response to Render logs (for debugging)
    console.log('--- HOSTEX RAW RESPONSE START ---');
    console.log(JSON.stringify(rawData, null, 2));
    console.log('--- HOSTEX RAW RESPONSE END ---');

    // Safely locate reservations array
    const list =
      rawData?.data ||
      rawData?.reservations ||
      rawData?.items ||
      [];

    const reservations = list.map(r => ({
      guestName: r.guest?.name || r.guestName || 'Guest',
      checkIn: r.checkIn || r.startDate,
      checkOut: r.checkOut || r.endDate,
      channel: r.channelName || r.channel || 'Unknown'
    }));

    res.json({ reservations });

  } catch (err) {
    console.error('Hostex API error:', err.response?.data || err.message);

    res.status(err.response?.status || 500).json({
      message: 'Hostex API error',
      details: err.response?.data || err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
