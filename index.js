// ====== IMPORTS ======
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Replace with:
const messengerClient = require('./services/messengerClient');
const { handleIntent } = require('./nlp/intentHandler');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Add Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const { predictIntent } = require('./intentEngine');
const { 
    sendNangNgucFlow,
    sendThaoTuiNgucFlow,
    sendNangMuiFlow,
    sendThamMyMatFlow,
    sendHutMoBungFlow,
    sendThamMyVungKinFlow,
    sendCangDaMatFlow,
    sendThamMyCamFlow,
    sendTreoCungMayFlow,
    sendTaiTaoVuFlow,
    sendTaoHinhThanhBungFlow,
    sendChinhMatLoiFlow,
    sendChinhMuiLoiFlow,
    sendHutMoBodyFlow,
    sendCangChiDaMatFlow,
    sendDonThaiDuongFlow,
    sendHutMoTiemLenMatFlow,
    sendDiaChiFlow,
    sendMenuDichVu,
    sendBangGiaOnlyFlow,
    sendMenuBangGia
} = require('./servicesFlow');
const handleMessage = require('./handleMessage');

// ====== APP INIT ======
const app = express();

// Add security and logging middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static('public'));

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Add basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Enhance webhook handler with error handling
app.post('/webhook', async (req, res) => {
  try {
    let body = req.body;

    if (body.object === 'page') {
      for (const entry of body.entry) {
        const webhook_event = entry.messaging[0];
        const sender_psid = webhook_event.sender.id;

        if (webhook_event.message) {
          await handleMessage(sender_psid, webhook_event.message);
        } else if (webhook_event.postback) {
          // Handle postback events
          await handlePostback(sender_psid, webhook_event.postback);
        }
      }
      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.sendStatus(500);
  }
});

// Add postback handler
async function handlePostback(sender_psid, postback) {
  try {
    const payload = postback.payload;
    await handleMessage(sender_psid, { text: payload });
  } catch (error) {
    console.error('❌ Postback error:', error);
  }
}

// Add graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  console.log('🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
}

// ====== START SERVER ======
// Add PORT definition
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});