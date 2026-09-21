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
});
