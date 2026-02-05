// index.js
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Use your Hostex API Key
const HOSTEX_API_KEY = process.env.HOSTEX_API_KEY;

// Helper to fetch reservations
async function fetchReservations() {
  try {
    const response = await axios.get('https://api.hostex.io/v3/reservations', {
      headers: {
        'Authorization': `Bearer ${HOSTEX_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 100, // adjust as needed
        offset: 0
      }
    });

    const reservations = (response.data.data?.reservations || []).map(r => {
      // Extract payout breakdown
      const amountBreakdown = {};
      if (r.rates?.total_rate?.rate?.commission?.details) {
        r.rates.total_rate.rate.commission.details.forEach(d => {
          amountBreakdown[d.type] = d.amount;
        });
      }

      // Sum all amounts for total payout
      const totalAmount = Object.values(amountBreakdown).reduce(
        (sum, val) => sum + (val || 0),
        0
      );

      return {
        reservationCode: r.reservation_code,
        stayCode: r.stay_code,
        guestName: r.guest_name,
        checkIn: r.check_in_date,
        checkOut: r.check_out_date,
        status: r.status,
        channel: r.channel_type,
        propertyId: r.property_id,
        amountBreakdown,
        totalAmount
      };
    });

    return reservations;
  } catch (err) {
    console.error('Hostex API error:', err.response?.data || err.message);
    return [];
  }
}

// Endpoint to return reservations
app.get('/reservations', async (req, res) => {
  const reservations = await fetchReservations();
  res.json({ reservations });
});

// Start server
app.listen(PORT, () => {
  console.log(`Hostex Owner Portal Backend Running on port ${PORT}`);
});
