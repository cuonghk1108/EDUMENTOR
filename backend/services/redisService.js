const { createClient } = require('redis');

let client = null;
let connectPromise = null;

const getRedisUrl = () => process.env.REDIS_URL || 'redis://localhost:6379';

const getPrefix = () => process.env.REDIS_KEY_PREFIX || 'edumentor:';

const getClient = () => {
  if (!client) {
    client = createClient({
      url: getRedisUrl()
    });

    client.on('error', (error) => {
      console.error('Redis client error:', error.message);
    });
  }

  return client;
};

const ensureConnected = async () => {
  const redisClient = getClient();

  if (redisClient.isOpen) {
    return redisClient;
  }

  if (!connectPromise) {
    connectPromise = redisClient.connect().finally(() => {
      connectPromise = null;
    });
  }

  await connectPromise;
  return redisClient;
};

const withPrefix = (key) => `${getPrefix()}${key}`;

exports.ping = async () => {
  const redisClient = await ensureConnected();
  return redisClient.ping();
};

exports.set = async (key, value, ttlSeconds) => {
  const redisClient = await ensureConnected();
  const namespacedKey = withPrefix(key);

  if (ttlSeconds && Number(ttlSeconds) > 0) {
    await redisClient.set(namespacedKey, value, { EX: Number(ttlSeconds) });
  } else {
    await redisClient.set(namespacedKey, value);
  }

  return namespacedKey;
};

exports.get = async (key) => {
  const redisClient = await ensureConnected();
  return redisClient.get(withPrefix(key));
};

exports.del = async (key) => {
  const redisClient = await ensureConnected();
  return redisClient.del(withPrefix(key));
};

exports.expire = async (key, ttlSeconds) => {
  const redisClient = await ensureConnected();
  return redisClient.expire(withPrefix(key), Number(ttlSeconds));
};

exports.ttl = async (key) => {
  const redisClient = await ensureConnected();
  return redisClient.ttl(withPrefix(key));
};

exports.keys = async (pattern = '*', limit = 100) => {
  const redisClient = await ensureConnected();
  const rawKeys = await redisClient.keys(`${getPrefix()}${pattern}`);
  return rawKeys.slice(0, Number(limit)).map((key) => key.replace(getPrefix(), ''));
};
