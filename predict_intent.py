import fasttext

# Tải mô hình đã huấn luyện
model = fasttext.load_model("model_chatbot.bin")

# Giao diện test nhanh
while True:
    msg = input("👤 User: ")
    if not msg.strip():
        break
    label, prob = model.predict(msg)
    print(f"🤖 Intent: {label[0]} (Confidence: {prob[0]:.2f})")
