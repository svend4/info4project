/**
 * TaskItem Component Tests
 * Tests individual task display, actions, and state management
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskItem from '../src/components/TaskItem';

describe('TaskItem Component', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    priority: 'medium',
    status: 'todo',
  };

  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true);
  });

  test('should render task title', () => {
    render(<TaskItem task={mockTask} {...mockHandlers} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('should render task description', () => {
    render(<TaskItem task={mockTask} {...mockHandlers} />);

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  test('should render checkbox for task completion', () => {
    render(<TaskItem task={mockTask} {...mockHandlers} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  test('should render edit button', () => {
    render(<TaskItem task={mockTask} {...mockHandlers} />);

    const button = screen.getByTitle('Edit task');
    expect(button).toBeInTheDocument();
  });

  test('should render delete button', () => {
    render(<TaskItem task={mockTask} {...mockHandlers} />);

    const button = screen.getByTitle('Delete task');
    expect(button).toBeInTheDocument();
  });

  test('should call onUpdate when checkbox is toggled', async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} {...mockHandlers} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', { completed: true });
  });

  test('should call onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} {...mockHandlers} />);

    const button = screen.getByTitle('Edit task');
    await user.click(button);

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTask);
  });

  test('should call onDelete when delete button is clicked with confirmation', async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} {...mockHandlers} />);

    const button = screen.getByTitle('Delete task');
    await user.click(button);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
  });

  test('should not call onDelete when delete is cancelled', async () => {
    const user = userEvent.setup();
    window.confirm.mockReturnValueOnce(false);

    render(<TaskItem task={mockTask} {...mockHandlers} />);

    const button = screen.getByTitle('Delete task');
    await user.click(button);

    expect(mockHandlers.onDelete).not.toHaveBeenCalled();
  });

  test('should display as completed when task.completed is true', () => {
    const completedTask = { ...mockTask, completed: true };
    render(<TaskItem task={completedTask} {...mockHandlers} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  test('should handle task without description', () => {
    const taskWithoutDesc = { ...mockTask, description: null };
    render(<TaskItem task={taskWithoutDesc} {...mockHandlers} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('should render task-item container with correct class', () => {
    const { container } = render(<TaskItem task={mockTask} {...mockHandlers} />);

    const taskItem = container.querySelector('.task-item');
    expect(taskItem).toHaveClass('task-item');
  });

  test('should add completed class when task is completed', () => {
    const completedTask = { ...mockTask, completed: true };
    const { container } = render(<TaskItem task={completedTask} {...mockHandlers} />);

    const taskItem = container.querySelector('.task-item');
    expect(taskItem).toHaveClass('completed');
  });
});
