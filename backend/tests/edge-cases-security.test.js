const request = require('supertest');
const app = require('../server');

describe('Task Management API - Edge Cases & Security', () => {
  beforeEach(() => {
    global.gc && global.gc();
  });

  // Input Validation Edge Cases
  describe('Input Validation - Edge Cases', () => {
    describe('Title Field Validation', () => {
      it('should reject null title', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: null })
          .expect(400);
        expect(response.body.error).toBe('title is required');
      });

      it('should reject undefined title', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({})
          .expect(400);
        expect(response.body.error).toBe('title is required');
      });

      it('should reject title with only whitespace', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: '\t\t  \n  ' })
          .expect(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject non-string title', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 123 })
          .expect(400);
        expect(response.body.success).toBe(false);
      });

      it('should trim whitespace from title', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: '   Valid Title   ' })
          .expect(201);
        expect(response.body.data.title).toBe('Valid Title');
      });

      it('should handle extremely long title', async () => {
        const longTitle = 'a'.repeat(5000);
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: longTitle })
          .expect(201);
        expect(response.body.data.title).toBe(longTitle);
      });

      it('should handle title with special characters', async () => {
        const specialTitle = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: specialTitle })
          .expect(201);
        expect(response.body.data.title).toBe(specialTitle);
      });

      it('should handle title with newlines and tabs', async () => {
        const titleWithNewlines = 'Task\nWith\nNewlines\tAnd\tTabs';
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: titleWithNewlines })
          .expect(201);
        expect(response.body.data.title).toBe(titleWithNewlines);
      });
    });

    describe('Description Field Validation', () => {
      it('should handle null description', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task', description: null })
          .expect(201);
        expect(response.body.data.description).toBeNull();
      });

      it('should handle empty string description', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task', description: '' })
          .expect(201);
        expect(response.body.data.description).toBe('');
      });

      it('should reject non-string description', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task', description: 123 })
          .expect(400);
        expect(response.body.errors).toContain('description must be a string');
      });

      it('should accept description with special characters', async () => {
        const specialDesc = '<script>alert("xss")</script>';
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task', description: specialDesc })
          .expect(201);
        expect(response.body.data.description).toBe(specialDesc);
      });

      it('should handle very long description', async () => {
        const longDesc = 'a'.repeat(10000);
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task', description: longDesc })
          .expect(201);
        expect(response.body.data.description).toBe(longDesc);
      });
    });

    describe('Priority Field Validation', () => {
      it('should accept low priority', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task', priority: 'low' })
          .expect(201);
        expect(response.body.data.priority).toBe('low');
      });

      it('should accept high priority', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task', priority: 'high' })
          .expect(201);
        expect(response.body.data.priority).toBe('high');
      });

      it('should reject invalid priority', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task', priority: 'urgent' })
          .expect(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject case-sensitive priority', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task', priority: 'HIGH' })
          .expect(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject numeric priority', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task', priority: 1 })
          .expect(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject priority with whitespace', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task', priority: ' high ' })
          .expect(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('Status Field Validation', () => {
      it('should default to pending on creation', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task' })
          .expect(201);
        expect(response.body.data.status).toBe('pending');
      });

      it('should accept in-progress status on update', async () => {
        const create = await request(app).post('/api/tasks').send({ title: 'Task' });
        const id = create.body.data.id;
        const response = await request(app)
          .put(`/api/tasks/${id}`)
          .send({ status: 'in-progress' })
          .expect(200);
        expect(response.body.data.status).toBe('in-progress');
      });

      it('should accept completed status on update', async () => {
        const create = await request(app).post('/api/tasks').send({ title: 'Task' });
        const id = create.body.data.id;
        const response = await request(app)
          .put(`/api/tasks/${id}`)
          .send({ status: 'completed' })
          .expect(200);
        expect(response.body.data.status).toBe('completed');
      });

      it('should reject invalid status on update', async () => {
        const create = await request(app).post('/api/tasks').send({ title: 'Task' });
        const id = create.body.data.id;
        const response = await request(app)
          .put(`/api/tasks/${id}`)
          .send({ status: 'invalid' })
          .expect(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('DueDate Field Validation', () => {
      it('should accept valid ISO date', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task', dueDate: '2025-12-31' })
          .expect(201);
        expect(response.body.data.dueDate).toBe('2025-12-31');
      });

      it('should accept full ISO datetime', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task', dueDate: '2025-12-31T23:59:59Z' })
          .expect(201);
        expect(response.body.data.dueDate).toBe('2025-12-31T23:59:59Z');
      });

      it('should accept null dueDate', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task', dueDate: null })
          .expect(201);
        expect(response.body.data.dueDate).toBeNull();
      });

      it('should reject invalid date string', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task', dueDate: 'not-a-date' })
          .expect(400);
        expect(response.body.errors).toContain('dueDate must be a valid date');
      });

      it('should reject malformed date format', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task', dueDate: '31/12/2025' })
          .expect(400);
        expect(response.body.success).toBe(false);
      });
    });
  });

  // Security Tests
  describe('Security - XSS Prevention', () => {
    it('should store HTML tags as-is', async () => {
      const xss = '<script>alert("XSS")</script>';
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: xss })
        .expect(201);
      expect(response.body.data.title).toBe(xss);
    });

    it('should preserve event handlers in description', async () => {
      const eventPayload = '<img src=x onerror="alert(\'xss\')">';
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task', description: eventPayload })
        .expect(201);
      expect(response.body.data.description).toBe(eventPayload);
    });

    it('should handle encoded HTML entities', async () => {
      const encoded = '&lt;script&gt;alert("xss")&lt;/script&gt;';
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: encoded })
        .expect(201);
      expect(response.body.data.title).toBe(encoded);
    });

    it('should handle data URLs', async () => {
      const dataUrl = 'data:text/html,<script>alert("xss")</script>';
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task', description: dataUrl })
        .expect(201);
      expect(response.body.data.description).toBe(dataUrl);
    });

    it('should handle SVG injection', async () => {
      const svg = '<svg onload="alert(\'xss\')">';
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: svg })
        .expect(201);
      expect(response.body.data.title).toBe(svg);
    });
  });

  describe('Security - Injection Prevention', () => {
    it('should handle SQL injection attempt', async () => {
      const sql = "'; DROP TABLE tasks; --";
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: sql })
        .expect(201);
      expect(response.body.data.title).toBe(sql);
    });

    it('should handle NoSQL injection', async () => {
      const nosql = '{"$ne": null}';
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: nosql })
        .expect(201);
      expect(response.body.data.title).toBe(nosql);
    });

    it('should handle null byte injection', async () => {
      const nullByte = 'Task\x00Hidden';
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: nullByte })
        .expect(201);
      expect(response.body.data.title).toBe(nullByte);
    });

    it('should handle command injection', async () => {
      const cmd = 'Task; rm -rf /';
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: cmd })
        .expect(201);
      expect(response.body.data.title).toBe(cmd);
    });
  });

  describe('Security - Error Safety', () => {
    it('should not expose stack traces', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '', priority: 'invalid' })
        .expect(400);
      const json = JSON.stringify(response.body);
      expect(json).not.toMatch(/Error|at /);
    });

    it('should use generic error messages', async () => {
      const response = await request(app)
        .get('/api/tasks/invalid')
        .expect(400);
      expect(response.body.error).toBe('Invalid task id');
    });

    it('should not expose internal IDs', async () => {
      const response = await request(app)
        .delete('/api/tasks/99999')
        .expect(404);
      expect(response.body.error).not.toContain('99999');
    });
  });

  describe('Security - Request Validation', () => {
    it('should ignore unknown fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task',
          unknownField: 'ignore',
          anotherUnknown: 12345
        })
        .expect(201);
      expect(response.body.data.unknownField).toBeUndefined();
    });

    it('should handle nested objects', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task',
          nested: { deep: { value: 'ignore' } }
        })
        .expect(201);
      expect(response.body.data.nested).toBeUndefined();
    });

    it('should handle array in string field', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: ['array', 'of', 'strings'] })
        .expect(400);
      expect(response.body.success).toBe(false);
    });
  });

  // Boundary & Concurrency Tests
  describe('Boundary Conditions', () => {
    it('should handle non-existent task ID', async () => {
      const response = await request(app)
        .get('/api/tasks/999999999')
        .expect(404);
      expect(response.body.success).toBe(false);
    });

    it('should validate non-numeric IDs', async () => {
      const response = await request(app)
        .get('/api/tasks/abc');
      expect(response.status).toBe(400);
    });

    it('should handle ID with leading zeros', async () => {
      const response = await request(app)
        .get('/api/tasks/001');
      expect([200, 404]).toContain(response.status);
    });

    it('should handle float ID', async () => {
      const response = await request(app)
        .get('/api/tasks/3.14');
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent POSTs', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app).post('/api/tasks').send({ title: `Task ${i}` })
        );
      }
      const responses = await Promise.all(promises);
      responses.forEach(r => {
        expect(r.status).toBe(201);
        expect(r.body.success).toBe(true);
      });
      const ids = new Set(responses.map(r => r.body.data.id));
      expect(ids.size).toBe(5);
    });

    it('should handle concurrent GET and POST', async () => {
      const [create, get] = await Promise.all([
        request(app).post('/api/tasks').send({ title: 'Task' }),
        request(app).get('/api/tasks')
      ]);
      expect(create.status).toBe(201);
      expect(get.status).toBe(200);
    });

    it('should handle concurrent updates to same ID', async () => {
      const create = await request(app).post('/api/tasks').send({ title: 'Task' });
      const id = create.body.data.id;
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app).put(`/api/tasks/${id}`).send({ title: `Updated ${i}` })
        );
      }
      const responses = await Promise.all(promises);
      responses.forEach(r => {
        expect(r.status).toBe(200);
        expect(r.body.success).toBe(true);
      });
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should respond to GET /api/tasks quickly', async () => {
      const start = Date.now();
      await request(app).get('/api/tasks').expect(200);
      expect(Date.now() - start).toBeLessThan(1000);
    });

    it('should respond to POST quickly', async () => {
      const start = Date.now();
      await request(app).post('/api/tasks').send({ title: 'Task' }).expect(201);
      expect(Date.now() - start).toBeLessThan(1000);
    });

    it('should respond to GET with ID quickly', async () => {
      const create = await request(app).post('/api/tasks').send({ title: 'Task' });
      const id = create.body.data.id;
      const start = Date.now();
      await request(app).get(`/api/tasks/${id}`).expect(200);
      expect(Date.now() - start).toBeLessThan(1000);
    });

    it('should handle multiple rapid requests', async () => {
      const start = Date.now();
      for (let i = 0; i < 10; i++) {
        await request(app).post('/api/tasks').send({ title: `Task ${i}` });
      }
      expect(Date.now() - start).toBeLessThan(5000);
    });
  });

  // Delete Operation Tests
  describe('DELETE Edge Cases', () => {
    it('should handle deleting middle task', async () => {
      const t1 = await request(app).post('/api/tasks').send({ title: 'T1' });
      const t2 = await request(app).post('/api/tasks').send({ title: 'T2' });
      const t3 = await request(app).post('/api/tasks').send({ title: 'T3' });
      const id2 = t2.body.data.id;

      await request(app).delete(`/api/tasks/${id2}`).expect(200);

      await request(app).get(`/api/tasks/${t1.body.data.id}`).expect(200);
      await request(app).get(`/api/tasks/${t3.body.data.id}`).expect(200);
    });

    it('should handle deleting first task', async () => {
      const t1 = await request(app).post('/api/tasks').send({ title: 'First' });
      await request(app).post('/api/tasks').send({ title: 'Second' });
      const response = await request(app).delete(`/api/tasks/${t1.body.data.id}`).expect(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle deleting last task', async () => {
      await request(app).post('/api/tasks').send({ title: 'First' });
      const t2 = await request(app).post('/api/tasks').send({ title: 'Last' });
      const response = await request(app).delete(`/api/tasks/${t2.body.data.id}`).expect(200);
      expect(response.body.success).toBe(true);
    });

    it('should correctly update count after delete', async () => {
      const before = await request(app).get('/api/tasks');
      const countBefore = before.body.total;

      const t1 = await request(app).post('/api/tasks').send({ title: 'T1' });
      const t2 = await request(app).post('/api/tasks').send({ title: 'T2' });

      await request(app).delete(`/api/tasks/${t2.body.data.id}`);

      const after = await request(app).get('/api/tasks');
      expect(after.body.total).toBe(countBefore + 1);
    });

    it('should handle double delete', async () => {
      const t = await request(app).post('/api/tasks').send({ title: 'Task' });
      const id = t.body.data.id;

      await request(app).delete(`/api/tasks/${id}`).expect(200);
      const response = await request(app).delete(`/api/tasks/${id}`).expect(404);
      expect(response.body.success).toBe(false);
    });

    it('should handle delete with invalid ID', async () => {
      const response = await request(app)
        .delete('/api/tasks/not-a-number')
        .expect(400);
      expect(response.body.success).toBe(false);
    });
  });

  // Update Tests
  describe('UPDATE Edge Cases', () => {
    it('should preserve unmodified fields', async () => {
      const create = await request(app).post('/api/tasks').send({
        title: 'Original',
        priority: 'high',
        description: 'Desc'
      });
      const id = create.body.data.id;

      const update = await request(app).put(`/api/tasks/${id}`).send({ title: 'Updated' });
      expect(update.body.data.priority).toBe('high');
      expect(update.body.data.description).toBe('Desc');
      expect(update.body.data.title).toBe('Updated');
    });

    it('should handle empty update payload', async () => {
      const create = await request(app).post('/api/tasks').send({ title: 'Task' });
      const id = create.body.data.id;
      const response = await request(app).put(`/api/tasks/${id}`).send({}).expect(200);
      expect(response.body.data.title).toBe('Task');
    });

    it('should trim title on update', async () => {
      const create = await request(app).post('/api/tasks').send({ title: 'Task' });
      const id = create.body.data.id;
      const response = await request(app)
        .put(`/api/tasks/${id}`)
        .send({ title: '  Trimmed  ' })
        .expect(200);
      expect(response.body.data.title).toBe('Trimmed');
    });

    it('should reject multiple validation errors', async () => {
      const create = await request(app).post('/api/tasks').send({ title: 'Task' });
      const id = create.body.data.id;
      const response = await request(app)
        .put(`/api/tasks/${id}`)
        .send({ priority: 'urgent', status: 'archived' })
        .expect(400);
      expect(response.body.success).toBe(false);
    });
  });

  // Data Integrity
  describe('Data Integrity', () => {
    it('should maintain ID sequencing', async () => {
      const r1 = await request(app).post('/api/tasks').send({ title: 'T1' });
      const r2 = await request(app).post('/api/tasks').send({ title: 'T2' });
      expect(r2.body.data.id).toBeGreaterThan(r1.body.data.id);
    });

    it('should preserve timestamps across updates', async () => {
      const create = await request(app).post('/api/tasks').send({ title: 'Task' });
      const id = create.body.data.id;
      const created = create.body.data.createdAt;

      await new Promise(r => setTimeout(r, 100));

      const update = await request(app).put(`/api/tasks/${id}`).send({ title: 'Updated' });
      expect(update.body.data.createdAt).toBe(created);
      expect(update.body.data.updatedAt).not.toBe(created);
    });

    it('should validate all tasks have required fields', async () => {
      await request(app).post('/api/tasks').send({ title: 'T1', priority: 'high' });
      await request(app).post('/api/tasks').send({ title: 'T2', priority: 'low' });

      const get = await request(app).get('/api/tasks');
      get.body.data.forEach(task => {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('status');
        expect(task).toHaveProperty('priority');
      });
    });
  });

  // Health Check
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });
  });

  // Comprehensive Validation
  describe('Comprehensive Validation', () => {
    it('should handle whitespace in title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '  Task   With    Multiple    Spaces  ' })
        .expect(201);
      expect(response.body.data.title).toBe('Task   With    Multiple    Spaces');
    });

    it('should accept all valid optional fields omitted', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Minimal' })
        .expect(201);
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('priority');
      expect(response.body.data).toHaveProperty('status');
    });

    it('should handle partial update with valid fields', async () => {
      const create = await request(app).post('/api/tasks').send({
        title: 'Orig',
        priority: 'low',
        description: 'Desc'
      });
      const id = create.body.data.id;
      const response = await request(app)
        .put(`/api/tasks/${id}`)
        .send({ priority: 'high' })
        .expect(200);
      expect(response.body.data.title).toBe('Orig');
      expect(response.body.data.priority).toBe('high');
      expect(response.body.data.description).toBe('Desc');
    });

    it('should reject invalid with valid fields', async () => {
      const create = await request(app).post('/api/tasks').send({ title: 'Task' });
      const id = create.body.data.id;
      const response = await request(app)
        .put(`/api/tasks/${id}`)
        .send({ title: 'Updated', priority: 'super-high' })
        .expect(400);
      expect(response.body.success).toBe(false);
    });
  });
});
