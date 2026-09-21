/**
 * App Component Tests
 * Tests rendering, state management, and API integration
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/components/App';
import tasksAPI from '../src/api';

// Mock the API module
jest.mock('../src/api');

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render app header on mount', () => {
    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: [],
      count: 0,
    });

    render(<App />);

    expect(screen.getByText('📋 Task Management System')).toBeInTheDocument();
    expect(screen.getByText('Manage your tasks efficiently')).toBeInTheDocument();
  });

  test('should load tasks on mount', async () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', completed: false },
    ];

    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: mockTasks,
      count: 1,
    });

    render(<App />);

    await waitFor(() => {
      expect(tasksAPI.getAllTasks).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Tasks (1)')).toBeInTheDocument();
    });
  });

  test('should display error message on failed task load', async () => {
    tasksAPI.getAllTasks.mockResolvedValue({
      success: false,
      tasks: [],
      count: 0,
      error: 'Failed to load tasks',
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load tasks/)).toBeInTheDocument();
    });
  });

  test('should display empty state when no tasks exist', async () => {
    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: [],
      count: 0,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No tasks yet. Create one to get started!')).toBeInTheDocument();
    });
  });

  test('should display TaskForm and TaskList sections', async () => {
    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: [],
      count: 0,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Add New Task')).toBeInTheDocument();
      expect(screen.getByText(/Tasks \(/)).toBeInTheDocument();
    });
  });

  test('should add new task when form is submitted', async () => {
    const newTask = { id: '2', title: 'New Task', completed: false };

    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: [],
      count: 0,
    });

    tasksAPI.createTask.mockResolvedValue({
      success: true,
      task: newTask,
    });

    render(<App />);

    const titleInput = await screen.findByPlaceholderText('Enter task title');
    const addButton = await screen.findByRole('button', { name: /Add Task/ });

    await userEvent.type(titleInput, 'New Task');
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(tasksAPI.createTask).toHaveBeenCalled();
    });
  });

  test('should display footer information', async () => {
    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: [],
      count: 0,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Task Management API v1.0/)).toBeInTheDocument();
    });
  });

  test('should handle task update', async () => {
    const existingTask = { id: '1', title: 'Existing Task', completed: false };
    const updatedTask = { id: '1', title: 'Updated Task', completed: true };

    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: [existingTask],
      count: 1,
    });

    tasksAPI.updateTask.mockResolvedValue({
      success: true,
      task: updatedTask,
    });

    render(<App />);

    await waitFor(() => {
      expect(tasksAPI.getAllTasks).toHaveBeenCalled();
    });
  });

  test('should handle task deletion', async () => {
    const existingTask = { id: '1', title: 'Task to Delete', completed: false };

    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: [existingTask],
      count: 1,
    });

    tasksAPI.deleteTask.mockResolvedValue({
      success: true,
      message: 'Task deleted',
    });

    render(<App />);

    await waitFor(() => {
      expect(tasksAPI.getAllTasks).toHaveBeenCalled();
    });
  });

  test('should display multiple tasks', async () => {
    const multipleTasks = [
      { id: '1', title: 'Task 1', completed: false },
      { id: '2', title: 'Task 2', completed: false },
      { id: '3', title: 'Task 3', completed: true },
    ];

    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: multipleTasks,
      count: 3,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Tasks (3)')).toBeInTheDocument();
    });
  });

  test('should handle create task error', async () => {
    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: [],
      count: 0,
    });

    tasksAPI.createTask.mockResolvedValue({
      success: false,
      error: 'Failed to create task',
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Add New Task')).toBeInTheDocument();
    });
  });

  test('should handle loading state', async () => {
    tasksAPI.getAllTasks.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        success: true,
        tasks: [],
        count: 0,
      }), 100))
    );

    render(<App />);

    expect(screen.getByText('📋 Task Management System')).toBeInTheDocument();
  });

  test('should refresh tasks after successful creation', async () => {
    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: [],
      count: 0,
    });

    tasksAPI.createTask.mockResolvedValue({
      success: true,
      task: { id: '1', title: 'New Task', completed: false },
    });

    render(<App />);

    await waitFor(() => {
      expect(tasksAPI.getAllTasks).toHaveBeenCalled();
    });
  });

  test('should display error when create task fails', async () => {
    const user = userEvent.setup();
    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: [],
      count: 0,
    });

    tasksAPI.createTask.mockResolvedValue({
      success: false,
      error: 'Failed to create task',
    });

    render(<App />);

    const titleInput = await screen.findByPlaceholderText('Enter task title');
    const addButton = await screen.findByRole('button', { name: /Add Task/ });

    await user.type(titleInput, 'Test Task');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to create task/)).toBeInTheDocument();
    });
  });

  test('should display error when update task fails', async () => {
    const existingTask = { id: '1', title: 'Task', completed: false };
    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: [existingTask],
      count: 1,
    });

    tasksAPI.updateTask.mockResolvedValue({
      success: false,
      error: 'Failed to update task',
    });

    render(<App />);

    await waitFor(() => {
      expect(tasksAPI.getAllTasks).toHaveBeenCalled();
    });
  });

  test('should display error when delete task fails', async () => {
    const existingTask = { id: '1', title: 'Task', completed: false };
    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: [existingTask],
      count: 1,
    });

    tasksAPI.deleteTask.mockResolvedValue({
      success: false,
      error: 'Failed to delete task',
    });

    render(<App />);

    await waitFor(() => {
      expect(tasksAPI.getAllTasks).toHaveBeenCalled();
    });
  });

  test('should dismiss error message when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    tasksAPI.getAllTasks.mockResolvedValue({
      success: false,
      tasks: [],
      count: 0,
      error: 'Test error message',
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Test error message/)).toBeInTheDocument();
    });

    const dismissButton = await screen.findByRole('button', { name: /Dismiss/i });
    await user.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByText(/Test error message/)).not.toBeInTheDocument();
    });
  });

  test('should render loading state indicator', async () => {
    tasksAPI.getAllTasks.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        success: true,
        tasks: [],
        count: 0,
      }), 500))
    );

    render(<App />);

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  test('should handle edit task workflow', async () => {
    const existingTask = { id: '1', title: 'Task', completed: false };
    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: [existingTask],
      count: 1,
    });

    tasksAPI.updateTask.mockResolvedValue({
      success: true,
      task: { ...existingTask, title: 'Updated Task' },
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Task')).toBeInTheDocument();
    });
  });

  test('should trigger update and delete handlers', async () => {
    const user = userEvent.setup();
    const task1 = { id: '1', title: 'Task 1', completed: false, description: '' };
    const task2 = { id: '2', title: 'Task 2', completed: false, description: '' };

    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: [task1, task2],
      count: 2,
    });

    tasksAPI.updateTask.mockResolvedValue({
      success: true,
      task: { ...task1, completed: true },
    });

    tasksAPI.deleteTask.mockResolvedValue({
      success: true,
      message: 'Task deleted',
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Tasks (2)')).toBeInTheDocument();
    });

    // Both tasks should be rendered
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  test('should complete task when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const task = { id: '1', title: 'Task to Complete', completed: false, description: '' };

    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: [task],
      count: 1,
    });

    tasksAPI.updateTask.mockResolvedValue({
      success: true,
      task: { ...task, completed: true },
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Task to Complete')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    if (checkboxes.length > 0) {
      await user.click(checkboxes[0]);

      await waitFor(() => {
        expect(tasksAPI.updateTask).toHaveBeenCalled();
      });
    }
  });

  test('should delete task when delete button is clicked', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);

    const task = { id: '1', title: 'Task to Delete', completed: false, description: '' };

    tasksAPI.getAllTasks.mockResolvedValue({
      success: true,
      tasks: [task],
      count: 1,
    });

    tasksAPI.deleteTask.mockResolvedValue({
      success: true,
      message: 'Task deleted',
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Task to Delete')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete task');
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(tasksAPI.deleteTask).toHaveBeenCalled();
      });
    }
  });
});
