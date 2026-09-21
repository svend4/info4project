/**
 * API Service Tests
 * Validates contract compliance and response handling
 */

import tasksAPI from '../src/api';

// Mock fetch
global.fetch = jest.fn();

describe('Tasks API Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('getAllTasks', () => {
    test('should fetch all tasks and return success', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            { id: '1', title: 'Task 1', completed: false }
          ],
          count: 1
        })
      });

      const result = await tasksAPI.getAllTasks();

      expect(result.success).toBe(true);
      expect(result.tasks).toHaveLength(1);
      expect(result.count).toBe(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    test('should handle API errors gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const result = await tasksAPI.getAllTasks();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('createTask', () => {
    test('should create new task with valid data', async () => {
      const newTask = { title: 'New Task', description: 'Test' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: '2', ...newTask, completed: false }
        })
      });

      const result = await tasksAPI.createTask(newTask);

      expect(result.success).toBe(true);
      expect(result.task.id).toBe('2');
      expect(result.task.title).toBe('New Task');
    });

    test('should validate required title field', async () => {
      const result = await tasksAPI.createTask({ title: '', description: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Title is required');
    });

    test('should handle creation errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid input' })
      });

      const result = await tasksAPI.createTask({ title: 'Test' });

      expect(result.success).toBe(false);
    });
  });

  describe('updateTask', () => {
    test('should update existing task', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: '1', title: 'Updated', completed: true }
        })
      });

      const result = await tasksAPI.updateTask('1', { title: 'Updated' });

      expect(result.success).toBe(true);
      expect(result.task.title).toBe('Updated');
    });

    test('should handle update errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await tasksAPI.updateTask('999', { title: 'Test' });

      expect(result.success).toBe(false);
    });
  });

  describe('deleteTask', () => {
    test('should delete task successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Task deleted'
        })
      });

      const result = await tasksAPI.deleteTask('1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Task deleted');
    });

    test('should handle deletion errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await tasksAPI.deleteTask('999');

      expect(result.success).toBe(false);
    });
  });

  describe('Contract Compliance', () => {
    test('should validate response includes success flag', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { id: '1' },
          // Missing success flag - should fail validation
        })
      });

      const result = await tasksAPI.getAllTasks();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid response');
    });

    test('should validate response includes data object', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true
          // Missing data - should fail validation
        })
      });

      const result = await tasksAPI.getAllTasks();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid response');
    });
  });
});
