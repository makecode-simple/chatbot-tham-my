const express = require("express");
const bodyParser = require("body-parser");
const { getImages } = require("./cloudinaryService");
const { sendMessage, getChatGPTResponse } = require("./messengerService");

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
// Gửi tất cả ảnh cùng lúc để Messenger tự nhóm lại
async function sendImagesBatch(senderId, images) {
    if (images.length === 0) return;

    const sendPromises = images.map(url => 
        sendMessage(senderId, {
            attachment: {
                type: "image",
                payload: { url: url, is_reusable: true }
            }
        })
    );

    await Promise.all(sendPromises); // Gửi đồng thời tất cả ảnh
}

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

        // 🖼️ Lấy ảnh feedback từ Cloudinary
        const images = await getImages(scripts[service].images);

        if (images.length > 0) {
            await sendImagesBatch(senderId, images); // Gửi tất cả ảnh cùng lúc
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
