const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let tasks = [];
let nextId = 1;

// Validation helper
const validateTask = (data) => {
  const errors = [];

  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length === 0) {
      errors.push('title must be a non-empty string');
    }
  }

  if (data.description !== undefined && data.description !== null && typeof data.description !== 'string') {
    errors.push('description must be a string');
  }

  if (data.priority !== undefined) {
    if (!['low', 'medium', 'high'].includes(data.priority)) {
      errors.push('priority must be one of: low, medium, high');
    }
  }

  if (data.status !== undefined) {
    if (!['pending', 'in-progress', 'completed'].includes(data.status)) {
      errors.push('status must be one of: pending, in-progress, completed');
    }
  }

  if (data.dueDate !== undefined) {
    const date = new Date(data.dueDate);
    if (isNaN(date.getTime())) {
      errors.push('dueDate must be a valid date');
    }
  }

  return errors;
};

// GET /api/tasks - Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json({
    success: true,
    data: tasks,
    total: tasks.length
  });
});

// POST /api/tasks - Create a new task
app.post('/api/tasks', (req, res) => {
  const { title, description, priority, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      error: 'title is required'
    });
  }

  const errors = validateTask({ title, description, priority, dueDate });
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: description !== undefined ? description : '',
    priority: priority || 'medium',
    status: 'pending',
    dueDate: dueDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tasks.push(newTask);

  res.status(201).json({
    success: true,
    data: newTask
  });
});

// GET /api/tasks/:id - Get a specific task
app.get('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const taskId = parseInt(id, 10);

  if (isNaN(taskId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid task id'
    });
  }

  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  res.json({
    success: true,
    data: task
  });
});

// PUT /api/tasks/:id - Update a task
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const taskId = parseInt(id, 10);

  if (isNaN(taskId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid task id'
    });
  }

  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  const { title, description, status, priority } = req.body;

  const errors = validateTask({ title, description, status, priority });
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  if (title !== undefined) {
    task.title = title.trim();
  }
  if (description !== undefined) {
    task.description = description;
  }
  if (status !== undefined) {
    task.status = status;
  }
  if (priority !== undefined) {
    task.priority = priority;
  }

  task.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    data: task
  });
});

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const taskId = parseInt(id, 10);

  if (isNaN(taskId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid task id'
    });
  }

  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  tasks.splice(taskIndex, 1);

  res.json({
    success: true,
    message: 'Deleted'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Task Management API running on port ${PORT}`);
  });
}

module.exports = app;
