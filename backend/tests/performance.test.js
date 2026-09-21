const request = require('supertest');
const app = require('../server');

describe('Performance Testing & Load Benchmarks', () => {
  let createdTaskIds = [];

  afterAll(async () => {
    // Cleanup
    for (const id of createdTaskIds) {
      await request(app).delete(`/api/tasks/${id}`);
    }
  });

  describe('Throughput & Latency Benchmarks', () => {
    test('throughput benchmark - GET /api/tasks (baseline)', async () => {
      const iterations = 50;
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        const res = await request(app).get('/api/tasks');
        expect(res.status).toBe(200);
      }

      const duration = Date.now() - startTime;
      const requestsPerSecond = (iterations / duration) * 1000;

      console.log(`\n📊 Throughput Benchmark:`);
      console.log(`  - ${iterations} requests in ${duration}ms`);
      console.log(`  - ${requestsPerSecond.toFixed(2)} requests/second`);
      console.log(`  - Avg latency: ${(duration / iterations).toFixed(2)}ms`);

      // Target: >= 500 req/sec (for reasonable hardware)
      // On fast hardware might be 1000+, on slow might be 100+
      // This is relative benchmark
      expect(requestsPerSecond).toBeGreaterThan(50);
    }, 30000);

    test('individual request latency - GET /api/tasks', async () => {
      const latencies = [];
      const iterations = 20;

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        const res = await request(app).get('/api/tasks');
        const latency = Date.now() - startTime;
        latencies.push(latency);
        expect(res.status).toBe(200);
      }

      latencies.sort((a, b) => a - b);
      const avg = latencies.reduce((a, b) => a + b) / latencies.length;
      const p50 = latencies[Math.floor(latencies.length * 0.5)];
      const p99 = latencies[Math.floor(latencies.length * 0.99)];

      console.log(`\n📊 Request Latency Benchmark:`);
      console.log(`  - Average: ${avg.toFixed(2)}ms`);
      console.log(`  - p50 (median): ${p50.toFixed(2)}ms`);
      console.log(`  - p99: ${p99.toFixed(2)}ms`);
      console.log(`  - Min: ${Math.min(...latencies).toFixed(2)}ms`);
      console.log(`  - Max: ${Math.max(...latencies).toFixed(2)}ms`);

      // Targets (reasonable bounds)
      expect(avg).toBeLessThan(500); // Average under 500ms
      expect(p99).toBeLessThan(1000); // p99 under 1 second
    }, 30000);
  });

  describe('Load Testing', () => {
    test('load test - simultaneous task creation (20 concurrent)', async () => {
      const concurrency = 20;
      const startTime = Date.now();
      const results = [];

      for (let i = 0; i < concurrency; i++) {
        results.push(
          request(app)
            .post('/api/tasks')
            .send({ 
              title: `Load Test Task ${i}`,
              priority: 'medium'
            })
        );
      }

      const responses = await Promise.all(results);
      const duration = Date.now() - startTime;

      // Track created IDs for cleanup
      responses.forEach(res => {
        if (res.body.success && res.body.data.id) {
          createdTaskIds.push(res.body.data.id);
        }
      });

      const successCount = responses.filter(r => r.status === 201).length;
      const failureCount = responses.filter(r => r.status !== 201).length;

      console.log(`\n📊 Load Test Results (Concurrent Creates):`);
      console.log(`  - ${concurrency} concurrent requests in ${duration}ms`);
      console.log(`  - Success: ${successCount}/${concurrency}`);
      console.log(`  - Failures: ${failureCount}/${concurrency}`);
      console.log(`  - Throughput: ${(concurrency / (duration / 1000)).toFixed(2)} req/sec`);

      expect(successCount).toBeGreaterThan(0);
    }, 30000);

    test('sustained load - 100 rapid sequential creates', async () => {
      const operations = 100;
      const startTime = Date.now();

      for (let i = 0; i < operations; i++) {
        const res = await request(app)
          .post('/api/tasks')
          .send({ title: `Sequential Task ${i}` });
        
        expect([201, 400]).toContain(res.status);
        
        if (res.body.success && res.body.data.id) {
          createdTaskIds.push(res.body.data.id);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`\n📊 Sustained Load Test:`);
      console.log(`  - ${operations} sequential operations in ${duration}ms`);
      console.log(`  - Throughput: ${(operations / (duration / 1000)).toFixed(2)} req/sec`);

      expect(duration).toBeLessThan(60000); // Should complete in < 60 seconds
    }, 120000);
  });

  describe('Mixed Operations Performance', () => {
    test('concurrent mixed read/write operations (50 ops)', async () => {
      const operations = 50;
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < operations; i++) {
        if (i % 2 === 0) {
          // Read operation
          promises.push(request(app).get('/api/tasks'));
        } else {
          // Write operation
          promises.push(
            request(app)
              .post('/api/tasks')
              .send({ title: `Mixed Op Task ${i}` })
          );
        }
      }

      const responses = await Promise.all(promises);
      const duration = Date.now() - startTime;

      responses.forEach(res => {
        if (res.body.success && res.body.data && res.body.data.id) {
          createdTaskIds.push(res.body.data.id);
        }
      });

      console.log(`\n📊 Mixed Operations Performance:`);
      console.log(`  - ${operations} mixed ops (read/write) in ${duration}ms`);
      console.log(`  - Throughput: ${(operations / (duration / 1000)).toFixed(2)} req/sec`);

      expect(duration).toBeLessThan(30000); // < 30 seconds
    }, 60000);
  });

  describe('Memory & Resource Usage', () => {
    test('memory usage under load - repeated reads', async () => {
      const memBefore = process.memoryUsage().heapUsed / 1024 / 1024;

      for (let i = 0; i < 100; i++) {
        await request(app).get('/api/tasks');
      }

      const memAfter = process.memoryUsage().heapUsed / 1024 / 1024;
      const memIncrease = memAfter - memBefore;

      console.log(`\n📊 Memory Usage:`);
      console.log(`  - Before: ${memBefore.toFixed(2)} MB`);
      console.log(`  - After: ${memAfter.toFixed(2)} MB`);
      console.log(`  - Increase: ${memIncrease.toFixed(2)} MB`);

      // Should not have excessive memory growth (< 50MB increase for 100 requests)
      expect(Math.abs(memIncrease)).toBeLessThan(50);
    }, 30000);
  });
});
