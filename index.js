// Import các module cần thiết
const express = require("express");
const bodyParser = require("body-parser");
const messengerService = require("./messengerService");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// Load JSON flow khi server khởi động
const flowData = JSON.parse(fs.readFileSync("Flow_Full_Services_DrHoCaoVu.json"));

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Hàm tìm flow phù hợp dựa vào trigger
function findFlow(userMessage) {
    userMessage = userMessage.toLowerCase();
    return flowData.find(item => {
        const triggers = item.sub_service.toLowerCase() + " " + item.sub_topic.toLowerCase();
        return triggers.includes(userMessage);
    });
}

// Hàm gọi ChatGPT fallback với kiểm soát thông tin
async function chatGPTFallback(message) {
    const apiKey = process.env.OPENAI_API_KEY;
    const endpoint = "https://api.openai.com/v1/chat/completions";

    const prompt = `
    Bạn là trợ lý tư vấn thẩm mỹ Dr Hồ Cao Vũ.  
    Trả lời thân thiện, chuyên nghiệp, ngắn gọn, dễ hiểu.  
    Tuyệt đối KHÔNG suy luận hoặc tự chế thông tin không có trong dữ liệu cung cấp.  
    Chỉ trả lời dựa trên dữ liệu đã được huấn luyện hoặc cung cấp bên dưới.

    Nếu khách hỏi dịch vụ nâng ngực, mông, mắt, mũi, căng da mặt... hoặc địa chỉ, luôn trả lời theo nội dung:
    - Dạ bác Vũ hiện tư vấn tại 134 Hà Huy Tập, Phú Mỹ Hưng, Quận 7. Phẫu thuật tại bệnh viện quốc tế Nam Sài Gòn.
    - Các dịch vụ chính gồm: Nâng ngực, hút mỡ bụng, nâng mũi, cắt mí, thẩm mỹ vùng kín, tái tạo vú sau điều trị ung thư...

    Nếu không tìm thấy câu hỏi nằm trong phạm vi dịch vụ hoặc thông tin, hãy hỏi lại:
    - "Dạ chị đang hỏi về dịch vụ gì ạ? Chị có thể nhắn rõ hơn giúp em không?"

    Hoặc xin số điện thoại:
    - "Dạ để rõ hơn, chị để lại số điện thoại/Zalo, bên em tư vấn kỹ hơn nha!"

    Nếu khách viết tắt hoặc nhắn không rõ:
    - "Dạ do chị viết tắt, em chưa rõ lắm. Chị nhắn giúp em chi tiết hơn nha!"
    `;

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
        return "Dạ xin lỗi chị, em chưa rõ câu hỏi. Chị để lại số điện thoại/Zalo để em tư vấn kỹ hơn nha!";
    }
}

// Lời chào mặc định khi khách mới nhắn tin hoặc nhắn chung chung
const greetingMessage = `Dạ chào chị, chị muốn tư vấn dịch vụ thẩm mỹ tạo hình nào dưới đây ạ:\n• Phẫu thuật nâng ngực/ tháo túi ngực/ bóc bao xơ\n• Tái tạo vú sau khi điều trị ung thư\n• Hút mỡ bụng, tạo hình thành bụng sau sinh\n• Tiểu phẫu cắt mí\n• Tiểu phẫu treo cung mày\n• Chỉnh mắt lỗi\n• Nâng mũi tái cấu trúc/ nâng mũi sụn sườn\n• Chỉnh mũi lỗi\n• Phẫu thuật căng da mặt\n• Hút mỡ bụng/tay/ đùi/ lưng\n• Thẩm mỹ vùng kín\n• Căng da mặt toàn diện\n• Căng chỉ da mặt/ PRP trẻ hóa\n• Độn thái dương/ độn cằm\n• Hút mỡ tiêm lên mặt`;

// Các từ khoá kích hoạt gửi list dịch vụ và hỏi thông tin địa chỉ
const genericTriggers = [
    "tư vấn", "dịch vụ", "giới thiệu", "thẩm mỹ", "có gì", "muốn biết dịch vụ",
    "hello", "help me", "i need more information", "tư vấn giúp", "muốn làm đẹp", "không đau", "hi", "chị cần tư vấn",
	"cho chị thông tin dịch vụ bên mình đi em", "d.v bên mình sao em", "tu van dich vu", "co nhung dich vu tham my nao"
];

const addressTriggers = [
    "địa chỉ", "phòng khám ở đâu", "đ/c", "dc o dau", "d/c ở đâu", "lịch khám", "nơi bác khám thẩm mỹ ở đâu", "chỗ nào khám", "chỗ khám ở đâu", "where is the address", "address of dr Vu", "văn phòng bác sĩ", "office của bác sĩ ở đâu", "phòng mạch của bác sĩ vũ ở đâu", "dc o dau", "d.c o dau vay"
];

// Webhook nhận tin nhắn từ Messenger
app.post("/webhook", async (req, res) => {
    const body = req.body;

    if (body.object === "page") {
        body.entry.forEach(async function (entry) {
            const webhook_event = entry.messaging[0];
            const senderId = webhook_event.sender.id;

            // Kiểm tra có message và text hay không
            if (webhook_event.message && webhook_event.message.text) {
                const message = webhook_event.message.text.trim();
                const lowerCaseMessage = message.toLowerCase();

                console.log("Received message:", message);

                // Nếu câu quá ngắn hoặc vô nghĩa
                if (message.length < 3) {
                    await messengerService.sendMessage(senderId, {
                        text: "Dạ chị hỏi rõ hơn giúp em với ạ! Hoặc chị để lại số điện thoại/Zalo để em tư vấn kỹ hơn nha!"
                    });
                    return;
                }

				// Kiểm tra địa chỉ
					if (addressTriggers.some(trigger => lowerCaseMessage.includes(trigger))) {
						const addressInfo = `Dạ bác Vũ hiện tư vấn tại 134 Hà Huy Tập, Phú Mỹ Hưng, Quận 7.
					✅ Phẫu thuật thực hiện tại bệnh viện quốc tế Nam Sài Gòn.
					🎯 Hiện tại bác Vũ chỉ nhận khám và tư vấn theo lịch hẹn trước nha chị!`;

						await messengerService.sendMessage(senderId, { text: addressInfo });

						// Kết thúc xử lý ngay, không gửi thêm ChatGPT hay flow gì nữa
						return;
					}

                // Kiểm tra generic trigger (hỏi chung dịch vụ)
                if (genericTriggers.some(trigger => lowerCaseMessage.includes(trigger))) {
                    await messengerService.sendMessage(senderId, { text: greetingMessage });
                    return;
                }

                // Kiểm tra flow dịch vụ
                const matchedFlow = findFlow(message);

                if (matchedFlow) {
                    await messengerService.sendMessage(senderId, { text: matchedFlow.action_response });

                    if (matchedFlow.next_step && matchedFlow.next_step.trim() !== "") {
                        await messengerService.sendMessage(senderId, { text: matchedFlow.next_step });
                    }
                    return;
                }

                // Nếu không có gì khớp, fallback ChatGPT
                const chatGPTResponse = await chatGPTFallback(message);
                await messengerService.sendMessage(senderId, { text: chatGPTResponse });
            } else {
                console.log("Sự kiện không phải tin nhắn, bỏ qua!");
            }
        });

        res.status(200).send("EVENT_RECEIVED");
    } else {
        res.sendStatus(404);
    }
});


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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));