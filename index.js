const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const HOSTEX_API_TOKEN = process.env.HOSTEX_API_TOKEN;

// Simple health check
app.get('/', (req, res) => {
  res.send('Hostex Owner Portal Backend Running');
});

// List reservations with basic filters
app.get('/reservations', async (req, res) => {
  try {
    // Use today's date as a starting check-in filter
    const today = new Date().toISOString().split('T')[0];

    // Build query params
    const params = {
      StartCheckInDate: today,
      Status: 'accepted',
      Limit: 100,
      Offset: 0
    };

    const response = await axios.get(
      'https://api.hostex.io/v3/reservations',
      {
        headers: {
          'Hostex-Access-Token': HOSTEX_API_TOKEN
        },
        params
      }
    );

    // The expected structure based on docs
    const raw = response.data;

    // If there's a 'reservations' array, use it
    const list = raw?.reservations || [];

    // Normalize it
    const reservations = list.map(r => ({
      reservationCode: r.reservation_code,
      guestName: r.guest_name,
      checkIn: r.check_in_date,
      checkOut: r.check_out_date,
      channel: r.channel_type
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
