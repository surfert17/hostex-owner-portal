const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const HOSTEX_API_TOKEN = process.env.HOSTEX_API_TOKEN;

// Health check
app.get('/', (req, res) => {
  res.send('Hostex Owner Portal Backend Running');
});

// Fetch all reservations your token can access (no filters)
app.get('/reservations', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.hostex.io/v3/reservations', // correct endpoint
      {
        headers: {
          'Hostex-Access-Token': HOSTEX_API_TOKEN
        }
      }
    );

    const raw = response.data;

    // Safely locate reservations array
    const list = raw?.reservations || [];

    // Normalize the output
    const reservations = list.map(r => ({
      reservationCode: r.reservation_code || r.ReservationCode,
      guestName: r.guest_name || r.GuestName || r.guest?.name || 'Guest',
      checkIn: r.check_in_date || r.CheckInDate,
      checkOut: r.check_out_date || r.CheckOutDate,
      channel: r.channel_type || r.ChannelType || 'Unknown',
      propertyId: r.property_id || r.PropertyId || null
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
