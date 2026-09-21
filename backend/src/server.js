const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

let tasks = [];

// GET /api/tasks
app.get('/api/tasks', (req, res) => {
  res.status(200).json({
    success: true,
    data: tasks,
    count: tasks.length
  });
});

// POST /api/tasks
app.post('/api/tasks', (req, res) => {
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Title is required'
    });
  }

  const newTask = {
    id: uuidv4(),
    title,
    description: description || '',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tasks.push(newTask);
  res.status(201).json({
    success: true,
    data: newTask
  });
});

// GET /api/tasks/:id
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

// PUT /api/tasks/:id
app.put('/api/tasks/:id', (req, res) => {
  const { title, description, completed } = req.body;
  const task = tasks.find(t => t.id === req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  if (title !== undefined && title.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Title cannot be empty'
    });
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (completed !== undefined) task.completed = completed;
  task.updatedAt = new Date().toISOString();

  res.status(200).json({
    success: true,
    data: task
  });
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  const deletedTask = tasks.splice(index, 1)[0];
  res.status(200).json({
    success: true,
    data: deletedTask,
    message: 'Task deleted successfully'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
