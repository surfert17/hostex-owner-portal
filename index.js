const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const HOSTEX_API_TOKEN = 'REPLACE_ME_LATER';

app.get('/owner/:ownerId/reservations', async (req, res) => {
  res.json({
    reservations: [
      {
        guestName: "Test Guest",
        checkIn: "2026-02-10",
        checkOut: "2026-02-15",
        channel: "Airbnb"
      }
    ]
  });
});

app.get('/', (req, res) => {
  res.send('Hostex Owner Portal Backend Running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
