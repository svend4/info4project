import React, { useState } from 'react';

/**
 * TaskItem Component
 * Displays individual task with actions
 */
function TaskItem({ task, onEdit, onDelete, onUpdate }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Delete task "${task.title}"?`)) {
      setIsDeleting(true);
      await onDelete(task.id);
      setIsDeleting(false);
    }
  };

  const handleToggleComplete = async () => {
    await onUpdate(task.id, { completed: !task.completed });
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-content">
        <input
          type="checkbox"
          checked={task.completed || false}
          onChange={handleToggleComplete}
          className="task-checkbox"
        />

        <div className="task-info">
          <h3 className="task-title">{task.title}</h3>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          <div className="task-meta">
            {task.priority && (
              <span className={`priority priority-${task.priority}`}>
                {task.priority}
              </span>
            )}
            {task.status && (
              <span className={`status status-${task.status}`}>
                {task.status}
              </span>
            )}
            {task.createdAt && (
              <span className="date">
                {new Date(task.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="task-actions">
        <button
          onClick={() => onEdit(task)}
          className="btn btn-edit"
          title="Edit task"
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="btn btn-delete"
          title="Delete task"
        >
          {isDeleting ? '⏳' : '🗑️'}
        </button>
      </div>
    </div>
  );
}

export default TaskItem;
