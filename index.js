const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const HOSTEX_API_TOKEN = process.env.HOSTEX_API_TOKEN;

// Health check
app.get('/', (req, res) => {
  res.send('Hostex Owner Portal Backend Running');
});

// Fetch upcoming reservations for owner portal
app.get('/reservations', async (req, res) => {
  try {
    const reservations = [];
    const limit = 100;
    let offset = 0;

    const today = new Date().toISOString().split('T')[0]; // today YYYY-MM-DD
    const endCheckIn = req.query.end_check_in_date || new Date(new Date().setFullYear(new Date().getFullYear() + 10))
      .toISOString()
      .split('T')[0];
    const status = req.query.status; // optional filter
    const propertyId = req.query.property_id; // optional

    while (true) {
      const params = {
        StartCheckInDate: today, // only upcoming
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

    // Normalize reservations for frontend
    const normalized = reservations.map(r => ({
      reservationCode: r.reservation_code,
      stayCode: r.stay_code,
      guestName: r.guest_name,
      checkIn: r.check_in_date,
      checkOut: r.check_out_date,
      status: r.status,
      channel: r.channel_type,
      propertyId: r.property_id,
      amount: r.rates?.total || null // payout amount if available
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
