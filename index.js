const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const HOSTEX_API_TOKEN = process.env.HOSTEX_API_TOKEN;

// Safety check
if (!HOSTEX_API_TOKEN) {
  console.error('❌ Missing HOSTEX_API_TOKEN');
}

// Health check
app.get('/', (req, res) => {
  res.send('Hostex Owner Portal Backend Running');
});

// Real Hostex reservations endpoint
app.get('/reservations', async (req, res) => {
  const ownerId = req.params.ownerId;

  try {
    // Step 1: Get properties for owner
    const propertiesRes = await axios.get(
      'https://api.hostex.io/properties',
      {
        headers: {
          Authorization: `Bearer ${HOSTEX_API_TOKEN}`
        },
        params: { ownerId }
      }
    );

    const propertyIds = propertiesRes.data.map(p => p.id);

    if (!propertyIds.length) {
      return res.json({ reservations: [] });
    }

    // Step 2: Get reservations
    const reservationsRes = await axios.get(
      'https://api.hostex.io/reservations',
      {
        headers: {
          Authorization: `Bearer ${HOSTEX_API_TOKEN}`
        },
        params: {
          propertyIds: propertyIds.join(','),
          startDate: new Date().toISOString()
        }
      }
    );

    const reservations = reservationsRes.data.map(r => ({
      guestName: r.guest?.name || 'Guest',
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      channel: r.channelName
    }));

    res.json({ reservations });

  } catch (err) {
    console.error('Hostex API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch Hostex reservations' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
