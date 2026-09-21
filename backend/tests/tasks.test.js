const request = require('supertest');
const app = require('../src/server');

describe('Task Management API', () => {
  let taskId;

  beforeEach(() => {
    jest.resetModules();
  });

  describe('POST /api/tasks', () => {
    test('should create a new task with 201 status', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'This is a test task'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('title', 'Test Task');
      expect(res.body.data).toHaveProperty('description', 'This is a test task');
      expect(res.body.data).toHaveProperty('completed', false);
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');

      taskId = res.body.data.id;
    });

    test('should create task with title only', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Simple Task'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Simple Task');
      expect(res.body.data.description).toBe('');
    });

    test('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          description: 'No title provided'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Title is required');
    });

    test('should return 400 when title is empty', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: '   ',
          description: 'Empty title'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Title is required');
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Task 1', description: 'First task' });

      await request(app)
        .post('/api/tasks')
        .send({ title: 'Task 2', description: 'Second task' });
    });

    test('should retrieve all tasks with 200 status', async () => {
      const res = await request(app).get('/api/tasks');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.count).toBe(res.body.data.length);
    });

    test('should return empty array when no tasks exist', async () => {
      const res = await request(app).get('/api/tasks');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.count).toBe(res.body.data.length);
    });

    test('response should have proper structure', async () => {
      const res = await request(app).get('/api/tasks');

      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('count');

      if (res.body.data.length > 0) {
        const task = res.body.data[0];
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('description');
        expect(task).toHaveProperty('completed');
        expect(task).toHaveProperty('createdAt');
        expect(task).toHaveProperty('updatedAt');
      }
    });
  });

  describe('GET /api/tasks/:id', () => {
    let validId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Specific Task', description: 'For retrieval' });

      validId = res.body.data.id;
    });

    test('should retrieve task by id with 200 status', async () => {
      const res = await request(app).get(`/api/tasks/${validId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(validId);
      expect(res.body.data.title).toBe('Specific Task');
    });

    test('should return 404 for non-existent task', async () => {
      const res = await request(app).get('/api/tasks/non-existent-id');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Task not found');
    });

    test('response should have complete task structure', async () => {
      const res = await request(app).get(`/api/tasks/${validId}`);

      const task = res.body.data;
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('completed');
      expect(task).toHaveProperty('createdAt');
      expect(task).toHaveProperty('updatedAt');
      expect(typeof task.id).toBe('string');
      expect(typeof task.title).toBe('string');
      expect(typeof task.completed).toBe('boolean');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let validId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task to Update', description: 'Will be updated' });

      validId = res.body.data.id;
    });

    test('should update task with 200 status', async () => {
      const res = await request(app)
        .put(`/api/tasks/${validId}`)
        .send({
          title: 'Updated Title',
          description: 'Updated description'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(validId);
      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.description).toBe('Updated description');
    });

    test('should update task completion status', async () => {
      const res = await request(app)
        .put(`/api/tasks/${validId}`)
        .send({ completed: true });

      expect(res.status).toBe(200);
      expect(res.body.data.completed).toBe(true);
    });

    test('should update only provided fields', async () => {
      const getRes = await request(app).get(`/api/tasks/${validId}`);
      const originalDescription = getRes.body.data.description;

      const res = await request(app)
        .put(`/api/tasks/${validId}`)
        .send({ title: 'New Title' });

      expect(res.body.data.title).toBe('New Title');
      expect(res.body.data.description).toBe(originalDescription);
    });

    test('should update createdAt but not modify it', async () => {
      const getRes = await request(app).get(`/api/tasks/${validId}`);
      const originalCreatedAt = getRes.body.data.createdAt;

      const res = await request(app)
        .put(`/api/tasks/${validId}`)
        .send({ title: 'Another Title' });

      expect(res.body.data.createdAt).toBe(originalCreatedAt);
      expect(res.body.data.updatedAt).not.toBe(originalCreatedAt);
    });

    test('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .put('/api/tasks/non-existent-id')
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('should return 400 when title is empty', async () => {
      const res = await request(app)
        .put(`/api/tasks/${validId}`)
        .send({ title: '  ' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title cannot be empty');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let validId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task to Delete', description: 'Will be deleted' });

      validId = res.body.data.id;
    });

    test('should delete task with 200 status', async () => {
      const res = await request(app).delete(`/api/tasks/${validId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(validId);
      expect(res.body.message).toBe('Task deleted successfully');
    });

    test('should return 404 when deleting non-existent task', async () => {
      const res = await request(app).delete('/api/tasks/non-existent-id');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Task not found');
    });

    test('deleted task should not be retrievable', async () => {
      await request(app).delete(`/api/tasks/${validId}`);

      const res = await request(app).get(`/api/tasks/${validId}`);

      expect(res.status).toBe(404);
    });

    test('should remove task from list after deletion', async () => {
      const beforeRes = await request(app).get('/api/tasks');
      const countBefore = beforeRes.body.count;

      await request(app).delete(`/api/tasks/${validId}`);

      const afterRes = await request(app).get('/api/tasks');
      const countAfter = afterRes.body.count;

      expect(countAfter).toBe(countBefore - 1);
    });
  });

  describe('Response Structure Validation', () => {
    test('all endpoints should return consistent response format', async () => {
      const postRes = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test' });

      expect(postRes.body).toHaveProperty('success');
      expect(postRes.body).toHaveProperty('data');

      const getId = postRes.body.data.id;

      const getRes = await request(app).get(`/api/tasks/${getId}`);
      expect(getRes.body).toHaveProperty('success');
      expect(getRes.body).toHaveProperty('data');

      const listRes = await request(app).get('/api/tasks');
      expect(listRes.body).toHaveProperty('success');
      expect(listRes.body).toHaveProperty('data');
    });

    test('error responses should have error field', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: '' });

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
    });
  });
});
