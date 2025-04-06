const cloudinary = require('cloudinary').v2;

async function getFeedbackImages(folder) {
  try {
    const result = await cloudinary.search
      .expression(`folder:feedback/${folder} AND resource_type:image`)
      .sort_by('public_id', 'desc')
      .max_results(10)
      .execute();

    return result.resources.map(file => file.secure_url);
  } catch (error) {
    console.error('❌ Cloudinary fetch error:', error);
    return [];
  }
}

async function getBangGiaImage(publicId) {
  try {
    const result = await cloudinary.search
      .expression(`folder:banggia AND public_id:${publicId} AND resource_type:image`)
      .max_results(1)
      .execute();

    return result.resources[0]?.secure_url || null;
  } catch (error) {
    console.error('❌ Cloudinary fetch bảng giá error:', error);
    return null;
  }
}

module.exports = {
  getFeedbackImages,
  getBangGiaImage
};