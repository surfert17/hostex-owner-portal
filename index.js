const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const HOSTEX_API_TOKEN = process.env.HOSTEX_API_TOKEN;

// Health check
app.get('/', (req, res) => {
  res.send('Hostex Owner Portal Backend Running');
});

// Get ALL upcoming reservations
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

    const reservations = response.data.map(r => ({
      guestName: r.guest?.name || 'Guest',
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      channel: r.channelName
    }));

    res.json({ reservations });

  } catch (err) {
  console.error('Hostex API error:', err.response?.data || err.message);

  res.status(err.response?.status || 500).json({
    message: 'Hostex API error',
    details: err.response?.data || err.message
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
