// ====== IMPORTS ======
const express = require('express');
const bodyParser = require('body-parser');
const messengerService = require('./messengerService');
const { handleIntent } = require('./nlp/intentHandler');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
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
app.use(bodyParser.json());

// ====== CONFIG OPENAI ======

// ====== CONFIG CLOUDINARY ======
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ====== LOAD DATA ======
const flowFullServicesRaw = JSON.parse(fs.readFileSync('./Flow_Full_Services_DrHoCaoVu.json', 'utf-8'));

const flowFullServices = {
  ...flowFullServicesRaw,
  faqs: flowFullServicesRaw.faqs.map(item => ({
    questions: item.questions.map(q => normalizeText(q)),
    answer: item.answer
  }))
};

const countryDigitRules = JSON.parse(fs.readFileSync('./data/countryDigitRules.json', 'utf-8'));

// ====== SESSION USERS ======
const completedUsers = new Set();
const handoffUsers = new Set();

// ====== TEXT NORMALIZATION ======
function normalizeText(msg) {
  return msg?.toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/[!.,?~]/g, "")
    .trim() || "";
}

// ====== VALIDATE PHONE ======
const countryCodes = Object.keys(countryDigitRules);

function isValidPhoneNumber(message) {
  if (!message) return false;
  let cleanNumber = message.replace(/\\s|-/g, '');

  if (cleanNumber.startsWith('0')) {
    cleanNumber = '+84' + cleanNumber.slice(1);
  }

  if (!cleanNumber.startsWith('+')) return false;

  const countryCode = countryCodes.find(code => cleanNumber.startsWith(code));
  if (!countryCode) {
    const genericPhone = /^\\+\\d{6,15}$/.test(cleanNumber);
    return genericPhone ? "unknown" : false;
  }

  const numberWithoutCode = cleanNumber.slice(countryCode.length);
  const digitRule = countryDigitRules[countryCode];
  if (!digitRule) return false;

  const length = numberWithoutCode.length;
  return length >= digitRule.min && length <= digitRule.max;
}
// Remove ChatGPT section
// ====== CLOUDINARY FUNCTIONS ======
async function getFeedbackImages(folder) {
  try {
    const result = await cloudinary.search
      .expression(`folder:feedback/${folder} AND resource_type:image`)
      .sort_by('public_id', 'desc')
      .max_results(10)
      .execute();

    return result.resources.map(file => file.secure_url);
  } catch (error) {
    console.error('❌ Cloudinary fetch error:', error);
    return [];
  }
}

async function getBangGiaImage(publicId) {
  try {
    const result = await cloudinary.search
      .expression(`folder:banggia AND public_id:${publicId} AND resource_type:image`)
      .max_results(1)
      .execute();

    return result.resources[0]?.secure_url || null;
  } catch (error) {
    console.error('❌ Cloudinary fetch bảng giá error:', error);
    return null;
  }
}
// Remove this line
// const { handleUserMessage } = require('./messengerService');

// Continue with webhook route
// ====== WEBHOOK ROUTE ======
// Remove this duplicate webhook handler
// app.post("/webhook", async (req, res) => {
//   const body = req.body;
//   if (body.object === 'page') {
//     body.entry.forEach(async function(entry) {
//       const webhookEvent = entry.messaging[0];
//       const senderId = webhookEvent.sender.id;
//       const message = webhookEvent.message?.text;

//       if (message) {
//         const result = await predictIntent(message);

//         if (result.intent === 'nang_nguc') {
//           await sendNangNgucFlow(senderId);
//         } else if (result.intent === 'nang_mui') {
//           await sendNangMuiFlow(senderId);
//         } else if (result.intent === 'faq') {
//           await handleFollowUp(senderId, message);
//         } else {
//           await messengerService.sendMessage(senderId, {
//             text: "Dạ chị ơi, em chưa rõ mình cần tư vấn dịch vụ nào ạ. Chị nói rõ giúp em nha!"
//           });
//         }
//       }
//     });
//     res.status(200).send('EVENT_RECEIVED');
//   } else {
//     res.sendStatus(404);
//   }
// });

// Keep only this MAIN WEBHOOK HANDLER
app.post('/webhook', (req, res) => {
  let body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(function(entry) {
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// ====== VERIFY WEBHOOK ======
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// ====== START SERVER ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});