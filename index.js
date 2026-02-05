const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const HOSTEX_API_TOKEN = process.env.HOSTEX_API_TOKEN;

// Health check
app.get('/', (req, res) => {
  res.send('Hostex Owner Portal Backend Running');
});

// Get all upcoming reservations
app.get('/reservations', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const response = await axios.get(
      'https://api.hostex.io/reservations',
      {
        headers: {
          'Hostex-Access-Token': HOSTEX_API_TOKEN
        },
        params: {
          StartCheckInDate: today
        }
      }
    );

    const rawData = response.data;

    // Try to find reservations array in response
    const list =
      rawData?.reservations ||
      rawData?.data?.reservations ||
      rawData?.data ||
      [];

    const reservations = list.map(r => ({
      reservationCode: r.reservation_code || r.ReservationCode,
      guestName: r.guest_name || r.GuestName || r.guest?.name,
      checkIn: r.check_in_date || r.CheckInDate,
      checkOut: r.check_out_date || r.CheckOutDate,
      channel: r.channel_type || r.ChannelType
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
