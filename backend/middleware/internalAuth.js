exports.verifyInternalToken = (req, res, next) => {
  const headerToken = req.header('X-Internal-Token');
  const expectedToken = process.env.INTERNAL_API_TOKEN;

  if (!expectedToken) {
    return res.status(500).json({ error: 'INTERNAL_API_TOKEN chưa được cấu hình' });
  }

  if (!headerToken || headerToken !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized internal request' });
  }

  return next();
};
