/**
 * Admin Middleware
 * Kiểm tra quyền admin
 */

const { userService } = require('../services/firebaseService');

/**
 * Verify user is admin
 */
const verifyAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const user = await userService.getById(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Người dùng không tồn tại' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền truy cập. Yêu cầu quyền Admin.' });
    }

    // Add user info to request
    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Admin verify error:', error);
    res.status(500).json({ error: 'Lỗi xác thực quyền admin' });
  }
};

module.exports = { verifyAdmin };
