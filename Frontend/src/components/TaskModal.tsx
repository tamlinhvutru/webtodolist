import { useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { Task } from '../types';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  onDelete: (id: number) => void;
}

function TaskModal({ task, isOpen, onClose, onSave, onDelete }: TaskModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: 'todo',
    list: 'Personal',
    deadline: '',
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        list: 'Personal',
        deadline: '',
      });
    }
  }, [task]);

  const handleSave = () => {
    if (formData.title?.trim()) {
      const saveData = {
        ...formData,
        deadline: formData.deadline === '' ? undefined : formData.deadline, 
      };
      onSave(saveData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{task ? 'Chỉnh sửa nhiệm vụ' : 'Tạo nhiệm vụ mới'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tiêu đề nhiệm vụ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Nhập mô tả..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hạn chót</label>
            <input
              type="date"
              value={formData.deadline || ''}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
              className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todo">Cần làm</option>
              <option value="in_progress">Đang tiến hành</option>
              <option value="done">Hoàn thành</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh sách</label>
            <select
              value={formData.list}
              onChange={(e) => setFormData({ ...formData, list: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Personal">Cá nhân</option>
              <option value="Work">Công việc</option>
              <option value="Grocery List">Danh sách mua sắm</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-between">
          <div>
            {task && (
              <button
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Xóa
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.title?.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {task ? 'Cập nhật' : 'Tạo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;