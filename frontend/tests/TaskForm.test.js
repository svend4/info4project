/**
 * TaskForm Component Tests
 * Tests form submission, validation, and event handling
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../src/components/TaskForm';

describe('TaskForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnUpdate = jest.fn();
  const mockOnCancelEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render form with title field', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onUpdate={mockOnUpdate} onCancelEdit={mockOnCancelEdit} />);

    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
  });

  test('should render description input field', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onUpdate={mockOnUpdate} onCancelEdit={mockOnCancelEdit} />);

    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  test('should render priority dropdown', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onUpdate={mockOnUpdate} onCancelEdit={mockOnCancelEdit} />);

    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
  });

  test('should render status dropdown', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onUpdate={mockOnUpdate} onCancelEdit={mockOnCancelEdit} />);

    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  test('should render due date input', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onUpdate={mockOnUpdate} onCancelEdit={mockOnCancelEdit} />);

    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
  });

  test('should render submit button for creating task', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onUpdate={mockOnUpdate} onCancelEdit={mockOnCancelEdit} />);

    const button = screen.getByRole('button', { name: /Add Task/i });
    expect(button).toBeInTheDocument();
  });

  test('should call onSubmit with form data when creating task', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} onUpdate={mockOnUpdate} onCancelEdit={mockOnCancelEdit} />);

    const titleInput = screen.getByLabelText('Title *');
    const descriptionInput = screen.getByLabelText('Description');
    const button = screen.getByRole('button', { name: /Add Task/i });

    await user.type(titleInput, 'New Task');
    await user.type(descriptionInput, 'Task description');
    await user.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Task',
        description: 'Task description'
      })
    );
  });

  test('should not submit form when title is empty', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} onUpdate={mockOnUpdate} onCancelEdit={mockOnCancelEdit} />);

    const button = screen.getByRole('button', { name: /Add Task/i });
    await user.click(button);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should prevent submission when title is empty', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} onUpdate={mockOnUpdate} onCancelEdit={mockOnCancelEdit} />);

    const button = screen.getByRole('button', { name: /Add Task/i });
    await user.click(button);

    // onSubmit should not be called when validation fails
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should respect maxLength attribute on title input', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onUpdate={mockOnUpdate} onCancelEdit={mockOnCancelEdit} />);

    const titleInput = screen.getByLabelText('Title *');
    expect(titleInput).toHaveAttribute('maxLength', '200');
  });

  test('should clear form fields after successful submission', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} onUpdate={mockOnUpdate} onCancelEdit={mockOnCancelEdit} />);

    const titleInput = screen.getByLabelText('Title *');
    const descriptionInput = screen.getByLabelText('Description');
    const button = screen.getByRole('button', { name: /Add Task/i });

    await user.type(titleInput, 'Test Task');
    await user.type(descriptionInput, 'Description');
    await user.click(button);

    await waitFor(() => {
      expect(titleInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
    });
  });

  test('should populate form when editing task', () => {
    const editingTask = {
      id: '1',
      title: 'Edit Task',
      description: 'Edit Description',
      priority: 'high',
      status: 'in_progress',
      dueDate: '2024-12-31'
    };

    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onUpdate={mockOnUpdate}
        onCancelEdit={mockOnCancelEdit}
        editingTask={editingTask}
      />
    );

    expect(screen.getByDisplayValue('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Edit Description')).toBeInTheDocument();
    const prioritySelect = screen.getByLabelText('Priority');
    expect(prioritySelect).toHaveValue('high');
  });

  test('should render cancel button when editing', () => {
    const editingTask = { id: '1', title: 'Edit Task', description: '', priority: 'medium', status: 'todo', dueDate: '' };

    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onUpdate={mockOnUpdate}
        onCancelEdit={mockOnCancelEdit}
        editingTask={editingTask}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  test('should call onUpdate when editing task', async () => {
    const user = userEvent.setup();
    const editingTask = { id: '1', title: 'Edit Task', description: '', priority: 'medium', status: 'todo', dueDate: '' };

    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onUpdate={mockOnUpdate}
        onCancelEdit={mockOnCancelEdit}
        editingTask={editingTask}
      />
    );

    const titleInput = screen.getByDisplayValue('Edit Task');
    const button = screen.getByRole('button', { name: /Update/i });

    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');
    await user.click(button);

    expect(mockOnUpdate).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ title: 'Updated Task' })
    );
  });

  test('should call onCancelEdit when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const editingTask = { id: '1', title: 'Edit Task', description: '', priority: 'medium', status: 'todo', dueDate: '' };

    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onUpdate={mockOnUpdate}
        onCancelEdit={mockOnCancelEdit}
        editingTask={editingTask}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancelEdit).toHaveBeenCalled();
  });

  test('should handle priority change', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} onUpdate={mockOnUpdate} onCancelEdit={mockOnCancelEdit} />);

    const prioritySelect = screen.getByLabelText('Priority');
    await user.selectOptions(prioritySelect, 'high');

    expect(prioritySelect).toHaveValue('high');
  });

  test('should handle status change', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} onUpdate={mockOnUpdate} onCancelEdit={mockOnCancelEdit} />);

    const statusSelect = screen.getByLabelText('Status');
    await user.selectOptions(statusSelect, 'done');

    expect(statusSelect).toHaveValue('done');
  });
});
