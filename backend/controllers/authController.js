const { userService, streakService } = require('../services/firebaseService');
const { generateToken, hashPassword, comparePassword, blacklistToken } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const crypto = require('crypto');
const { sendResetPasswordEmail } = require('../services/emailService');

const getAppBaseUrl = (req) => {
  const configuredUrl = process.env.FRONTEND_APP_URL;
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  const forwardedProto = req.headers['x-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'];

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, '');
  }

  const protocol = req.protocol || 'http';
  const host = req.get('host');
  if (host) {
    return `${protocol}://${host}`.replace(/\/$/, '');
  }

  return 'http://localhost:5000';
};

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

    // Get streak data
    const streak = await streakService.checkAndUpdateStreak(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      user: {
        ...userWithoutPassword,
        streak: {
          current: streak.currentStreak || 0,
          longest: streak.longestStreak || 0
        }
      },
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

    console.log('[LOGIN] Attempting login for email:', email);

    // Find user
    const user = await userService.getByEmail(email);
    console.log('[LOGIN] User from DB:', user ? `Found (ID: ${user.id})` : 'NOT FOUND');
    
    if (!user) {
      console.log('[LOGIN] User not found, returning 401');
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // Check password
    console.log('[LOGIN] Comparing passwords...');
    const isValidPassword = await comparePassword(password, user.password);
    console.log('[LOGIN] Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('[LOGIN] Password mismatch, returning 401');
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    // Get streak data
    const streak = await streakService.checkAndUpdateStreak(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        ...userWithoutPassword,
        streak: {
          current: streak.currentStreak || 0,
          longest: streak.longestStreak || 0
        }
      },
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

    // Get streak data
    const streak = await streakService.checkAndUpdateStreak(userId);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: {
        ...userWithoutPassword,
        streak: {
          current: streak.currentStreak || 0,
          longest: streak.longestStreak || 0
        }
      }
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
      // Chỉ set avatar từ Google nếu user chưa có avatar (không ghi đè avatar đã set)
      if (picture && !user.avatar) updateData.avatar = picture;
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

    // Get streak data
    const streak = await streakService.checkAndUpdateStreak(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Check if profile is incomplete (new user needs to fill grade/school)
    const needsProfileCompletion = !user.grade || !user.school;

    res.json({
      success: true,
      message: user.googleId ? 'Đăng nhập Google thành công' : 'Đăng ký Google thành công',
      user: {
        ...userWithoutPassword,
        streak: {
          current: streak.currentStreak || 0,
          longest: streak.longestStreak || 0
        }
      },
      token,
      needsProfileCompletion
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Lỗi xác thực Google' });
  }
};

/**
 * Forgot password request
 * Hiện tại ghi nhận yêu cầu và chuyển cho email hỗ trợ.
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Vui lòng nhập email' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await userService.getByEmail(normalizedEmail);

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = Date.now() + 15 * 60 * 1000;

      await userService.update(user.id, {
        resetPasswordToken: tokenHash,
        resetPasswordExpires: expiresAt
      });

      const appBaseUrl = getAppBaseUrl(req);
      const resetLink = `${appBaseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

      await sendResetPasswordEmail({
        toEmail: normalizedEmail,
        resetLink
      });
    }

    return res.json({
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: error.message || 'Không thể xử lý yêu cầu quên mật khẩu' });
  }
};

/**
 * Reset password with token
 */
/**
 * Complete profile after Google sign up
 * User fills in name, grade, school
 */
exports.completeProfile = async (req, res) => {
  try {
    const { userId } = req.user; // From verifyToken middleware
    const { name, grade, school } = req.body;

    if (!name || !grade || !school) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin (tên, lớp, trường)' });
    }

    const user = await userService.getById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    // Update profile
    const updatedUser = await userService.update(userId, {
      name: name.trim(),
      grade: grade.trim(),
      school: school.trim()
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ error: 'Không thể cập nhật thông tin' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      return res.status(400).json({ error: 'Thiếu email, token hoặc mật khẩu mới' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await userService.getByEmail(normalizedEmail);

    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({ error: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' });
    }

    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ error: 'Liên kết đặt lại mật khẩu đã hết hạn' });
    }

    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    if (tokenHash !== user.resetPasswordToken) {
      return res.status(400).json({ error: 'Token đặt lại mật khẩu không hợp lệ' });
    }

    const newPasswordHash = await hashPassword(password);

    await userService.update(user.id, {
      password: newPasswordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    return res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Không thể đặt lại mật khẩu' });
  }
};
