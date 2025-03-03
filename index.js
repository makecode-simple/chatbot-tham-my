const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config(); // Nạp biến môi trường từ file .env

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Cấu hình OpenAI API
const openai = new OpenAIApi(new Configuration({
    apiKey: OPENAI_API_KEY
}));

// Xử lý khi Facebook gửi dữ liệu đến Webhook
app.post('/webhook', (req, res) => {
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            let webhookEvent = entry.messaging[0];
            let senderId = webhookEvent.sender.id;

            if (webhookEvent.message) {
                handleMessage(senderId, webhookEvent.message);
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Xử lý tin nhắn từ người dùng
async function handleMessage(senderId, receivedMessage) {
    let response;

    if (receivedMessage.text) {
        response = await getChatGPTResponse(receivedMessage.text);
    } else {
        response = { "text": "Xin lỗi, tôi chỉ hiểu tin nhắn dạng văn bản!" };
    }

    sendMessage(senderId, response);
}

// Gọi API ChatGPT để tạo phản hồi
async function getChatGPTResponse(userMessage) {
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }]
        });

        return { "text": completion.data.choices[0].message.content };
    } catch (error) {
        console.error("Lỗi khi gọi OpenAI:", error);
        return { "text": "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn." };
    }
}

// Gửi tin nhắn phản hồi
async function sendMessage(senderId, response) {
    try {
        await axios.post(`https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
            recipient: { id: senderId },
            message: response
        });
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn: ", error.response ? error.response.data : error.message);
    }
}

// Cấu hình Webhook Verification
app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Chatbot đang chạy trên cổng ${PORT}`);
});
