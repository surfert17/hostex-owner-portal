const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const HOSTEX_API_TOKEN = process.env.HOSTEX_API_TOKEN;

// Health check
app.get('/', (req, res) => {
  res.send('Hostex Owner Portal Backend Running');
});

// Fetch reservations with optional filters
app.get('/reservations', async (req, res) => {
  try {
    const reservations = [];
    const limit = 100;
    let offset = 0;

    // Defaults: wide date range
    const startCheckIn = req.query.start_check_in_date || '2020-01-01';
    const endCheckIn = req.query.end_check_in_date || new Date(new Date().setFullYear(new Date().getFullYear() + 10))
      .toISOString()
      .split('T')[0];
    const status = req.query.status; // optional
    const propertyId = req.query.property_id; // optional

    while (true) {
      const params = {
        StartCheckInDate: startCheckIn,
        EndCheckInDate: endCheckIn,
        Limit: limit,
        Offset: offset
      };

      if (status) params.Status = status;
      if (propertyId) params.PropertyId = propertyId;

      const response = await axios.get('https://api.hostex.io/v3/reservations', {
        headers: { 'Hostex-Access-Token': HOSTEX_API_TOKEN },
        params
      });

      const list = response.data?.data?.reservations || [];
      if (list.length === 0) break;

      reservations.push(...list);
      offset += list.length;

      if (list.length < limit) break;
    }

    // Normalize reservations
    const normalized = reservations.map(r => ({
      reservationCode: r.reservation_code,
      stayCode: r.stay_code,
      guestName: r.guest_name,
      checkIn: r.check_in_date,
      checkOut: r.check_out_date,
      status: r.status,
      channel: r.channel_type,
      propertyId: r.property_id
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
