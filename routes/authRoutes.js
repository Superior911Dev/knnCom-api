const express = require('express');
const prisma = require('../prismaClient'); // Centralized Prisma client
const {
  registerUser,
  loginUser,
  validateSecretCode,
  generateSecretCode,
  deleteUser,
  changePassword,
  updateUser,
} = require('../controllers/authController');

const router = express.Router();

// Route to fetch all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany(); // Fetch users from the database
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Other routes...
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/validateSecretCode', validateSecretCode);
router.get('/generateSecretCode', (req, res) => {
  try {
    const newSecretCode = generateSecretCode();
    res.json({ success: true, secretCode: newSecretCode });
  } catch (error) {
    console.error('Error generating secret code:', error);
    res.status(500).json({ success: false, message: 'Failed to generate secret code' });
  }
});
router.delete('/users/:id', deleteUser);
router.put('/changePassword', changePassword);
router.put('/users/:id', updateUser);

module.exports = router;