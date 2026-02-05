const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Allow boot even if env var is missing (for now)
const HOSTEX_API_TOKEN = process.env.HOSTEX_API_TOKEN || 'TEMP';

// Health check
app.get('/', (req, res) => {
  res.send('Hostex Owner Portal Backend Running');
});

// TEST Hostex open_api base
app.get('/test', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.hostex.io/open_api',
      {
        headers: {
          Authorization: `Bearer ${HOSTEX_API_TOKEN}`
        }
      }
    );

    res.json({
      success: true,
      data: response.data
    });

  } catch (err) {
    console.error('Hostex TEST error:', err.response?.data || err.message);

    res.status(err.response?.status || 500).json({
      success: false,
      details: err.response?.data || err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,
