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
const DATA_FOLDER = './data/';
const chatbotServiceFlows = JSON.parse(fs.readFileSync(`${DATA_FOLDER}chatbot-service-flows.json`, 'utf-8'));
const countryDigitRules = JSON.parse(fs.readFileSync(`${DATA_FOLDER}countryDigitRules.json`, 'utf-8'));
const countryCodes = Object.keys(countryDigitRules);
const flowFullServices = JSON.parse(fs.readFileSync(`${DATA_FOLDER}Flow_Full_Services_DrHoCaoVu.json`, 'utf-8'));

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

// ====== CLOUDINARY FOLDER MAPS ======
const feedbackFolderMap = {
  "nguc": "nguc",
  "mui": "mui",
  "mat": "mat",
  "bung": "bung",
  "vungkin": "vungkin",
  "damat": "damat",
  "cacdichvu": "cacdichvu"
};

const bangGiaFileMap = {
  "nguc": "banggia_nangnguc",
  "mui": "banggia_thammymui",
  "mat": "banggia_thammymat",
  "bung": "banggia_hutmobung",
  "vungkin": "banggia_thammyvungkan",
  "damat": "banggiathammy_damat",
  "cacdichvu": "banggia_cacdichvukhac"
};

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

// ====== SEND FLOW STEPS ======
async function sendFlowSteps(sender_psid, steps, parentService) {
  console.log(`📝 sendFlowSteps: parentService = ${parentService}`);

  // (1) Gửi text giới thiệu kỹ thuật (steps)
  for (const step of steps) {
    if (step.type === 'text') {
      await messengerService.sendMessage(sender_psid, { text: step.content });
    }
  }

  // (2) Gửi toàn bộ ảnh feedback NGAY LẬP TỨC
  const feedbackFolder = feedbackFolderMap[parentService];
  console.log(`📂 feedbackFolder = ${feedbackFolder}`);

  if (feedbackFolder) {
    const feedbackImages = await getFeedbackImages(feedbackFolder);
    if (feedbackImages.length > 0) {
      for (const url of feedbackImages) {
        await messengerService.sendMessage(sender_psid, {
          attachment: { type: 'image', payload: { url, is_reusable: true } }
        });
      }
    }
  }

  // (3) Delay 1 giây rồi gửi ảnh bảng giá
  await new Promise(resolve => setTimeout(resolve, 1000));

  const bangGiaPublicId = bangGiaFileMap[parentService];
  console.log(`📄 bangGiaPublicId = ${bangGiaPublicId}`);

  if (bangGiaPublicId) {
    const bangGiaImage = await getBangGiaImage(bangGiaPublicId);
    if (bangGiaImage) {
      await messengerService.sendMessage(sender_psid, {
        attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
      });
    }
  }

  // (4) Gửi text xin số điện thoại/Zalo/Viber
  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

// ====== FOLLOW UP QUESTION HANDLER ======
async function handleFollowUp(sender_psid, textMessage) {
  const found = flowFullServices.faqs.find(item => textMessage.includes(normalizeText(item.question)));

  if (found) {
    await messengerService.sendMessage(sender_psid, { text: found.answer });
  } else {
    handoffUsers.add(sender_psid);
    console.log(`🚀 Handoff triggered for ${sender_psid}`);
  }
}

// ====== HANDLE POSTBACK ======
function handlePostback(sender_psid, postback) {
  const payload = postback.payload;
  console.log(`📦 Postback payload nhận: ${payload}`);

  let foundFlow = false;

  chatbotServiceFlows.flows.forEach(service => {
    service.sub_flows.forEach(flow => {
      if (flow.payload === payload) {
        foundFlow = true;
        const parentServiceKey = normalizeText(service.parent_service.replace(/\s+/g, ''));
        sendFlowSteps(sender_psid, flow.steps, parentServiceKey);
      }
    });
  });

  if (!foundFlow) {
    messengerService.sendMessage(sender_psid, {
      text: "Dạ chị quan tâm dịch vụ nào bên em để em hỗ trợ thêm nha!"
    });
  }
}

// ====== MAIN WEBHOOK HANDLER ======
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(async entry => {
      const webhook_event = entry.messaging[0];
      const senderId = webhook_event.sender.id;

      if (webhook_event.postback) {
        handlePostback(senderId, webhook_event.postback);
        return;
      }

      if (!webhook_event.message || !webhook_event.message.text) return;
      const message = webhook_event.message.text.trim();
      const textMessage = normalizeText(message);

// ====== KEYWORD DETECT ======

// Ngực
if (
  textMessage.includes("nang nguc") || textMessage.includes("nâng ngực") ||
  textMessage.includes("thao tui nguc") || textMessage.includes("tháo túi ngực") ||
  textMessage.includes("boc bao xo") || textMessage.includes("bóc bao xơ")
) {
  return sendFlowSteps(senderId, chatbotServiceFlows.flows.find(s => normalizeText(s.parent_service) === "nguc").sub_flows[0].steps, "nguc");
}

// Mũi
if (
  textMessage.includes("nang mui") || textMessage.includes("nâng mũi") ||
  textMessage.includes("chinh mui loi") || textMessage.includes("chỉnh mũi lỗi")
) {
  return sendFlowSteps(senderId, chatbotServiceFlows.flows.find(s => normalizeText(s.parent_service) === "mui").sub_flows[0].steps, "mui");
}

// Mắt
if (
  textMessage.includes("cat mi") || textMessage.includes("cắt mí") ||
  textMessage.includes("treo cung may") || textMessage.includes("treo cung mày") ||
  textMessage.includes("chinh mat loi") || textMessage.includes("chỉnh mắt lỗi")
) {
  return sendFlowSteps(senderId, chatbotServiceFlows.flows.find(s => normalizeText(s.parent_service) === "mat").sub_flows[0].steps, "mat");
}

// Bụng
if (
  textMessage.includes("hut mo bung") || textMessage.includes("hút mỡ bụng") ||
  textMessage.includes("tao hinh bung") || textMessage.includes("tạo hình thành bụng")
) {
  return sendFlowSteps(senderId, chatbotServiceFlows.flows.find(s => normalizeText(s.parent_service) === "bung").sub_flows[0].steps, "bung");
}

// Vùng kín
if (
  textMessage.includes("tham my vung kin") || textMessage.includes("thẩm mỹ vùng kín")
) {
  return sendFlowSteps(senderId, chatbotServiceFlows.flows.find(s => normalizeText(s.parent_service) === "vungkin").sub_flows[0].steps, "vungkin");
}

// Da mặt
if (
  textMessage.includes("cang da mat") || textMessage.includes("căng da mặt") ||
  textMessage.includes("cang chi") || textMessage.includes("căng chỉ") ||
  textMessage.includes("prp") || textMessage.includes("tre hoa") || textMessage.includes("trẻ hóa") ||
  textMessage.includes("don thai duong") || textMessage.includes("độn thái dương") ||
  textMessage.includes("don cam") || textMessage.includes("độn cằm") ||
  textMessage.includes("hut mo tiem mat") || textMessage.includes("hút mỡ tiêm lên mặt")
) {
  return sendFlowSteps(senderId, chatbotServiceFlows.flows.find(s => normalizeText(s.parent_service) === "damat").sub_flows[0].steps, "damat");
}

// Các dịch vụ khác
if (
  textMessage.includes("dich vu khac") || textMessage.includes("dịch vụ khác") ||
  textMessage.includes("cham soc body") || textMessage.includes("chăm sóc body") ||
  textMessage.includes("triet long") || textMessage.includes("triệt lông") ||
  textMessage.includes("giam beo") || textMessage.includes("giảm béo")
) {
  return sendFlowSteps(senderId, chatbotServiceFlows.flows.find(s => normalizeText(s.parent_service) === "cacdichvu").sub_flows[0].steps, "cacdichvu");
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
