import React from 'react';
import TaskItem from './TaskItem';

/**
 * TaskList Component
 * Displays list of tasks
 */
function TaskList({ tasks, onEdit, onDelete, onUpdate }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="task-list empty">
        <p>No tasks to display</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

export default TaskList;
