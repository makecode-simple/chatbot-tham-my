// ====== IMPORTS ======
const express = require('express');
const bodyParser = require('body-parser');
const messengerService = require('./messengerService');
const fs = require('fs');
const OpenAI = require('openai');
const cloudinary = require('cloudinary').v2;

// ====== APP INIT ======
const app = express();
app.use(bodyParser.json());

// ====== CONFIG OPENAI ======
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ====== CONFIG CLOUDINARY ======
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ====== LOAD DATA ======
const countryDigitRules = JSON.parse(fs.readFileSync('./countryDigitRules.json', 'utf-8'));
const flowFullServices = JSON.parse(fs.readFileSync('./Flow_Full_Services_DrHoCaoVu.json', 'utf-8'));

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
  let cleanNumber = message.replace(/\s|-/g, '');

  if (cleanNumber.startsWith('0')) {
    cleanNumber = '+84' + cleanNumber.slice(1);
  }

  if (!cleanNumber.startsWith('+')) return false;

  const countryCode = countryCodes.find(code => cleanNumber.startsWith(code));
  if (!countryCode) {
    const genericPhone = /^\+\d{6,15}$/.test(cleanNumber);
    return genericPhone ? "unknown" : false;
  }

  const numberWithoutCode = cleanNumber.slice(countryCode.length);
  const digitRule = countryDigitRules[countryCode];
  if (!digitRule) return false;

  const length = numberWithoutCode.length;
  return length >= digitRule.min && length <= digitRule.max;
}

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

// ====== FLOW: NANG NGUC ======
async function sendNangNgucFlow(sender_psid) {
  console.log("🚀 Trigger Nâng Ngực Flow");

  // 1️⃣ Giới thiệu dịch vụ
  await messengerService.sendMessage(sender_psid, {
    text: `Dạ chào chị! Bên em chuyên Phẫu thuật nâng ngực bằng công nghệ hiện đại nhất, cam kết không đau, không để lại sẹo. Bác Vũ trực tiếp thực hiện.\n\nBên em áp dụng dao mổ siêu âm Ultrasonic Surgical Scalpel giúp:\n1. Không đau\n2. Không gây chảy máu\n3. Không tiết dịch\n4. Không gây co thắt bao xơ\n5. Không cần nghỉ dưỡng\n6. Không để lại sẹo`
  });

  // 2️⃣ Gửi ảnh feedback
  const feedbackImages = await getFeedbackImages("nguc");

  if (feedbackImages.length > 0) {
    console.log(`📸 Sending ${feedbackImages.length} feedback images`);
    for (const url of feedbackImages) {
      await messengerService.sendMessage(sender_psid, {
        attachment: { type: 'image', payload: { url, is_reusable: true } }
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } else {
    console.log("❌ Không tìm thấy ảnh feedback ngực");
  }

  // 3️⃣ Gửi bảng giá nâng ngực
  const bangGiaImage = await getBangGiaImage("banggia_nangnguc");

  if (bangGiaImage) {
    console.log("📄 Sending bảng giá nâng ngực");
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  } else {
    console.log("❌ Không tìm thấy ảnh bảng giá banggia_nangnguc");
  }

  // 4️⃣ Xin số điện thoại
  await new Promise(resolve => setTimeout(resolve, 1000));
  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

// ====== FOLLOW UP QUESTION HANDLER ======
async function handleFollowUp(sender_psid, textMessage) {
  if (!flowFullServices || !flowFullServices.faqs) {
    console.log("❌ flowFullServices.faqs not found");
    return;
  }

  const found = flowFullServices.faqs.find(item =>
    textMessage.includes(normalizeText(item.question))
  );

  if (found) {
    await messengerService.sendMessage(sender_psid, { text: found.answer });
  } else {
    handoffUsers.add(sender_psid);
    console.log(`🚀 Handoff triggered for ${sender_psid}`);
  }
}

// ====== MAIN WEBHOOK HANDLER ======
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(async entry => {
      const webhook_event = entry.messaging[0];
      const senderId = webhook_event.sender.id;

      if (!webhook_event.message || !webhook_event.message.text) return;
      const message = webhook_event.message.text.trim();
      const textMessage = normalizeText(message);

      // ====== KEYWORD DETECT ======
      if (textMessage.includes("nang nguc") || textMessage.includes("nâng ngực")) {
        return sendNangNgucFlow(senderId);
      }

      // ====== PHONE VALIDATION ======
      if (isValidPhoneNumber(message)) {
        completedUsers.add(senderId);
        return await messengerService.sendMessage(senderId, {
          text: "Dạ em ghi nhận thông tin rồi ạ! Bạn Ngân - trợ lý bác sĩ sẽ liên hệ ngay với mình nha chị!"
        });
      }

      // ====== FOLLOW UP QUESTION HANDLER ======
      await handleFollowUp(senderId, textMessage);
    });

    res.status(200).send("EVENT_RECEIVED");
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
