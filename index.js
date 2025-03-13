// index.js - Full chatbot server, merge toàn bộ logic cũ và Cloudinary

const express = require("express");
const bodyParser = require("body-parser");
const messengerService = require("./messengerService");
const fs = require("fs");
const OpenAI = require("openai");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(bodyParser.json());

// ==== CONFIG GPT ====
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ==== CONFIG CLOUDINARY ====
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ==== LOAD DATA ====
const flowData = JSON.parse(fs.readFileSync("Flow_Full_Services_DrHoCaoVu.json"));
const chatbotServiceFlows = JSON.parse(fs.readFileSync("./data/chatbot-service-flows.json"));
const countryDigitRules = JSON.parse(fs.readFileSync("countryDigitRules.json"));
const countryCodes = Object.keys(countryDigitRules);

// ==== SESSION USERS ====
const completedUsers = new Set();
const handoffUsers = new Set();

// ====== GPT SENTIMENT ANALYSIS ======
async function analyzeSentimentWithGPT(message) {
  try {
    const prompt = `Bạn là chuyên gia phân tích cảm xúc khách hàng.\nHãy phân loại cảm xúc đoạn chat sau vào 1 trong 3 loại:\n- \"negative\"\n- \"neutral\"\n- \"positive\"\n\nĐoạn chat: \"${message}\"\n\nTrả lời chỉ 1 từ: negative, neutral, positive`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 5,
    });

    const sentiment = response.choices[0].message.content.trim().toLowerCase();
    console.log("🎯 GPT Sentiment:", sentiment);
    return sentiment;
  } catch (error) {
    console.error("❌ GPT Error:", error.message);
    return "neutral";
  }
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

// ====== CLOUDINARY FUNCTIONS ======
async function getFeedbackImages(serviceFolder) {
  try {
    const result = await cloudinary.search
      .expression(`folder:feedback/${serviceFolder} AND resource_type:image`)
      .sort_by('public_id', 'desc')
      .max_results(10)
      .execute();

    return result.resources.map(file => file.secure_url);
  } catch (error) {
    console.error('❌ Cloudinary fetch error:', error);
    return [];
  }
}

async function getBangGiaImage(folder) {
  try {
    const result = await cloudinary.search
      .expression(`folder:banggia/${folder} AND resource_type:image`)
      .sort_by('public_id', 'desc')
      .max_results(1)
      .execute();

    return result.resources[0]?.secure_url || null;
  } catch (error) {
    console.error('❌ Cloudinary fetch bảng giá error:', error);
    return null;
  }
}

// ====== LOGIC KIỂM TRA KẾT THÚC, PHÀN NÀN, ANGRY ======
function isEndConversation(message) {
  const normalizedMsg = normalizeText(message);
  const endKeywords = ["ok", "oke", "okie", "cam on", "thanks", "được rồi", "yes", "vâng"];
  return endKeywords.some(keyword => normalizedMsg.includes(keyword));
}

const complaintSynonyms = {
  "không hài lòng": ["ko hài lòng", "bất mãn", "k ok"],
  "dịch vụ kém": ["dịch vụ tệ", "dịch vụ không tốt"],
  "bực mình": ["ức chế", "chán ghê"],
  "phàn nàn": ["complain", "khiếu nại"],
  "gặp người tư vấn": ["gặp admin", "muốn nói chuyện với người"]
};

function isAngryCustomer(message) {
  const normalizedMsg = normalizeText(message);
  for (const key in complaintSynonyms) {
    if (normalizedMsg.includes(key)) return true;
    for (const synonym of complaintSynonyms[key]) {
      if (normalizedMsg.includes(synonym)) return true;
    }
  }
  return false;
}

function normalizeText(msg) {
  return msg?.toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/[!.,?~]/g, "").trim() || "";
}

// ====== SEND FLOW STEPS ======
async function sendFlowSteps(sender_psid, steps, parentService) {
  const feedbackFolders = ["mat", "mui", "nguc"];

  if (feedbackFolders.includes(parentService)) {
    const feedbackImages = await getFeedbackImages(parentService);
    if (feedbackImages.length > 0) {
      await messengerService.sendMessage(sender_psid, { text: "Dưới đây là feedback khách hàng thực tế bên em chị tham khảo thêm nha!" });
      for (const url of feedbackImages) {
        await messengerService.sendMessage(sender_psid, { attachment: { type: 'image', payload: { url, is_reusable: true } } });
      }
    }
  }

  for (const step of steps) {
    if (step.type === 'text') {
      await messengerService.sendMessage(sender_psid, { text: step.content });
    }
  }

  const bangGiaFolderMap = {
    "mui": "banggia_thammymui",
    "mat": "banggia_thammymat",
    "nguc": "banggia_nangnguc",
    "vungkin": "banggia_thammyvungkin",
    "damat": "banggiathammy_damat",
    "bung": "banggia_hutmobung",
    "cacdichvukhac": "banggia_cacdichvukhac"
  };

  const bangGiaFolder = bangGiaFolderMap[parentService];
  if (bangGiaFolder) {
    const bangGiaImage = await getBangGiaImage(bangGiaFolder);
    if (bangGiaImage) {
      await messengerService.sendMessage(sender_psid, { text: "Đây là bảng giá dịch vụ bên em chị tham khảo thêm nha!" });
      await messengerService.sendMessage(sender_psid, { attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } } });
    }
  }

  await messengerService.sendMessage(sender_psid, { text: "Chị để lại số điện thoại/Zalo để bên em tư vấn chi tiết hơn cho mình nha!" });
}

// ====== HANDLE POSTBACK PAYLOAD ======
function handlePostback(sender_psid, postback) {
  const payload = postback.payload;
  console.log(`📦 Postback payload nhận: ${payload}`);

  let foundFlow = false;
  chatbotServiceFlows.flows.forEach(service => {
    service.sub_flows.forEach(flow => {
      if (flow.payload === payload) {
        foundFlow = true;
        const parentServiceKey = normalizeText(service.parent_service.replace(/\s+/g, ""));
        sendFlowSteps(sender_psid, flow.steps, parentServiceKey);
      }
    });
  });

  if (!foundFlow) {
    messengerService.sendMessage(sender_psid, { text: "Dạ chị quan tâm dịch vụ nào bên em để em hỗ trợ thêm nha!" });
  }
}

// ====== WEBHOOK HANDLER ======
app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object === "page") {
    body.entry.forEach(async entry => {
      const webhook_event = entry.messaging[0];
      const senderId = webhook_event.sender.id;
      const message = webhook_event.message?.text?.trim();

      if (webhook_event.postback) {
        return handlePostback(senderId, webhook_event.postback);
      }

      if (!message) return;
      console.log(`💬 [${senderId}] ${message}`);

      if (handoffUsers.has(senderId)) {
        if (findFlow(message)) {
          handoffUsers.delete(senderId);
          await messengerService.sendMessage(senderId, { text: "Dạ chị cần tư vấn thêm dịch vụ đúng không ạ? Em hỗ trợ chị ngay nha!" });
        } else return;
      }

      if (isEndConversation(message)) {
        completedUsers.add(senderId);
        return await messengerService.sendMessage(senderId, { text: "Dạ em cảm ơn chị, chúc chị một ngày tốt lành ạ!" });
      }

      if (completedUsers.has(senderId)) {
        if (findFlow(message)) {
          completedUsers.delete(senderId);
          await messengerService.sendMessage(senderId, { text: "Dạ chị cần em hỗ trợ thêm dịch vụ nào ạ?" });
        } else if (isAngryCustomer(message) || (await analyzeSentimentWithGPT(message)) === "negative") {
          handoffUsers.add(senderId);
        } else return;
      }

      if (isAngryCustomer(message)) {
        handoffUsers.add(senderId);
        return await messengerService.sendMessage(senderId, { text: "Dạ em xin lỗi chị, em đã chuyển thông tin cho tư vấn viên hỗ trợ ngay ạ!" });
      }

      const sentiment = await analyzeSentimentWithGPT(message);
      if (sentiment === "negative") {
        handoffUsers.add(senderId);
        return await messengerService.sendMessage(senderId, { text: "Dạ em xin lỗi chị, bạn tư vấn viên sẽ hỗ trợ chị ngay ạ!" });
      }

      if (isValidPhoneNumber(message)) {
        completedUsers.add(senderId);
        return await messengerService.sendMessage(senderId, { text: "Dạ em ghi nhận thông tin rồi ạ! Bạn Ngân - trợ lý bác sĩ sẽ liên hệ ngay với mình nha chị!" });
      }

      const isEnglish = /^[A-Za-z0-9 ?!.]+$/.test(message);
      if (isEnglish) {
        return await messengerService.sendMessage(senderId, { text: "Hi, may I know which service you are interested in? Please leave your Zalo/Viber/WhatsApp so our assistant Ms. Ngan can contact you soon!" });
      }

      if (message.length < 3) {
        return await messengerService.sendMessage(senderId, { text: "Dạ chị nhắn rõ hơn giúp em ạ! Hoặc để lại số Zalo/Viber để được tư vấn nhanh nha chị!" });
      }

      const matchedFlow = findFlow(message);
      if (matchedFlow) {
        await messengerService.sendMessage(senderId, { text: matchedFlow.action_response });
        if (matchedFlow.next_step) {
          await messengerService.sendMessage(senderId, { text: matchedFlow.next_step });
        }
        return;
      }

      await messengerService.sendMessage(senderId, { text: "Dạ chị để lại SĐT/Zalo/Viber để bạn Ngân - trợ lý bác sĩ tư vấn chi tiết hơn cho chị nhé!" });
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

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

// ====== START SERVER ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
