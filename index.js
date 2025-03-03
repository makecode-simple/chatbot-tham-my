const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { OpenAI } = require('openai'); // Chỉ import OpenAI một lần
require('dotenv').config(); // Nạp biến môi trường từ file .env

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
        .then(() => console.log("Message sent!"))
        .catch(error => console.error("Lỗi khi gửi tin nhắn:", error.response ? error.response.data : error));
}

// Khởi chạy server
app.listen(PORT, () => {
    console.log(`Chatbot đang chạy trên cổng ${PORT}`);
});
