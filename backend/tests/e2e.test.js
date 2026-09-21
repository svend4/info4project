const request = require('supertest');
const app = require('../src/server');

describe('E2E Task Management Flows', () => {
  describe('Create, Read, Update, Delete Flow', () => {
    test('complete task lifecycle', async () => {
      // Step 1: Create a task
      const createRes = await request(app)
        .post('/api/tasks')
        .send({
          title: 'End-to-End Test Task',
          description: 'Testing complete flow'
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);

      const taskId = createRes.body.data.id;
      const createdAt = createRes.body.data.createdAt;

      // Step 2: Verify task appears in list
      const listRes = await request(app).get('/api/tasks');

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.some(t => t.id === taskId)).toBe(true);

      // Step 3: Retrieve specific task
      const getRes = await request(app).get(`/api/tasks/${taskId}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.id).toBe(taskId);
      expect(getRes.body.data.title).toBe('End-to-End Test Task');
      expect(getRes.body.data.completed).toBe(false);

      // Step 4: Update task
      const updateRes = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({
          title: 'Updated Test Task',
          description: 'Flow update',
          completed: true
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.title).toBe('Updated Test Task');
      expect(updateRes.body.data.completed).toBe(true);
      expect(updateRes.body.data.createdAt).toBe(createdAt);

      // Step 5: Verify update in list
      const listAfterUpdateRes = await request(app).get('/api/tasks');
      const updatedTask = listAfterUpdateRes.body.data.find(t => t.id === taskId);

      expect(updatedTask.title).toBe('Updated Test Task');
      expect(updatedTask.completed).toBe(true);

      // Step 6: Delete task
      const deleteRes = await request(app).delete(`/api/tasks/${taskId}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // Step 7: Verify task is removed from list
      const listAfterDeleteRes = await request(app).get('/api/tasks');

      expect(listAfterDeleteRes.body.data.some(t => t.id === taskId)).toBe(false);
    });
  });

  describe('Multiple Tasks Management', () => {
    test('create multiple tasks and manage them', async () => {
      const taskTitles = [
        'Task One',
        'Task Two',
        'Task Three'
      ];

      const createdTasks = [];

      // Create multiple tasks
      for (const title of taskTitles) {
        const res = await request(app)
          .post('/api/tasks')
          .send({ title, description: `Description for ${title}` });

        expect(res.status).toBe(201);
        createdTasks.push(res.body.data);
      }

      // Verify all tasks in list
      const listRes = await request(app).get('/api/tasks');

      expect(listRes.body.data.length).toBeGreaterThanOrEqual(3);

      for (const task of createdTasks) {
        expect(listRes.body.data.some(t => t.id === task.id)).toBe(true);
      }

      // Update first task
      const firstTaskId = createdTasks[0].id;
      const updateRes = await request(app)
        .put(`/api/tasks/${firstTaskId}`)
        .send({ completed: true });

      expect(updateRes.body.data.completed).toBe(true);

      // Delete second task
      const secondTaskId = createdTasks[1].id;
      const deleteRes = await request(app)
        .delete(`/api/tasks/${secondTaskId}`);

      expect(deleteRes.status).toBe(200);

      // Verify final state
      const finalListRes = await request(app).get('/api/tasks');

      expect(finalListRes.body.data.some(t => t.id === firstTaskId)).toBe(true);
      expect(finalListRes.body.data.some(t => t.id === secondTaskId)).toBe(false);
      expect(finalListRes.body.data.some(t => t.id === createdTasks[2].id)).toBe(true);
    });
  });

  describe('Error Handling Flow', () => {
    test('handle various error scenarios', async () => {
      // Attempt to create with missing title
      const invalidCreateRes = await request(app)
        .post('/api/tasks')
        .send({ description: 'No title' });

      expect(invalidCreateRes.status).toBe(400);
      expect(invalidCreateRes.body.success).toBe(false);

      // Create valid task for further testing
      const createRes = await request(app)
        .post('/api/tasks')
        .send({ title: 'Valid Task' });

      const taskId = createRes.body.data.id;

      // Attempt to get non-existent task
      const getInvalidRes = await request(app)
        .get('/api/tasks/invalid-id-12345');

      expect(getInvalidRes.status).toBe(404);
      expect(getInvalidRes.body.success).toBe(false);

      // Attempt to update with empty title
      const updateInvalidRes = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: '' });

      expect(updateInvalidRes.status).toBe(400);
      expect(updateInvalidRes.body.success).toBe(false);

      // Attempt to delete non-existent task
      const deleteInvalidRes = await request(app)
        .delete('/api/tasks/invalid-id-99999');

      expect(deleteInvalidRes.status).toBe(404);
      expect(deleteInvalidRes.body.success).toBe(false);

      // Verify valid task still exists
      const validGetRes = await request(app).get(`/api/tasks/${taskId}`);

      expect(validGetRes.status).toBe(200);
      expect(validGetRes.body.data.id).toBe(taskId);
    });
  });

  describe('Data Integrity', () => {
    test('maintain data integrity through operations', async () => {
      // Create task
      const createRes = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Integrity Test',
          description: 'Test data integrity'
        });

      const task = createRes.body.data;
      const taskId = task.id;

      // Perform multiple updates
      const updates = [
        { completed: true },
        { description: 'Updated description' },
        { title: 'New Title', completed: false }
      ];

      let lastUpdatedAt = task.updatedAt;

      for (const update of updates) {
        const updateRes = await request(app)
          .put(`/api/tasks/${taskId}`)
          .send(update);

        expect(updateRes.status).toBe(200);

        // Verify ID and createdAt unchanged
        expect(updateRes.body.data.id).toBe(taskId);
        expect(updateRes.body.data.createdAt).toBe(task.createdAt);

        // Verify updatedAt changes
        expect(new Date(updateRes.body.data.updatedAt).getTime())
          .toBeGreaterThanOrEqual(new Date(lastUpdatedAt).getTime());

        lastUpdatedAt = updateRes.body.data.updatedAt;
      }

      // Final verification
      const finalRes = await request(app).get(`/api/tasks/${taskId}`);

      expect(finalRes.body.data.id).toBe(taskId);
      expect(finalRes.body.data.createdAt).toBe(task.createdAt);
      expect(finalRes.body.data.title).toBe('New Title');
      expect(finalRes.body.data.completed).toBe(false);
      expect(finalRes.body.data.description).toBe('Updated description');
    });
  });
});
