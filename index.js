const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const axios = require("axios");
const { OpenAI } = require("openai");
const cloudinary = require("cloudinary").v2;

dotenv.config();

const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

// 🛠️ Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 🔗 Cấu hình OpenAI API
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// 🧠 Gọi API ChatGPT để xử lý câu hỏi ngoài kịch bản
async function getChatGPTResponse(userMessage) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }]
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("❌ Lỗi khi gọi OpenAI:", error);
        return "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.";
    }
}

// 📂 Hàm lấy danh sách ảnh từ thư mục feedback/{dịch vụ}
async function getImagesFromFolder(service) {
    try {
        const folderPath = `feedback/${service}`;
        const result = await cloudinary.search
            .expression(`folder:${folderPath}/*`)
            .sort_by("created_at", "desc")
            .max_results(10)
            .execute();

        return result.resources.map(img => img.secure_url);
    } catch (error) {
        console.error("❌ Lỗi lấy danh sách ảnh:", error);
        return [];
    }
}

// 📤 Gửi ảnh feedback
async function sendFeedbackImages(psid, service) {
    let images = await getImagesFromFolder(service);

    if (images.length > 0) {
        for (let img of images) {
            await sendImageToUser(psid, img);
        }
    } else {
        await sendTextMessage(psid, `Xin lỗi, hiện chưa có ảnh feedback cho dịch vụ ${service}.`);
    }
}

// 📩 Gửi tin nhắn hình ảnh
async function sendImageToUser(psid, imageUrl) {
    let request_body = {
        recipient: { id: psid },
        message: { attachment: { type: "image", payload: { url: imageUrl, is_reusable: true } } }
    };

    await callSendAPI(request_body);
}

// 📬 Gửi tin nhắn văn bản
async function sendTextMessage(psid, text) {
    let request_body = {
        recipient: { id: psid },
        message: { text: text }
    };

    await callSendAPI(request_body);
}

// 🔗 Gửi tin nhắn API Facebook
async function callSendAPI(request_body) {
    try {
        await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, request_body);
    } catch (error) {
        console.error("❌ Lỗi gửi tin nhắn:", error.response ? error.response.data : error.message);
    }
}

// 🔥 Xử lý tin nhắn từ khách hàng
app.post("/webhook", async (req, res) => {
    let body = req.body;

    if (body.object === "page") {
        body.entry.forEach(async function(entry) {
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;

            if (webhook_event.message && webhook_event.message.text) {
                let message = webhook_event.message.text.toLowerCase();

                // 🎯 LUỒNG 1: TƯ VẤN NÂNG NGỰC
                if (
                    message.includes("tư vấn nâng ngực") || 
                    message.includes("dịch vụ nâng ngực không đau") || 
                    message.includes("nâng ngực bằng dao siêu âm") ||
                    message.includes("dao ultrasonic surgical scalpel") ||
                    message.includes("nâng ngực không cần nghỉ dưỡng")
                ) {
                    let responseText = `Dạ chào chị, xin phép em giới thiệu về phương pháp phẫu thuật NÂNG NGỰC KHÔNG ĐAU bằng dao mổ siêu âm Ultrasonic Surgical Scalpel chị xem qua ạ.\n\n` +
                        `🔹 Dao Ultrasonic Surgical Scalpel giúp bác sĩ tạo khoang ngực không chảy máu, giảm đau sau phẫu thuật đến 90%, lành thương nhanh, không gây biến chứng.\n` +
                        `🔹 Thời gian nghỉ dưỡng rất ít, chỉ sau 6-12H chị có thể sinh hoạt bình thường, không cần nghỉ dưỡng.\n` +
                        `🔹 Phẫu thuật KHÔNG ĐẶT ỐNG DẪN LƯU, KHÔNG DÙNG THÊM THUỐC GIẢM ĐAU HAY KHÁNG SINH.\n` +
                        `🔹 Phương pháp này đạt được 6 tiêu chí: Không đau - Không chảy máu - Không tiết dịch - Không co thắt bao xơ - Không nghỉ dưỡng - Không để lại sẹo.`;

                    await sendTextMessage(sender_psid, responseText);
                    await sendFeedbackImages(sender_psid, "nangnguc");
                }

                // 🎯 LUỒNG 2: VIỆT KIỀU HỎI VỀ THỜI GIAN PHẪU THUẬT
                else if (
                    message.includes("chị sắp bay về nước") || 
                    message.includes("thời gian làm có lâu không") || 
                    message.includes("mua vé máy bay đi về") || 
                    message.includes("đi máy bay có ảnh hưởng không") ||
                    message.includes("chị ở bển về quan tâm thời gian")
                ) {
                    let responseText = `Dạ chị ơi, sau phẫu thuật nâng ngực chị chỉ cần nằm viện tối đa 12 tiếng. Thường thì sau 6-10 tiếng chị đã khỏe, đi lại nhẹ nhàng bình thường và có thể xuất viện sớm hơn.\n\n` +
                        `🔹 Sau phẫu thuật KHÔNG cần uống giảm đau, KHÔNG cần đặt ống dẫn lưu, KHÔNG cần nghỉ dưỡng.\n` +
                        `🔹 Bác sĩ hỗ trợ quay video full 100% ca mổ, sử dụng dao siêu âm mới 100%, khách ký tên lên hộp dao trước khi mổ.\n` +
                        `🔹 Chị có thể bay nội địa sau 2 ngày, bay quốc tế sau 7 ngày ạ.`;

                    await sendTextMessage(sender_psid, responseText);
                }

                // 🧠 HỎI CHATGPT KHI KHÔNG CÓ TRONG KỊCH BẢN
                else {
                    let chatgptResponse = await getChatGPTResponse(message);
                    await sendTextMessage(sender_psid, chatgptResponse);
                }
            }
        });

        res.status(200).send("EVENT_RECEIVED");
    } else {
        res.sendStatus(404);
    }
});

// 🔥 Xác thực Webhook Facebook
app.get("/webhook", (req, res) => {
    if (req.query["hub.mode"] === "subscribe" && req.query["hub.verify_token"] === VERIFY_TOKEN) {
        console.log("WEBHOOK VERIFIED!");
        res.status(200).send(req.query["hub.challenge"]);
    } else {
        res.status(403).send("Forbidden");
    }
});

// 🌍 Chạy server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
});
