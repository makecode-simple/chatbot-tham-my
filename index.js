const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { OpenAI } = require('openai'); // Chỉ import OpenAI một lần
require('dotenv').config(); // Nạp biến môi trường từ file .env
const cloudinary = require('cloudinary').v2;
const bodyParser = require('body-parser');
const axios = require('axios');
const { OpenAI } = require('openai'); // Chỉ import OpenAI một lần

// Cấu hình Cloudinary từ biến môi trường
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Kiểm tra nếu server đang hoạt động
app.get("/", (req, res) => {
    res.send("Chatbot đang hoạt động!");
});

// Xử lý xác thực Webhook của Facebook
app.get("/webhook", (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token === VERIFY_TOKEN) {
        console.log("WEBHOOK VERIFIED!");
        res.status(200).send(challenge);
    } else {
        res.status(403).send("Forbidden");
    }
});

// Cấu hình OpenAI API
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

// Gọi API ChatGPT để tạo phản hồi
async function getChatGPTResponse(userMessage) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }]
        });

        return { "text": response.choices[0].message.content };
    } catch (error) {
        console.error("Lỗi khi gọi OpenAI:", error);
        return { "text": "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn." };
    }
}

// Lắng nghe tin nhắn từ Facebook Messenger
app.post('/webhook', async (req, res) => {
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(async (entry) => {
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;

            if (webhook_event.message) {
                let userMessage = webhook_event.message.text;
                let botResponse = await getChatGPTResponse(userMessage);

                sendMessage(sender_psid, botResponse.text);
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Hàm gửi tin nhắn về Messenger
function sendMessage(sender_psid, response) {
    let request_body = {
        recipient: { id: sender_psid },
        message: { text: response }
    };

    axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, request_body)
        .then((res) => {
            console.log("Message sent!", res.data);
        })
        .catch(error => {
            console.error("Lỗi khi gửi tin nhắn:", error.response ? error.response.data : error);
        });
}

// Ghi log phản hồi từ ChatGPT
async function processMessage(sender_psid, userMessage) {
    console.log(`Người dùng (${sender_psid}) gửi: ${userMessage}`);

    try {
        const botResponse = await getChatGPTResponse(userMessage);
        console.log(`ChatGPT phản hồi: ${botResponse.text}`);

        sendMessage(sender_psid, botResponse.text);
    } catch (error) {
        console.error("Lỗi xử lý tin nhắn:", error);
        sendMessage(sender_psid, "Xin lỗi, tôi gặp sự cố khi phản hồi.");
    }
}
// 🖼️ Hàm upload ảnh lên thư mục bất kỳ
async function uploadImage(imagePath, folderName = "dich-vu") {
    try {
        const result = await cloudinary.uploader.upload(imagePath, { folder: folderName });
        console.log(`Ảnh đã upload vào thư mục '${folderName}':`, result.secure_url);
        return result.secure_url;
    } catch (error) {
        console.error("Lỗi upload ảnh:", error);
        return null;
    }
}

// 📂 Hàm lấy danh sách ảnh trong thư mục bất kỳ
async function getImages(folderName = "dich-vu") {
    try {
        const result = await cloudinary.api.resources({ type: 'upload', prefix: `${folderName}/` });
        const images = result.resources.map(file => file.secure_url);
        
        if (images.length === 0) {
            console.log(`Không tìm thấy ảnh nào trong thư mục '${folderName}'.`);
        } else {
            console.log(`Danh sách ảnh trong thư mục '${folderName}':`, images);
        }
        
        return images;
    } catch (error) {
        console.error("Lỗi lấy danh sách ảnh:", error);
        return [];
    }
}

module.exports = { uploadImage, getImages };
// Khởi chạy server
app.listen(PORT, () => {
    console.log(`Chatbot đang chạy trên cổng ${PORT}`);
});
