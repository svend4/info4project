const express = require('express');
const app = express();

app.use(express.json());

// In-memory storage for tasks
const tasks = {};
let taskIdCounter = 1;

// GET /api/tasks - Retrieve all tasks
app.get('/api/tasks', (req, res) => {
  const taskList = Object.values(tasks);
  res.status(200).json({
    success: true,
    data: taskList
  });
});

// POST /api/tasks - Create a new task
app.post('/api/tasks', (req, res) => {
  const { title, priority } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      error: 'Title is required'
    });
  }

  const id = taskIdCounter++;
  const task = {
    id,
    title,
    priority: priority || 'normal',
    createdAt: new Date().toISOString()
  };

  tasks[id] = task;

  res.status(201).json({
    success: true,
    data: task
  });
});

// GET /api/tasks/:id - Retrieve a specific task
app.get('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const task = tasks[id];

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

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;

  if (!tasks[id]) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  delete tasks[id];

  res.status(200).json({
    success: true,
    data: { id }
  });
});

// Start server if run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
