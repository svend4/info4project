/**
 * API Service Layer
 * Calls Task Management Backend API
 * Handles response structure validation
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Validate response structure matches contract
const validateResponse = (parsedData, endpoint) => {
  if (parsedData.success === undefined) {
    throw new Error(`Invalid response: missing success flag for ${endpoint}`);
  }

  if (parsedData.data === undefined) {
    throw new Error(`Invalid response: missing data object for ${endpoint}`);
  }

  return parsedData;
};

export const tasksAPI = {
  /**
   * GET /api/tasks
   * Returns all tasks with count
   */
  async getAllTasks() {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }

      const data = await response.json();
      validateResponse(data, 'GET /api/tasks');

      return {
        success: true,
        tasks: data.data,
        count: data.count || 0,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        tasks: [],
        count: 0,
        error: error.message
      };
    }
  },

  /**
   * POST /api/tasks
   * Create a new task
   */
  async createTask(taskData) {
    try {
      if (!taskData.title || taskData.title.trim() === '') {
        throw new Error('Title is required');
      }

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create task: ${response.status}`);
      }

      const data = await response.json();
      validateResponse(data, 'POST /api/tasks');

      return {
        success: true,
        task: data.data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        task: null,
        error: error.message
      };
    }
  },

  /**
   * GET /api/tasks/:id
   * Get a specific task
   */
  async getTask(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Task not found: ${response.status}`);
      }

      const data = await response.json();
      validateResponse(data, 'GET /api/tasks/:id');

      return {
        success: true,
        task: data.data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        task: null,
        error: error.message
      };
    }
  },

  /**
   * PUT /api/tasks/:id
   * Update a task
   */
  async updateTask(id, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update task: ${response.status}`);
      }

      const data = await response.json();
      validateResponse(data, 'PUT /api/tasks/:id');

      return {
        success: true,
        task: data.data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        task: null,
        error: error.message
      };
    }
  },

  /**
   * DELETE /api/tasks/:id
   * Delete a task
   */
  async deleteTask(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`);
      }

      const data = await response.json();
      validateResponse(data, 'DELETE /api/tasks/:id');

      return {
        success: true,
        message: data.message || 'Task deleted',
        error: null
      };
    } catch (error) {
      return {
        success: false,
        message: null,
        error: error.message
      };
    }
  }
};

export default tasksAPI;
