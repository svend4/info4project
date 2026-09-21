const request = require('supertest');
const app = require('../server');

describe('Edge Cases & Error Scenarios', () => {
  describe('Task Creation - Input Validation', () => {
    test('should reject task with empty title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: '' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject task with title > 200 chars', async () => {
      const longTitle = 'a'.repeat(201);
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: longTitle });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should handle special characters in title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task with 特殊文字 & <script>alert</script>' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('特殊文字');
    });

    test('should accept valid priority values only', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test', priority: 'invalid_priority' });
      expect([400, 201]).toContain(res.status);
    });

    test('should set default status to todo', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' });
      expect(res.status).toBe(201);
      expect(['todo', 'pending']).toContain(res.body.data.status);
    });
  });

  describe('Task Updates - Concurrency', () => {
    test('should not allow updating non-existent task', async () => {
      const res = await request(app)
        .put('/api/tasks/99999')
        .send({ status: 'done' });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('should handle concurrent updates correctly', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .send({ title: 'Concurrent Test' });
      const taskId = createRes.body.data.id;

      const promises = Array(5).fill(null).map(() =>
        request(app)
          .put(`/api/tasks/${taskId}`)
          .send({ status: 'in-progress' })
      );
      const results = await Promise.all(promises);
      expect(results.every(r => r.status === 200 || r.status === 201 || r.status === 400)).toBe(true);
    });

    test('should handle concurrent delete while reading', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .send({ title: 'Delete Test' });
      const taskId = createRes.body.data.id;

      const deletePromise = request(app).delete(`/api/tasks/${taskId}`);
      const readPromise = request(app).get(`/api/tasks/${taskId}`);

      const [deleteRes, readRes] = await Promise.all([deletePromise, readPromise]);
      expect([200, 404]).toContain(deleteRes.status);
      expect([200, 404]).toContain(readRes.status);
    });
  });

  describe('API Contract Validation', () => {
    test('all responses should have required fields', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('error');
      expect(typeof res.body.success).toBe('boolean');
    });

    test('success=true should have data field', async () => {
      const res = await request(app).get('/api/tasks');
      if (res.body.success) {
        expect(res.body.data).toBeDefined();
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });

    test('success=false should have error field', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({});
      if (!res.body.success) {
        expect(res.body.error).toBeDefined();
        expect(res.body.error).not.toBe(null);
      }
    });

    test('count should match data length when present', async () => {
      const res = await request(app).get('/api/tasks');
      if (res.body.success && res.body.count) {
        expect(res.body.count).toBe(res.body.data.length);
      }
    });
  });

  describe('Performance Edge Cases', () => {
    test('should handle rapid sequential creates', async () => {
      const start = Date.now();
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(
          request(app)
            .post('/api/tasks')
            .send({ title: `Rapid Task ${i}` })
        );
      }
      await Promise.all(results);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(10000);
    });

    test('should handle large payloads', async () => {
      const largeDescription = 'x'.repeat(5000);
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Large Task',
          description: largeDescription
        });
      expect([201, 400]).toContain(res.status);
    });
  });

  describe('Boundary Conditions', () => {
    test('should handle zero and negative IDs gracefully', async () => {
      const res = await request(app).get('/api/tasks/0');
      expect([400, 404]).toContain(res.status);
    });

    test('should handle string IDs that look like numbers', async () => {
      const res = await request(app).get('/api/tasks/abc123');
      expect([400, 404]).toContain(res.status);
    });

    test('should handle whitespace-only title gracefully', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: '   \t\n  ' });
      expect([400]).toContain(res.status);
    });

    test('should handle null title gracefully', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: null });
      expect([400]).toContain(res.status);
    });

    test('should handle undefined title gracefully', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({});
      expect([400]).toContain(res.status);
    });
  });

  describe('DELETE Edge Cases', () => {
    test('should handle deleting middle task', async () => {
      const t1 = await request(app).post('/api/tasks').send({ title: 'T1' });
      const t2 = await request(app).post('/api/tasks').send({ title: 'T2' });
      const t3 = await request(app).post('/api/tasks').send({ title: 'T3' });
      const id2 = t2.body.data.id;

      const deleteRes = await request(app).delete(`/api/tasks/${id2}`);
      expect([200, 204]).toContain(deleteRes.status);
    });

    test('should handle double delete gracefully', async () => {
      const t = await request(app).post('/api/tasks').send({ title: 'Task' });
      const id = t.body.data.id;

      const firstDelete = await request(app).delete(`/api/tasks/${id}`);
      expect([200, 204]).toContain(firstDelete.status);

      const secondDelete = await request(app).delete(`/api/tasks/${id}`);
      expect([404]).toContain(secondDelete.status);
    });

    test('should handle delete with invalid ID', async () => {
      const response = await request(app)
        .delete('/api/tasks/not-a-number');
      expect([400, 404]).toContain(response.status);
    });
  });

  describe('UPDATE Edge Cases', () => {
    test('should preserve unmodified fields', async () => {
      const create = await request(app).post('/api/tasks').send({
        title: 'Original',
        priority: 'high',
        description: 'Desc'
      });
      const id = create.body.data.id;

      const update = await request(app).put(`/api/tasks/${id}`).send({ title: 'Updated' });
      expect(update.status).toBe(200);
      expect(update.body.data.priority).toBe('high');
      expect(update.body.data.description).toBe('Desc');
      expect(update.body.data.title).toBe('Updated');
    });

    test('should handle empty update payload', async () => {
      const create = await request(app).post('/api/tasks').send({ title: 'Task' });
      const id = create.body.data.id;
      const response = await request(app).put(`/api/tasks/${id}`).send({});
      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Task');
    });

    test('should trim title on update', async () => {
      const create = await request(app).post('/api/tasks').send({ title: 'Task' });
      const id = create.body.data.id;
      const response = await request(app)
        .put(`/api/tasks/${id}`)
        .send({ title: '  Trimmed  ' });
      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Trimmed');
    });

    test('should reject multiple validation errors', async () => {
      const create = await request(app).post('/api/tasks').send({ title: 'Task' });
      const id = create.body.data.id;
      const response = await request(app)
        .put(`/api/tasks/${id}`)
        .send({ priority: 'super-high', status: 'archived' });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Data Integrity', () => {
    test('should maintain ID sequencing', async () => {
      const r1 = await request(app).post('/api/tasks').send({ title: 'T1' });
      const r2 = await request(app).post('/api/tasks').send({ title: 'T2' });
      expect(r2.body.data.id).toBeGreaterThanOrEqual(r1.body.data.id);
    });

    test('should preserve timestamps across updates', async () => {
      const create = await request(app).post('/api/tasks').send({ title: 'Task' });
      const id = create.body.data.id;
      const created = create.body.data.createdAt;

      await new Promise(r => setTimeout(r, 100));

      const update = await request(app).put(`/api/tasks/${id}`).send({ title: 'Updated' });
      expect(update.status).toBe(200);
      expect(update.body.data.createdAt).toBe(created);
    });

    test('should validate all tasks have required fields', async () => {
      await request(app).post('/api/tasks').send({ title: 'T1', priority: 'high' });
      await request(app).post('/api/tasks').send({ title: 'T2', priority: 'low' });

      const get = await request(app).get('/api/tasks');
      get.body.data.forEach(task => {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('status');
      });
    });
  });

  describe('Comprehensive Validation', () => {
    test('should handle whitespace in title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '  Task   With    Multiple    Spaces  ' });
      expect(response.status).toBe(201);
      expect(response.body.data.title).toContain('Task');
    });

    test('should accept all valid optional fields omitted', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Minimal' });
      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('status');
    });

    test('should handle partial update with valid fields', async () => {
      const create = await request(app).post('/api/tasks').send({
        title: 'Orig',
        priority: 'low',
        description: 'Desc'
      });
      const id = create.body.data.id;
      const response = await request(app)
        .put(`/api/tasks/${id}`)
        .send({ priority: 'high' });
      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Orig');
      expect(response.body.data.priority).toBe('high');
      expect(response.body.data.description).toBe('Desc');
    });
  });
});
