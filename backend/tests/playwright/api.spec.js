const { test, expect } = require('@playwright/test');

test.describe('Task Management API - Integration Tests', () => {
  let context;
  let request;
  const baseURL = 'http://localhost:3000';

  test.beforeAll(async ({ playwright }) => {
    const browser = await playwright.chromium.launch();
    context = await browser.newContext();
    request = context.request;
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('should create a task via API', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/tasks`, {
      data: {
        title: 'Playwright Test Task',
        description: 'Created via Playwright'
      }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('id');
    expect(body.data.title).toBe('Playwright Test Task');
  });

  test('should retrieve all tasks', async ({ request }) => {
    // Create a task first
    const createRes = await request.post(`${baseURL}/api/tasks`, {
      data: {
        title: 'List Test Task',
        description: 'For list retrieval'
      }
    });

    const taskId = (await createRes.json()).data.id;

    // Then get all tasks
    const response = await request.get(`${baseURL}/api/tasks`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.some(t => t.id === taskId)).toBe(true);
  });

  test('should retrieve specific task by ID', async ({ request }) => {
    // Create a task
    const createRes = await request.post(`${baseURL}/api/tasks`, {
      data: {
        title: 'Get Test Task',
        description: 'For get retrieval'
      }
    });

    const taskId = (await createRes.json()).data.id;

    // Get specific task
    const response = await request.get(`${baseURL}/api/tasks/${taskId}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(taskId);
    expect(body.data.title).toBe('Get Test Task');
  });

  test('should update a task', async ({ request }) => {
    // Create a task
    const createRes = await request.post(`${baseURL}/api/tasks`, {
      data: {
        title: 'Update Test Task',
        description: 'Original description'
      }
    });

    const task = (await createRes.json()).data;
    const taskId = task.id;

    // Update the task
    const updateRes = await request.put(`${baseURL}/api/tasks/${taskId}`, {
      data: {
        title: 'Updated Title',
        description: 'Updated description',
        completed: true
      }
    });

    expect(updateRes.status()).toBe(200);
    const updatedBody = await updateRes.json();
    expect(updatedBody.data.title).toBe('Updated Title');
    expect(updatedBody.data.description).toBe('Updated description');
    expect(updatedBody.data.completed).toBe(true);

    // Verify update persisted
    const getRes = await request.get(`${baseURL}/api/tasks/${taskId}`);
    const retrievedBody = await getRes.json();
    expect(retrievedBody.data.title).toBe('Updated Title');
  });

  test('should delete a task', async ({ request }) => {
    // Create a task
    const createRes = await request.post(`${baseURL}/api/tasks`, {
      data: {
        title: 'Delete Test Task',
        description: 'To be deleted'
      }
    });

    const taskId = (await createRes.json()).data.id;

    // Delete the task
    const deleteRes = await request.delete(`${baseURL}/api/tasks/${taskId}`);

    expect(deleteRes.status()).toBe(200);
    const body = await deleteRes.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Task deleted successfully');

    // Verify deletion
    const getRes = await request.get(`${baseURL}/api/tasks/${taskId}`);
    expect(getRes.status()).toBe(404);
  });

  test('should return 404 for non-existent task', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/tasks/non-existent-id`);

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Task not found');
  });

  test('should handle validation errors', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/tasks`, {
      data: {
        title: '',
        description: 'Missing title'
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Title is required');
  });

  test('complete task workflow', async ({ request }) => {
    // 1. Create task
    const createRes = await request.post(`${baseURL}/api/tasks`, {
      data: { title: 'Workflow Task', description: 'Test workflow' }
    });
    const taskId = (await createRes.json()).data.id;

    // 2. Verify in list
    const listRes = await request.get(`${baseURL}/api/tasks`);
    const tasks = (await listRes.json()).data;
    expect(tasks.some(t => t.id === taskId)).toBe(true);

    // 3. Update task
    const updateRes = await request.put(`${baseURL}/api/tasks/${taskId}`, {
      data: { completed: true }
    });
    expect((await updateRes.json()).data.completed).toBe(true);

    // 4. Retrieve updated task
    const getRes = await request.get(`${baseURL}/api/tasks/${taskId}`);
    expect((await getRes.json()).data.completed).toBe(true);

    // 5. Delete task
    const deleteRes = await request.delete(`${baseURL}/api/tasks/${taskId}`);
    expect(deleteRes.status()).toBe(200);

    // 6. Verify deletion
    const finalRes = await request.get(`${baseURL}/api/tasks/${taskId}`);
    expect(finalRes.status()).toBe(404);
  });
});
