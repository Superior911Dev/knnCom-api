const extractPublicId = (url) => {
    try {
      // ตรวจสอบว่า URL ถูกต้องหรือไม่
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL');
      }
  
      // แยกส่วนต่าง ๆ ของ URL
      const parts = url.split('/');
      
      // ดึงชื่อไฟล์ (ตัวสุดท้ายใน URL)
      const fileNameWithExtension = parts.pop();
      
      if (!fileNameWithExtension.includes('.')) {
        throw new Error('Invalid file name format');
      }
  
      // แยก Public ID โดยลบส่วนขยายไฟล์ (เช่น .jpg, .png)
      const fileName = fileNameWithExtension.split('.')[0];
  
      // ดึงโฟลเดอร์ก่อนหน้า (ถ้ามี)
      const folder = parts.length > 0 ? parts.pop() : null;
  
      // รวมโฟลเดอร์กับชื่อไฟล์เพื่อสร้าง Public ID (ถ้ามีโฟลเดอร์)
      return folder ? `${folder}/${fileName}` : fileName;
    } catch (error) {
      console.error('Error extracting public ID:', error.message, 'URL:', url);
      return null;
    }
  };
  
  module.exports = extractPublicId;
  