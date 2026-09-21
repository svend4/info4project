const { pool, optimizedQueries, cache } = require('./query-optimization');

async function getAllTasks() {
  // Try cache first
  const cached = cache.get('all_tasks');
  if (cached) return cached;

  const result = await pool.query(optimizedQueries.getAllTasks);
  cache.set('all_tasks', result.rows);
  return result.rows;
}

async function getTasksByStatus(status) {
  const cacheKey = `tasks_${status}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const result = await pool.query(optimizedQueries.getTasksByStatus, [status]);
  cache.set(cacheKey, result.rows);
  return result.rows;
}

async function getTaskById(id) {
  const result = await pool.query(optimizedQueries.getTaskById, [id]);
  return result.rows[0];
}

module.exports = {
  getAllTasks,
  getTasksByStatus,
  getTaskById,
  pool,
};
