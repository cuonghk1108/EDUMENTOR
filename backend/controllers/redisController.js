const redisService = require('../services/redisService');

const toScopedKey = (userId, key) => `user:${userId}:${key}`;

const parseRedisValue = (value) => {
  if (value === null) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

exports.health = async (req, res) => {
  try {
    const pong = await redisService.ping();
    res.json({ success: true, status: pong });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Redis unavailable' });
  }
};

exports.setValue = async (req, res) => {
  try {
    const { key, value, ttl } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Yêu cầu key và value' });
    }

    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    const namespacedKey = await redisService.set(key, serializedValue, ttl);

    return res.json({
      success: true,
      key: namespacedKey,
      ttl: ttl ? Number(ttl) : null
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getValue = async (req, res) => {
  try {
    const { key } = req.params;
    const value = await redisService.get(key);

    if (value === null) {
      return res.status(404).json({ error: 'Không tìm thấy key' });
    }

    let parsed = value;
    try {
      parsed = JSON.parse(value);
    } catch (error) {
      parsed = value;
    }

    const ttl = await redisService.ttl(key);

    return res.json({
      success: true,
      key,
      value: parsed,
      ttl
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteKey = async (req, res) => {
  try {
    const { key } = req.params;
    const deleted = await redisService.del(key);

    return res.json({
      success: true,
      key,
      deleted: deleted > 0
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.setExpire = async (req, res) => {
  try {
    const { key } = req.params;
    const { ttl } = req.body;

    if (!ttl || Number(ttl) <= 0) {
      return res.status(400).json({ error: 'ttl phải lớn hơn 0' });
    }

    const updated = await redisService.expire(key, ttl);

    return res.json({
      success: true,
      key,
      ttl: Number(ttl),
      updated: updated === 1
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.listKeys = async (req, res) => {
  try {
    const { pattern = '*', limit = 100 } = req.query;
    const keys = await redisService.keys(pattern, limit);

    return res.json({
      success: true,
      count: keys.length,
      keys
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.setMyValue = async (req, res) => {
  try {
    const { key, value, ttl } = req.body;
    const userId = req.userId;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Yêu cầu key và value' });
    }

    const scopedKey = toScopedKey(userId, key);
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    await redisService.set(scopedKey, serializedValue, ttl);

    return res.json({
      success: true,
      key,
      scope: 'user',
      ttl: ttl ? Number(ttl) : null
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getMyValue = async (req, res) => {
  try {
    const { key } = req.params;
    const scopedKey = toScopedKey(req.userId, key);
    const value = await redisService.get(scopedKey);

    if (value === null) {
      return res.status(404).json({ error: 'Không tìm thấy key' });
    }

    const ttl = await redisService.ttl(scopedKey);

    return res.json({
      success: true,
      key,
      scope: 'user',
      value: parseRedisValue(value),
      ttl
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteMyKey = async (req, res) => {
  try {
    const { key } = req.params;
    const scopedKey = toScopedKey(req.userId, key);
    const deleted = await redisService.del(scopedKey);

    return res.json({
      success: true,
      key,
      scope: 'user',
      deleted: deleted > 0
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.setMyExpire = async (req, res) => {
  try {
    const { key } = req.params;
    const { ttl } = req.body;
    const scopedKey = toScopedKey(req.userId, key);

    if (!ttl || Number(ttl) <= 0) {
      return res.status(400).json({ error: 'ttl phải lớn hơn 0' });
    }

    const updated = await redisService.expire(scopedKey, ttl);

    return res.json({
      success: true,
      key,
      scope: 'user',
      ttl: Number(ttl),
      updated: updated === 1
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.listMyKeys = async (req, res) => {
  try {
    const { pattern = '*', limit = 100 } = req.query;
    const userPrefixPattern = `user:${req.userId}:${pattern}`;
    const keys = await redisService.keys(userPrefixPattern, limit);

    const normalizedKeys = keys.map((key) => key.replace(`user:${req.userId}:`, ''));

    return res.json({
      success: true,
      scope: 'user',
      count: normalizedKeys.length,
      keys: normalizedKeys
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
