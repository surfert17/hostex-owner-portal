// index.js
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your real Hostex API token
const HOSTEX_API_TOKEN = process.env.HOSTEX_API_TOKEN || 'YOUR_HOSTEX_API_TOKEN';

app.get('/reservations', async (req, res) => {
  try {
    // Query Hostex API for all reservations (past + future)
    const response = await axios.get('https://api.hostex.io/v3/reservations', {
      headers: {
        'Hostex-Access-Token': HOSTEX_API_TOKEN
      },
      params: {
        start_check_in_date: '2000-01-01', // far past to include all reservations
        end_check_out_date: '2100-12-31', // far future
        limit: 100, // max results per page
        offset: 0
      }
    });

    const reservations = (response.data.data?.reservations || []).map(r => ({
      reservationCode: r.reservation_code,
      stayCode: r.stay_code,
      guestName: r.guest_name,
      checkIn: r.check_in_date,
      checkOut: r.check_out_date,
      status: r.status,
      channel: r.channel_type,
      propertyId: r.property_id,
      amount: r.rates?.total_rate?.total_commission?.rate?.commission || null
    }));

    res.json({ reservations });
  } catch (error) {
    console.error('Hostex API error:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Hostex API error',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Hostex Owner Portal Backend Running on port ${PORT}`);
});

