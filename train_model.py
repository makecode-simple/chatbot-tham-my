import fasttext

# Huấn luyện mô hình từ intents.txt
model = fasttext.train_supervised(
    input="intents.txt",
    lr=1.0,
    epoch=25,
    wordNgrams=2,
    minCount=1,
    loss='softmax'
)

# Lưu mô hình
model.save_model("model_chatbot.bin")
print("✅ Model saved to model_chatbot.bin")
