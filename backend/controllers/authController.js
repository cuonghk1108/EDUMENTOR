const { userService } = require('../services/firebaseService');
const { generateToken, hashPassword, comparePassword, blacklistToken } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Register new user
 */
exports.register = async (req, res) => {
  try {
    const { email, password, name, grade, school } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Vui lòng điền đầy đủ thông tin (email, password, name)' 
      });
    }

    // Check if user exists
    const existingUser = await userService.getByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email đã được đăng ký' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userData = {
      email,
      password: hashedPassword,
      name,
      grade: grade || '',
      school: school || '',
      avatar: '',
      settings: {
        notifications: true,
        darkMode: false,
        language: 'vi'
      }
    };

    const user = await userService.create(userData);

    // Generate token
    const token = generateToken(user.id, user.email);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Lỗi đăng ký' });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Vui lòng nhập email và mật khẩu' 
      });
    }

    // Find user
    const user = await userService.getByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Lỗi đăng nhập' });
  }
};

/**
 * Logout user
 */
exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      blacklistToken(token);
    }

    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Lỗi đăng xuất' });
  }
};

/**
 * Get user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userService.getById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, grade, school, avatar, settings } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (grade) updateData.grade = grade;
    if (school) updateData.school = school;
    if (avatar) updateData.avatar = avatar;
    if (settings) updateData.settings = settings;

    const user = await userService.update(userId, updateData);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Google OAuth Login/Register
 * Supports both ID token and access token flows
 */
exports.googleAuth = async (req, res) => {
  try {
    const { credential, accessToken, userInfo } = req.body;

    let email, name, picture, googleId;

    if (credential) {
      // ID Token flow - verify with Google
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      googleId = payload.sub;
    } else if (accessToken && userInfo) {
      // Access Token flow - verify access token with Google
      const tokenInfoResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`);
      const tokenInfo = tokenInfoResponse.data;
      
      if (tokenInfo.error || !tokenInfo.email) {
        return res.status(401).json({ error: 'Access token không hợp lệ' });
      }

      // Verify email matches
      if (tokenInfo.email !== userInfo.email) {
        return res.status(401).json({ error: 'Xác thực Google thất bại' });
      }

      email = userInfo.email;
      name = userInfo.name;
      picture = userInfo.picture;
      googleId = userInfo.sub;
    } else {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    // Check if user exists
    let user = await userService.getByEmail(email);

    if (user) {
      // Update Google info if changed
      const updateData = {};
      if (!user.googleId) updateData.googleId = googleId;
      if (picture && user.avatar !== picture) updateData.avatar = picture;
      if (name && user.name !== name && !user.name) updateData.name = name;
      
      if (Object.keys(updateData).length > 0) {
        user = await userService.update(user.id, updateData);
      }
    } else {
      // Create new user with Google info
      const userData = {
        email,
        name: name || email.split('@')[0],
        googleId,
        avatar: picture || '',
        password: '', // No password for Google users
        grade: '',
        school: '',
        settings: {
          notifications: true,
          darkMode: false,
          language: 'vi'
        }
      };

      user = await userService.create(userData);
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: user.googleId ? 'Đăng nhập Google thành công' : 'Đăng ký Google thành công',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Lỗi xác thực Google' });
  }
};
