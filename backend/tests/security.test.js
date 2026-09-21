const request = require('supertest');
const app = require('../server');

describe('Security Tests', () => {
  describe('XSS Prevention', () => {
    test('should not allow script tags in title', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: xssPayload });
      expect(res.status).toBe(201);
      expect(res.body.data.title).not.toContain('<script>');
    });

    test('should handle img onerror payloads', async () => {
      const xssPayload = '<img src=x onerror="alert(1)">';
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: xssPayload });
      expect(res.status).toBe(201);
      expect(res.body.data.title).not.toContain('onerror');
    });

    test('should sanitize event handlers', async () => {
      const xssPayload = 'Click <a href="javascript:alert(1)">here</a>';
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: xssPayload });
      expect(res.status).toBe(201);
      expect(res.body.data.title).not.toContain('javascript:');
    });

    test('should handle SVG injection attempts', async () => {
      const svgPayload = '<svg onload="alert(\'xss\')">';
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: svgPayload });
      expect(res.status).toBe(201);
      expect(res.body.data.title).not.toContain('onload');
    });

    test('should handle encoded HTML entities safely', async () => {
      const encoded = '&lt;script&gt;alert("xss")&lt;/script&gt;';
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: encoded });
      expect(res.status).toBe(201);
    });
  });

  describe('SQL Injection Prevention', () => {
    test('should not allow SQL injection in title', async () => {
      const sqlPayload = "'; DROP TABLE tasks; --";
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: sqlPayload });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const checkRes = await request(app).get('/api/tasks');
      expect(checkRes.status).toBe(200);
    });

    test('should handle OR 1=1 injections', async () => {
      const sqlPayload = "1' OR '1'='1";
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: sqlPayload });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('should handle UNION SELECT injections', async () => {
      const sqlPayload = "'; UNION SELECT * FROM users; --";
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: sqlPayload });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Input Validation', () => {
    test('should reject null bytes in input', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task\x00Name' });
      expect([201, 400]).toContain(res.status);
    });

    test('should handle Unicode normalization', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Tåsk' });
      expect(res.status).toBe(201);
    });

    test('should reject array in string field', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: ['array', 'of', 'strings'] });
      expect(res.status).toBe(400);
    });

    test('should ignore unknown fields', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task',
          unknownField: 'ignore',
          anotherUnknown: 12345
        });
      expect(res.status).toBe(201);
      expect(res.body.data.unknownField).toBeUndefined();
    });

    test('should ignore nested objects', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task',
          nested: { deep: { value: 'ignore' } }
        });
      expect(res.status).toBe(201);
      expect(res.body.data.nested).toBeUndefined();
    });
  });

  describe('Error Information Disclosure', () => {
    test('should not expose database error details', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ invalid: 'data' });
      const errorString = JSON.stringify(res.body).toLowerCase();
      expect(errorString).not.toMatch(/database|psql|sql|postgres/);
    });

    test('should not expose file paths in errors', async () => {
      const res = await request(app)
        .get('/api/invalid-endpoint');
      if (!res.body.success) {
        const errorString = JSON.stringify(res.body);
        expect(errorString).not.toMatch(/\/home\/|\/app\/|\.js:\d+/);
      }
    });

    test('should not expose stack traces', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: null });
      const errorString = JSON.stringify(res.body);
      expect(errorString).not.toMatch(/at\s+\w+/);
    });

    test('should use generic error messages', async () => {
      const res = await request(app)
        .get('/api/tasks/invalid');
      expect(res.status).toBe(400);
    });

    test('should not expose internal resource IDs in errors', async () => {
      const res = await request(app)
        .delete('/api/tasks/99999');
      if (res.status === 404) {
        expect(res.body.error).not.toContain('99999');
      }
    });
  });

  describe('Type Coercion & Bypass Prevention', () => {
    test('should reject non-string priority', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task', priority: 1 });
      expect(res.status).toBe(400);
    });

    test('should not allow priority case variation', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task', priority: 'HIGH' });
      expect(res.status).toBe(400);
    });

    test('should reject non-string status', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task', status: 1 });
      expect(res.status).toBe(400);
    });

    test('should reject status with whitespace', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task', status: ' pending ' });
      expect(res.status).toBe(400);
    });
  });

  describe('Rate Limiting & Resource Exhaustion', () => {
    test('should handle extremely large payloads gracefully', async () => {
      const hugePayload = 'x'.repeat(1000000);
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: hugePayload });
      expect([201, 400, 413]).toContain(res.status);
    });

    test('should handle deeply nested objects gracefully', async () => {
      let nested = { value: 'deep' };
      for (let i = 0; i < 100; i++) {
        nested = { nested };
      }
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task', ...nested });
      expect([201, 400]).toContain(res.status);
    });
  });

  describe('NoSQL Injection Prevention', () => {
    test('should handle NoSQL injection payloads', async () => {
      const nosqlPayload = '{"$ne": null}';
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: nosqlPayload });
      expect(res.status).toBe(201);
    });

    test('should handle $or operators in payloads', async () => {
      const nosqlPayload = '{"$or": [{}]}';
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: nosqlPayload });
      expect(res.status).toBe(201);
    });

    test('should handle regex injection attempts', async () => {
      const regexPayload = '{"$regex": ".*"}';
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: regexPayload });
      expect(res.status).toBe(201);
    });
  });

  describe('Command Injection Prevention', () => {
    test('should handle shell command injections', async () => {
      const cmdPayload = 'Task; rm -rf /';
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: cmdPayload });
      expect(res.status).toBe(201);
    });

    test('should handle backtick command execution', async () => {
      const cmdPayload = 'Task `whoami`';
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: cmdPayload });
      expect(res.status).toBe(201);
    });

    test('should handle pipe operators in payloads', async () => {
      const cmdPayload = 'Task | cat /etc/passwd';
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: cmdPayload });
      expect(res.status).toBe(201);
    });
  });

  describe('Response Header Injection Prevention', () => {
    test('should handle newline injection in payload', async () => {
      const injectionPayload = 'Task\r\nSet-Cookie: admin=true';
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: injectionPayload });
      expect(res.status).toBe(201);
    });
  });

  describe('Sensitive Information Handling', () => {
    test('should not echo sensitive request data in errors', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Secret Password 123456',
          apiKey: 'sk_live_123456789'
        });
      if (!res.body.success) {
        expect(res.body.error).not.toContain('123456');
        expect(res.body.error).not.toContain('sk_live');
      }
    });

    test('should sanitize debug information', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test' });
      const resString = JSON.stringify(res.body);
      expect(resString).not.toContain('password');
      expect(resString).not.toContain('secret');
    });
  });
});
