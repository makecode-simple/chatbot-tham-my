const express = require("express");
const app = express();

// Lắng nghe cổng do Render cung cấp hoặc mặc định là 3000
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Chatbot is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});