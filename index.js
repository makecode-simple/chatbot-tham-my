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

// Lời chào mặc định khi khách mới nhắn tin hoặc nhắn chung chung
const greetingMessage = `Dạ chào chị, chị muốn tư vấn dịch vụ thẩm mỹ tạo hình nào dưới đây ạ:\n• Phẫu thuật nâng ngực/ tháo túi ngực/ bóc bao xơ\n• Tái tạo vú sau khi điều trị ung thư\n• Hút mỡ bụng, tạo hình thành bụng sau sinh\n• Tiểu phẫu cắt mí\n• Tiểu phẫu treo cung mày\n• Chỉnh mắt lỗi\n• Nâng mũi tái cấu trúc/ nâng mũi sụn sườn\n• Chỉnh mũi lỗi\n• Phẫu thuật căng da mặt\n• Hút mỡ bụng/tay/ đùi/ lưng\n• Thẩm mỹ vùng kín\n• Căng da mặt toàn diện\n• Căng chỉ da mặt/ PRP trẻ hóa\n• Độn thái dương/ độn cằm\n• Hút mỡ tiêm lên mặt`;

// Các từ khoá kích hoạt gửi list dịch vụ và hỏi thông tin địa chỉ
const genericTriggers = [
    "tư vấn", "dịch vụ", "giới thiệu", "thẩm mỹ", "có gì", "muốn biết dịch vụ",
    "hello", "help me", "i need more information", "tư vấn giúp", "muốn làm đẹp", "không đau",
    "địa chỉ", "phòng khám ở đâu", "đ/c", "lịch khám", "bác khám ở đâu", "phẫu thuật chỗ nào"
];

// Webhook nhận tin nhắn từ Messenger
app.post("/webhook", async (req, res) => {
    const body = req.body;

    if (body.object === "page") {
        body.entry.forEach(async function(entry) {
            const webhook_event = entry.messaging[0];
            const senderId = webhook_event.sender.id;

            // Kiểm tra có message và text hay không
            if (webhook_event.message && webhook_event.message.text) {
                const message = webhook_event.message.text;

                console.log("Received message:", message);

                const lowerCaseMessage = message.toLowerCase();

                // Nếu khách hỏi địa chỉ hoặc thông tin cơ bản
                const addressTriggers = ["địa chỉ", "phòng khám ở đâu", "đ/c", "lịch khám", "bác khám ở đâu", "chỗ khám ở đâu?", "văn phòng bác sĩ"];
                const isAddress = addressTriggers.some(trigger => lowerCaseMessage.includes(trigger));

                if (isAddress) {
                    const addressInfo = `Dạ bác Vũ hiện tư vấn tại 134 Hà Huy Tập, Phú Mỹ Hưng, Quận 7 ạ.\n✅ Phẫu thuật thực hiện tại bệnh viện quốc tế Nam Sài Gòn.\n🎯 Hiện tại bác Vũ chỉ nhận khám và tư vấn theo lịch hẹn trước nha chị!`;
                    await messengerService.sendMessage(senderId, { text: addressInfo });
                    return;
                }

                // Nếu khách nhắn lần đầu hoặc câu chung chung
                const isGeneric = genericTriggers.some(trigger => lowerCaseMessage.includes(trigger));

                if (isGeneric) {
                    await messengerService.sendMessage(senderId, { text: greetingMessage });
                    return;
                }

                // Check flow
                const matchedFlow = findFlow(message);
                if (matchedFlow) {
                    let response = matchedFlow.action_response;

                    // Gửi phản hồi chính
                    await messengerService.sendMessage(senderId, { text: response });

                    // Next step nếu có và không rỗng
                    if (matchedFlow.next_step && matchedFlow.next_step.trim() !== "") {
                        await messengerService.sendMessage(senderId, { text: matchedFlow.next_step });
                    }
                } else {
                    // Nếu không khớp flow, đẩy qua ChatGPT
                    const chatGPTResponse = await chatGPTFallback(message);
                    await messengerService.sendMessage(senderId, { text: chatGPTResponse });
                }
            } else {
                console.log("Sự kiện không phải tin nhắn, bỏ qua!");
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
