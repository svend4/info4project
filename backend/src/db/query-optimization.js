// Connection pooling configuration
const pg = require('pg');

const pool = new pg.Pool({
  max: 20,                      // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Optimized query templates
const optimizedQueries = {
  getAllTasks: `
    SELECT id, title, description, status, priority, due_date, created_at, updated_at
    FROM tasks
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 100
  `,

  getTasksByStatus: `
    SELECT id, title, status, priority, updated_at
    FROM tasks
    WHERE status = $1 AND deleted_at IS NULL
    ORDER BY created_at DESC
  `,

  getTaskById: `
    SELECT * FROM tasks WHERE id = $1 AND deleted_at IS NULL
  `,
};

// Simple in-memory cache for frequently accessed data
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function cacheGet(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function cacheSet(key, data) {
  cache.set(key, {
    data,
    expiry: Date.now() + CACHE_TTL,
  });
}

function cacheClear(pattern) {
  if (!pattern) {
    cache.clear();
  } else {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) cache.delete(key);
    }
  }
}

// Database optimization module export
module.exports = {
  pool,
  optimizedQueries,
  cache: { get: cacheGet, set: cacheSet, clear: cacheClear },
};
