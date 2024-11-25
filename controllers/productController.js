const { PrismaClient } = require('@prisma/client');
const { deleteFromCloudinary } = require('../services/cloudinaryService');
const extractPublicId = require('../utils/extractPublicId');

const prisma = new PrismaClient();

// ฟังก์ชันช่วยลบไฟล์จาก Cloudinary
const deleteImagesFromCloudinary = async (imageUrls) => {
  return Promise.all(
    imageUrls.map(async (url) => {
      const publicId = extractPublicId(url);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
          console.log(`Deleted image: ${publicId}`);
        } catch (error) {
          console.error('Error deleting from Cloudinary:', error.message, 'Public ID:', publicId);
        }
      } else {
        console.warn('Skipping invalid URL:', url);
      }
    })
  );
};


const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!product) return res.status(404).json({ error: 'ไม่พบสินค้า' });
    product.images = product.images?.split(',') || [];
    res.status(200).json(product);
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
      select: { coverImage: true, images: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'ไม่พบสินค้า' });
    }

    // แยกรูปภาพ
    const imageUrls = product.images ? product.images.split(',') : [];

    // ลบรูปปก
    if (product.coverImage) {
      const coverImagePublicId = extractPublicId(product.coverImage);
      if (coverImagePublicId) {
        await deleteFromCloudinary(coverImagePublicId);
      } else {
        console.warn('Invalid coverImage URL:', product.coverImage);
      }
    }

    // ลบรูปเพิ่มเติม
    if (imageUrls.length > 0) {
      await deleteImagesFromCloudinary(imageUrls);
    }

    // ลบสินค้าในฐานข้อมูล
    await prisma.product.delete({ where: { id: parseInt(id, 10) } });

    res.status(200).json({ success: true, message: 'ลบสินค้าสำเร็จ' });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบสินค้า' });
  }
};

const editProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    code,
    category,
    price,
    specifications,
    date,
    status,
    shopee,
    imagesToDelete,
  } = req.body;

  try {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // ค้นหาสินค้าเดิม
    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
      return res.status(404).json({ error: 'ไม่พบสินค้า' });
    }

    // เตรียมไฟล์ใหม่
    const coverImageUrl = req.files?.coverImage?.[0]?.path || null;
    const newImageUrls = req.files?.images?.map((file) => file.path) || [];

    // ลบภาพที่ถูกเลือกใน imagesToDelete
    if (imagesToDelete && Array.isArray(imagesToDelete)) {
      await deleteImagesFromCloudinary(imagesToDelete);
    }

    // ลบรูปปกเดิม ถ้ามีการอัปโหลดรูปปกใหม่
    if (coverImageUrl && existingProduct.coverImage) {
      const publicId = extractPublicId(existingProduct.coverImage);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    // รวมภาพใหม่และภาพเดิมที่เหลือหลังลบ
    const existingImages = existingProduct.images?.split(',') || [];
    const updatedImages = [
      ...existingImages.filter((img) => !imagesToDelete?.includes(img)),
      ...newImageUrls,
    ];

    // อัปเดตข้อมูลสินค้าในฐานข้อมูล
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        code,
        category,
        price: parseFloat(price),
        specifications,
        date: new Date(date),
        status,
        shopee,
        coverImage: coverImageUrl || existingProduct.coverImage,
        images: updatedImages.join(','),
      },
    });

    res.status(200).json({ success: true, message: 'แก้ไขสินค้าสำเร็จ', product: updatedProduct });
  } catch (error) {
    console.error('Error editing product:', error.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขสินค้า' });
  }
};

const postProduct = async (req, res) => {
  const { name, description, code, category, price, specifications, date, status, shopee } = req.body;

  try {
    const coverImageUrl = req.files?.coverImage?.[0]?.path || null;
    const imageUrls = req.files?.images?.map((file) => file.path) || [];

    // สร้างสินค้าใหม่ในฐานข้อมูล
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        code,
        category,
        price: parseFloat(price),
        specifications,
        date: new Date(date),
        status,
        shopee,
        coverImage: coverImageUrl,
        images: imageUrls.join(','), // แปลง array เป็น string
      },
    });

    res.status(201).json({ success: true, message: 'เพิ่มสินค้าสำเร็จ', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มสินค้า' });
  }
};

module.exports = { getAllProducts, getProductById, deleteProduct, editProduct, postProduct };
