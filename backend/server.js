require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const apiRoutes = require('./routes');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://edumentor.io.vn',
  'https://www.edumentor.io.vn',
  process.env.FRONTEND_URL,
  // Thêm các domain production (có thể set trong .env)
  process.env.PRODUCTION_URL,
  process.env.PRODUCTION_URL ? `https://www.${new URL(process.env.PRODUCTION_URL).hostname}` : null
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow non-browser requests
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: 'Quá nhiều request, vui lòng thử lại sau.' },
  // Trust proxy khi chạy qua Cloudflare Tunnel
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Trust proxy (quan trọng khi chạy qua Cloudflare Tunnel)
app.set('trust proxy', 1);

// Body parsing middleware - tăng limit cho upload qua tunnel
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb', parameterLimit: 50000 }));

// Raw body parser cho một số endpoint cần
app.use(express.raw({ type: 'application/octet-stream', limit: '500mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/audio', express.static(path.join(__dirname, 'audio')));

// Serve frontend build (production) - must be before API routes for static assets
const frontendBuildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(frontendBuildPath));

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Edumentor Backend'
  });
});

// Serve React app for all other routes (SPA fallback)
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  const indexPath = path.join(frontendBuildPath, 'index.html');
  const fs = require('fs');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // In development, frontend runs on separate server
    res.status(404).json({ 
      error: 'Frontend build not found. Run "npm run build" in frontend folder.',
      tip: 'For development, access frontend at http://localhost:3000'
    });
  }
});

// 404 handler for API routes only
app.use('/api', (req, res) => {
  res.status(404).json({ 
    error: 'Không tìm thấy endpoint',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Đã xảy ra lỗi server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎓 EDUMENTOR - Backend Server                          ║
║                                                           ║
║   Server đang chạy tại: http://localhost:${PORT}            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
