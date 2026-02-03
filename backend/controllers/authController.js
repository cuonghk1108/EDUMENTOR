const { userService } = require('../services/firebaseService');
const { generateToken, hashPassword, comparePassword, blacklistToken } = require('../middleware/auth');

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
