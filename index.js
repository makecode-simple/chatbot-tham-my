// Import các module cần thiết
const express = require("express");
const bodyParser = require("body-parser");
const messengerService = require("./messengerService");
const cloudinaryService = require("./cloudinaryService");
const fs = require("fs");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// Load JSON flow khi server khởi động
const flowData = JSON.parse(fs.readFileSync("Flow_Full_Services_DrHoCaoVu.json"));

// Hàm tìm flow phù hợp dựa vào trigger
function findFlow(userMessage) {
    userMessage = userMessage.toLowerCase();
    return flowData.find(item => {
        const triggers = item.sub_service.toLowerCase() + " " + item.sub_topic.toLowerCase();
        return triggers.includes(userMessage);
    });
}

// Hàm gọi ChatGPT fallback
async function chatGPTFallback(message) {
    const apiKey = process.env.OPENAI_API_KEY;
    const endpoint = "https://api.openai.com/v1/chat/completions";

    const prompt = `Bạn là trợ lý tư vấn thẩm mỹ Dr Hồ Cao Vũ. Hãy tư vấn thân thiện, chuyên nghiệp. Nếu khách hỏi tiếng Anh hoặc ngoài phạm vi, xin SĐT/Zalo để hỗ trợ viên liên hệ.`;

    const data = {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: message }
        ],
        max_tokens: 300
    };

    try {
        const res = await axios.post(endpoint, data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            }
        });

        return res.data.choices[0].message.content;
    } catch (error) {
        console.error("ChatGPT Error:", error);
        return "Dạ xin lỗi chị, em chưa có thông tin rõ. Chị để lại SĐT/Zalo để bên em tư vấn kỹ hơn nha!";
    }
}

// Webhook nhận tin nhắn từ Messenger
app.post("/webhook", async (req, res) => {
    const body = req.body;

    if (body.object === "page") {
        body.entry.forEach(async function(entry) {
            const webhook_event = entry.messaging[0];
            const senderId = webhook_event.sender.id;
            const message = webhook_event.message.text;

            console.log("Received message:", message);

            // Check flow
            const matchedFlow = findFlow(message);
            if (matchedFlow) {
                let response = matchedFlow.action_response;

                // Gửi phản hồi chính
                await messengerService.sendMessage(senderId, { text: response });

                // Next step nếu có
                if (matchedFlow.next_step) {
                    await messengerService.sendMessage(senderId, { text: matchedFlow.next_step });
                }
            } else {
                // Nếu không khớp flow, đẩy qua ChatGPT
                const chatGPTResponse = await chatGPTFallback(message);
                await messengerService.sendMessage(senderId, { text: chatGPTResponse });
            }
        });

        res.status(200).send("EVENT_RECEIVED");
    } else {
        res.sendStatus(404);
    }
});

// Endpoint xác thực webhook
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

// Khởi chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
