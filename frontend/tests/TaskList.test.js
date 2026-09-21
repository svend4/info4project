/**
 * TaskList Component Tests
 * Tests task list rendering and task item display
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskList from '../src/components/TaskList';

describe('TaskList Component', () => {
  const mockTasks = [
    { id: '1', title: 'Task 1', description: 'First task', completed: false },
    { id: '2', title: 'Task 2', description: 'Second task', completed: true },
  ];

  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should display all tasks', () => {
    render(<TaskList tasks={mockTasks} {...mockHandlers} />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  test('should display task descriptions', () => {
    render(<TaskList tasks={mockTasks} {...mockHandlers} />);

    expect(screen.getByText('First task')).toBeInTheDocument();
    expect(screen.getByText('Second task')).toBeInTheDocument();
  });

  test('should render empty state when no tasks', () => {
    render(<TaskList tasks={[]} {...mockHandlers} />);

    expect(screen.getByText('No tasks to display')).toBeInTheDocument();
  });

  test('should render with null tasks', () => {
    render(<TaskList tasks={null} {...mockHandlers} />);

    expect(screen.getByText('No tasks to display')).toBeInTheDocument();
  });

  test('should call onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskList tasks={mockTasks} {...mockHandlers} />);

    const editButtons = screen.getAllByTitle('Edit task');
    await user.click(editButtons[0]);

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTasks[0]);
  });

  test('should handle task deletion', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);

    render(<TaskList tasks={mockTasks} {...mockHandlers} />);

    const deleteButtons = screen.getAllByTitle('Delete task');
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
  });

  test('should render task list container', () => {
    const { container } = render(<TaskList tasks={mockTasks} {...mockHandlers} />);

    const taskList = container.querySelector('.task-list');
    expect(taskList).toBeInTheDocument();
  });

  test('should handle multiple tasks', () => {
    const multipleTasks = Array.from({ length: 5 }, (_, i) => ({
      id: String(i + 1),
      title: `Task ${i + 1}`,
      description: `Description ${i + 1}`,
      completed: false,
    }));

    render(<TaskList tasks={multipleTasks} {...mockHandlers} />);

    multipleTasks.forEach(task => {
      expect(screen.getByText(task.title)).toBeInTheDocument();
    });
  });
});
