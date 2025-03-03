const cloudinary = require("cloudinary").v2;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Lấy danh sách ảnh từ Cloudinary theo dịch vụ
 * @param {string} service - Tên thư mục dịch vụ (ví dụ: "nangnguc", "hutmo")
 * @returns {Promise<string[]>} - Danh sách URL ảnh
 */
async function getImages(service) {
  try {
    const folderPath = `feedback/${service}`; // Đường dẫn thư mục
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folderPath,
      max_results: 5,
    });
    
    // Trả về danh sách URL ảnh
    return result.resources.map(img => img.secure_url);
  } catch (error) {
    console.error("Lỗi khi lấy ảnh từ Cloudinary:", error);
    return [];
  }
}

module.exports = { getImages };
