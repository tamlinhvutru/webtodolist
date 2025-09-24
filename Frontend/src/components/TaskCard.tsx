import { useState } from 'react';
import { Edit3, Trash2, Clock } from 'lucide-react';
import type { Task } from '../types';
import type { DraggableProvided } from '@hello-pangea/dnd';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onStatusChange: (id: number, status: Task['status']) => Promise<void>;
  provided: DraggableProvided;
}

function TaskCard({ task, onEdit, onDelete, onStatusChange, provided }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="bg-white rounded-lg shadow-sm border-l-4 p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow border-gray-300"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">Order: {task.order}</span>
            {task.deadline && (
              <span className="bg-gray-100 px-2 py-1 rounded">
                Deadline: {new Date(task.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={async (e) => {
              e.stopPropagation();
              await onEdit(task);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              await onDelete(task.id);
            }}
            className="p-1 hover:bg-gray-100 rounded text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Clock size={12} />
            Created: {new Date(task.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            Updated: {new Date(task.updated_at).toLocaleDateString()}
          </div>
          {task.deadline && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Clock size={12} />
              Deadline: {new Date(task.deadline).toLocaleDateString()}
            </div>
          )}
          <div className="flex gap-1">
            {['todo', 'in_progress', 'done'].map((status) => (
              <button
                key={status}
                onClick={async (e) => {
                  e.stopPropagation();
                  await onStatusChange(task.id, status as Task['status']);
                }}
                className={`px-2 py-1 text-xs rounded ${
                  task.status === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'todo' ? 'Cần làm' : status === 'in_progress' ? 'Đang tiến hành' : 'Hoàn thành'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskCard;