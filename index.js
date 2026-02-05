const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const HOSTEX_API_TOKEN = process.env.HOSTEX_API_TOKEN;

// Health check
app.get('/', (req, res) => {
  res.send('Hostex Owner Portal Backend Running');
});

// Fetch all reservations
app.get('/reservations', async (req, res) => {
  try {
    const reservations = [];
    const limit = 100; // maximum per request
    let offset = 0;
    const startDate = '2020-01-01'; // far enough in the past to capture all reservations
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 10); // 10 years into future
    const endDateStr = endDate.toISOString().split('T')[0];

    while (true) {
      const response = await axios.get(
        'https://api.hostex.io/v3/reservations',
        {
          headers: {
            'Hostex-Access-Token': HOSTEX_API_TOKEN
          },
          params: {
            StartCheckInDate: startDate,
            EndCheckInDate: endDateStr,
            Limit: limit,
            Offset: offset
          }
        }
      );

      const data = response.data;
      const list = data?.reservations || [];

      if (list.length === 0) break;

      reservations.push(...list);
      offset += list.length;

      if (list.length < limit) break; // last page
    }

    // Normalize reservations for frontend
    const normalized = reservations.map(r => ({
      reservationCode: r.reservation_code || r.ReservationCode,
      guestName: r.guest_name || r.GuestName || r.guest?.name || 'Guest',
      checkIn: r.check_in_date || r.CheckInDate,
      checkOut: r.check_out_date || r.CheckOutDate,
      channel: r.channel_type || r.ChannelType || 'Unknown',
      propertyId: r.property_id || r.PropertyId || null
    }));

    res.json({ reservations: normalized });

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
