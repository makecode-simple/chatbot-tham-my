const express = require("express");
const bodyParser = require("body-parser");
const { getImages } = require("./cloudinaryService");
const { sendMessage, getChatGPTResponse } = require("./messengerService");
const request = require("request");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// 🎯 Kịch bản phản hồi
const scripts = {
    "nangnguc": {
        text: `Dạ chào chị, xin phép em giới thiệu về phương pháp phẫu thuật **NÂNG NGỰC KHÔNG ĐAU** bằng dao mổ siêu âm Ultrasonic Surgical Scalpel chị xem qua ạ.\n\n
        🔹 Dao Ultrasonic Surgical Scalpel giúp bác sĩ tạo khoang ngực không chảy máu, giảm đau sau phẫu thuật đến 90%.\n
        🔹 Thời gian nghỉ dưỡng rất ít, chỉ sau **6-12H** chị có thể sinh hoạt bình thường.\n
        🔹 **Không đau - Không chảy máu - Không tiết dịch - Không để lại sẹo**.\n
        ✅ Em gửi chị ảnh feedback của khách hàng nhé!`,
        images: "nangnguc"
    },
    "hutmo": {
        text: `Dạ chị ơi, đây là thông tin về **HÚT MỠ KHÔNG ĐAU** ạ! 💪\n\n
        🔹 Công nghệ **Body Jet** hiện đại, hạn chế xâm lấn, **không gây đau, không để lại sẹo**.\n
        🔹 Chỉ cần **1 lần duy nhất**, loại bỏ mỡ thừa hiệu quả, không tái phát.\n
        🔹 Chị có thể đi lại bình thường sau **6-8 giờ** mà không cần nghỉ dưỡng.\n
        ✅ Em gửi chị ảnh feedback khách hàng nhé!`,
        images: "hutmo"
    }
};

// 📌 Gửi tất cả ảnh cùng lúc bằng batch request
async function sendImagesBatch(senderId, images) {
    if (images.length === 0) return;

    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
    let attachmentIds = [];

    // 1️⃣ **Upload ảnh lên Facebook Messenger trước**
    for (let url of images) {
        try {
            let uploadResponse = await new Promise((resolve, reject) => {
                request({
                    uri: `https://graph.facebook.com/v17.0/me/message_attachments`,
                    qs: { access_token: PAGE_ACCESS_TOKEN },
                    method: "POST",
                    json: {
                        message: {
                            attachment: {
                                type: "image",
                                payload: { url: url, is_reusable: true }
                            }
                        }
                    }
                }, (err, res, body) => {
                    if (err || !body.attachment_id) {
                        console.error("❌ Lỗi upload ảnh:", err || body);
                        reject(err || body);
                    } else {
                        console.log(`✅ Ảnh uploaded: ${body.attachment_id}`);
                        resolve(body.attachment_id);
                    }
                });
            });

            attachmentIds.push(uploadResponse);
        } catch (error) {
            console.error("❌ Không thể upload ảnh:", error);
        }
    }

    if (attachmentIds.length === 0) return;

    // 2️⃣ **Gửi tất cả ảnh bằng ID trong một tin nhắn**
    let attachments = attachmentIds.map(id => ({
        type: "image",
        payload: { attachment_id: id }
    }));

    let requestBody = {
        recipient: { id: senderId },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "media",
                    elements: attachments
                }
            }
        }
    };

    request({
        uri: `https://graph.facebook.com/v17.0/me/messages`,
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: "POST",
        json: requestBody
    }, (err, res, body) => {
        if (err) {
            console.error("❌ Lỗi gửi album ảnh:", err);
        } else {
            console.log("✅ Gửi album ảnh thành công:", body);
        }
    });
}

// 📌 Xử lý tin nhắn và gửi ảnh nhóm
async function handleMessage(senderId, userMessage) {
    let response = { text: "Dạ chị ơi, em chưa hiểu câu hỏi của chị. Chị có thể hỏi lại giúp em nha! 😊" };
    let service = "";

    if (userMessage.includes("nâng ngực")) {
        service = "nangnguc";
    } else if (userMessage.includes("hút mỡ")) {
        service = "hutmo";
    }

    if (service && scripts[service]) {
        response.text = scripts[service].text;
        await sendMessage(senderId, response); // Gửi text trước

        try {
            // 🖼️ Lấy ảnh feedback từ Cloudinary
            const images = await getImages(scripts[service].images);

            if (images && images.length > 0) {
                console.log(`📸 Tìm thấy ${images.length} ảnh, gửi đi...`);
                await sendImagesBatch(senderId, images); // Gửi nhóm ảnh
            } else {
                console.warn("⚠️ Không tìm thấy ảnh để gửi.");
            }
        } catch (error) {
            console.error("❌ Lỗi khi lấy ảnh từ Cloudinary:", error);
        }
    } else {
        let chatgptResponse = await getChatGPTResponse(userMessage);
        if (!chatgptResponse || chatgptResponse.trim() === "") {
            chatgptResponse = "Dạ chị ơi, em chưa có câu trả lời chính xác cho câu hỏi này. Chị có thể hỏi lại giúp em nha! 😊";
        }
        await sendMessage(senderId, { text: chatgptResponse });
    }
}

// 🎯 Webhook xử lý tin nhắn từ Messenger
app.post("/webhook", async (req, res) => {
    let body = req.body;

    if (body.object === "page") {
        body.entry.forEach(async function(entry) {
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;

            if (webhook_event.message && webhook_event.message.text) {
                await handleMessage(sender_psid, webhook_event.message.text.toLowerCase());
            }
        });
        res.status(200).send("EVENT_RECEIVED");
    } else {
        res.sendStatus(404);
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Chatbot đang chạy trên cổng ${PORT}`);
});
