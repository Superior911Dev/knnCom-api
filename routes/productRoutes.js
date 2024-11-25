const { 
  getAllProducts, 
  getProductById, 
  deleteProduct, 
  editProduct, 
  postProduct 
} = require('../controllers/productController');
const upload = require('../middleware/multer');

const router = require('express').Router();

router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.post('/products', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]), postProduct);
router.put('/products/:id', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 10 },
  { name: 'imagesToDelete', maxCount: 10 }
]), editProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
