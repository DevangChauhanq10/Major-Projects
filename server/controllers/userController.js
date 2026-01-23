const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const asyncHandler = require('../utils/asynchandler');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const { sendEmail, emailVerificationMailGenContent } = require('../utils/mail');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send Welcome Email
    try {
        const verificationUrl = process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/login` : 'http://localhost:5173/login';
        const emailContent = emailVerificationMailGenContent(user.name, verificationUrl);
        await sendEmail({
            email: user.email,
            subject: "Welcome to Task Manager! Please verify your email.",
            content: emailContent
        });
    } catch (error) {
        console.error("Error sending welcome email:", error);
        // We don't block registration if email fails, just log it
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: accessToken,
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: accessToken,
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if(user){
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            skills: user.skills || []
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.skills = req.body.skills || user.skills;
        
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            skills: updatedUser.skills
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide current and new password' });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
});

const logoutUser = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); // No content
    
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        return res.sendStatus(204);
    }

    // Delete refreshToken in db
    user.refreshToken = '';
    await user.save();

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.status(200).json({ message: 'Cookie cleared' });
}

const refreshAccessToken = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });
    
    const refreshToken = cookies.jwt;

    try {
        const user = await User.findOne({ refreshToken });
        
        if (!user) return res.status(403).json({ message: 'Forbidden' }); // Invalid token

        jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err || user._id.toString() !== decoded.id) return res.status(403).json({ message: 'Forbidden' });
            
            const accessToken = generateAccessToken(user._id);
            res.json({ token: accessToken });
        });
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}

module.exports = { registerUser, loginUser, getMe, updateUser, changePassword, logoutUser, refreshAccessToken };
