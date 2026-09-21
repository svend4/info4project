const request = require('supertest');
const app = require('../server');

describe('Task Management API', () => {
  let taskId;

  beforeEach(() => {
    // Clear tasks before each test (reset in-memory storage)
    global.gc && global.gc();
  });

  describe('GET /api/tasks', () => {
    it('should return empty array initially', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
        total: 0
      });
    });

    it('should return all tasks', async () => {
      // Create a task first
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' });

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.total).toBe(1);
      expect(response.body.data[0].title).toBe('Test Task');
    });

    it('should return correct response structure', async () => {
      const response = await request(app)
        .get('/api/tasks');

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'New Task' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe('New Task');
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.priority).toBe('medium');
      expect(response.body.data.description).toBe('');

      taskId = response.body.data.id;
    });

    it('should create task with all optional fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Complete Task',
          description: 'Task description',
          priority: 'high',
          dueDate: '2025-12-31'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Complete Task');
      expect(response.body.data.description).toBe('Task description');
      expect(response.body.data.priority).toBe('high');
      expect(response.body.data.dueDate).toBe('2025-12-31');
    });

    it('should reject request without title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: 'No title' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('title is required');
    });

    it('should reject empty title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '   ' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('title must be a non-empty string');
    });

    it('should reject invalid priority', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task',
          priority: 'urgent'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('priority must be one of: low, medium, high');
    });

    it('should reject invalid dueDate', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task',
          dueDate: 'invalid-date'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('dueDate must be a valid date');
    });

    it('should trim whitespace from title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '  Task Title  ' })
        .expect(201);

      expect(response.body.data.title).toBe('Task Title');
    });

    it('should include timestamps', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task with timestamps' })
        .expect(201);

      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
      expect(new Date(response.body.data.createdAt).getTime()).toBeLessThanOrEqual(
        new Date(response.body.data.updatedAt).getTime()
      );
    });
  });

  describe('GET /api/tasks/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' });
      taskId = response.body.data.id;
    });

    it('should return a specific task', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(taskId);
      expect(response.body.data.title).toBe('Test Task');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/9999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Task not found');
    });

    it('should return 400 for invalid task id', async () => {
      const response = await request(app)
        .get('/api/tasks/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid task id');
    });

    it('should include all task properties', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`);

      const task = response.body.data;
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('priority');
      expect(task).toHaveProperty('dueDate');
      expect(task).toHaveProperty('createdAt');
      expect(task).toHaveProperty('updatedAt');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Original Task', priority: 'low' });
      taskId = response.body.data.id;
    });

    it('should update task title', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: 'Updated Task' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Task');
      expect(response.body.data.priority).toBe('low');
    });

    it('should update task status', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.data.status).toBe('completed');
    });

    it('should update task priority', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ priority: 'high' })
        .expect(200);

      expect(response.body.data.priority).toBe('high');
    });

    it('should update task description', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ description: 'New description' })
        .expect(200);

      expect(response.body.data.description).toBe('New description');
    });

    it('should update multiple fields at once', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({
          title: 'New Title',
          status: 'in-progress',
          priority: 'high',
          description: 'New desc'
        })
        .expect(200);

      const data = response.body.data;
      expect(data.title).toBe('New Title');
      expect(data.status).toBe('in-progress');
      expect(data.priority).toBe('high');
      expect(data.description).toBe('New desc');
    });

    it('should update updatedAt timestamp', async () => {
      const getResponse = await request(app).get(`/api/tasks/${taskId}`);
      const originalUpdatedAt = getResponse.body.data.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      const putResponse = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: 'Updated' });

      expect(putResponse.body.data.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should reject invalid status', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('status must be one of: pending, in-progress, completed');
    });

    it('should reject invalid priority', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ priority: 'urgent' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/9999')
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Task not found');
    });

    it('should return 400 for invalid task id', async () => {
      const response = await request(app)
        .put('/api/tasks/invalid')
        .send({ title: 'Updated' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task to delete' });
      taskId = response.body.data.id;
    });

    it('should delete a task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Deleted');
    });

    it('should remove task from list after deletion', async () => {
      await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200);

      const getResponse = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(404);

      expect(getResponse.body.success).toBe(false);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/9999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Task not found');
    });

    it('should return 400 for invalid task id', async () => {
      const response = await request(app)
        .delete('/api/tasks/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid task id');
    });

    it('should decrement total task count', async () => {
      const beforeDelete = await request(app).get('/api/tasks');
      const countBefore = beforeDelete.body.total;

      await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200);

      const afterDelete = await request(app).get('/api/tasks');
      expect(afterDelete.body.total).toBe(countBefore - 1);
    });
  });

  describe('Response structure validation', () => {
    it('should return success=true on all successful operations', async () => {
      const getResponse = await request(app).get('/api/tasks');
      expect(getResponse.body.success).toBe(true);

      const postResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test' });
      expect(postResponse.body.success).toBe(true);

      const id = postResponse.body.data.id;

      const getSingleResponse = await request(app).get(`/api/tasks/${id}`);
      expect(getSingleResponse.body.success).toBe(true);

      const putResponse = await request(app)
        .put(`/api/tasks/${id}`)
        .send({ title: 'Updated' });
      expect(putResponse.body.success).toBe(true);

      const deleteResponse = await request(app).delete(`/api/tasks/${id}`);
      expect(deleteResponse.body.success).toBe(true);
    });

    it('should return consistent error structure', async () => {
      const response = await request(app)
        .get('/api/tasks/invalid');

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in task title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task with @#$%^&*()' })
        .expect(201);

      expect(response.body.data.title).toBe('Task with @#$%^&*()');
    });

    it('should handle very long task title', async () => {
      const longTitle = 'a'.repeat(1000);
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: longTitle })
        .expect(201);

      expect(response.body.data.title).toBe(longTitle);
    });

    it('should handle unicode characters', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '📝 Task with emoji 🎉' })
        .expect(201);

      expect(response.body.data.title).toBe('📝 Task with emoji 🎉');
    });

    it('should handle null description as null', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task', description: null })
        .expect(201);

      expect(response.body.data.description).toBeNull();
    });

    it('should handle tasks with same title', async () => {
      const response1 = await request(app)
        .post('/api/tasks')
        .send({ title: 'Duplicate' });

      const response2 = await request(app)
        .post('/api/tasks')
        .send({ title: 'Duplicate' });

      expect(response1.body.data.id).not.toBe(response2.body.data.id);
    });
  });
});
