const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getMe, 
  updateUser, 
  changePassword,
  logoutUser,
  refreshAccessToken
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser); 
router.post('/refresh', refreshAccessToken); 
router.get('/me', protect, getMe);
router.put('/me', protect, updateUser);
router.put('/change-password', protect, changePassword);

module.exports = router;
