import { useEffect, useRef, useMemo } from 'react';
import { isSameDay, parseISO, addDays, format } from 'date-fns';
import type { Task } from '../types'; // Import từ types.ts

interface TaskChartProps {
  tasks: Task[];
}

function TaskChart({ tasks }: TaskChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Memoize tính toán dữ liệu biểu đồ và danh sách nhiệm vụ
  const { days, taskCounts, tasksByDay } = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

    // Tính số lượng nhiệm vụ mỗi ngày
    const taskCounts = days.map((day) =>
      tasks.reduce((count, task) => {
        if (!task.deadline) return count;
        try {
          const deadlineDate = parseISO(task.deadline);
          return isSameDay(deadlineDate, day) ? count + 1 : count;
        } catch {
          return count; // Bỏ qua nếu deadline không hợp lệ
        }
      }, 0)
    );

    // Nhóm nhiệm vụ theo ngày và sắp xếp theo deadline
    const tasksByDay = days.map((day) => ({
      date: day,
      tasks: tasks
        .filter((task) => {
          if (!task.deadline) return false;
          try {
            const deadlineDate = parseISO(task.deadline);
            return isSameDay(deadlineDate, day);
          } catch {
            return false;
          }
        })
        .sort((a, b) => {
          const dateA = parseISO(a.deadline!);
          const dateB = parseISO(b.deadline!);
          return dateA.getTime() - dateB.getTime(); // Sắp xếp theo thời gian deadline
        }),
    }));

    return { days, taskCounts, tasksByDay };
  }, [tasks]);

  // Vẽ biểu đồ cột
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Xóa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cài đặt kích thước và style
    const padding = 40;
    const barWidth = (canvas.width - padding * 2) / (days.length * 2);
    const maxHeight = canvas.height - padding * 2;
    const maxTasks = Math.max(...taskCounts, 1);

    // Vẽ trục Y
    ctx.beginPath();
    ctx.strokeStyle = '#1f2937';
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();

    // Nhãn trục Y
    ctx.fillStyle = '#1f2937';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const y = canvas.height - padding - (i * maxHeight) / yTicks;
      const value = Math.round((i * maxTasks) / yTicks);
      ctx.fillText(value.toString(), padding - 10, y);
    }

    // Vẽ trục X
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Vẽ cột
    ctx.fillStyle = '#3b82f6';
    days.forEach((day, index) => {
      const height = (taskCounts[index] / maxTasks) * maxHeight;
      const x = padding + index * 2 * barWidth;
      ctx.fillRect(x, canvas.height - padding - height, barWidth - 2, height);

      // Nhãn ngày
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'center';
      ctx.fillText(format(day, 'dd/MM'), x + barWidth / 2, canvas.height - padding + 15);

      // Số lượng nhiệm vụ
      if (taskCounts[index] > 0) {
        ctx.fillText(taskCounts[index].toString(), x + barWidth / 2, canvas.height - padding - height - 10);
      }
    });
  }, [days, taskCounts]);

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-3/4 h-3/4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Thống kê nhiệm vụ (7 ngày tới)</h2>
        <canvas ref={canvasRef} width={600} height={400} className="mb-4" />
        <h3 className="text-lg font-semibold mb-2">Danh sách nhiệm vụ theo ngày</h3>
        {tasksByDay.some((day) => day.tasks.length > 0) ? (
          <div className="space-y-4">
            {tasksByDay.map((day, index) => (
              <div key={index} className="border-b pb-2">
                <h4 className="font-medium text-gray-700">{format(day.date, 'dd/MM/yyyy')}</h4>
                {day.tasks.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {day.tasks.map((task) => (
                      <li key={task.id} className="flex justify-between items-center">
                        <span className="font-medium">{task.title}</span>
                        <span
                          className={`text-sm ${
                            task.status === 'todo'
                              ? 'text-red-500'
                              : task.status === 'in_progress'
                              ? 'text-yellow-500'
                              : 'text-green-500'
                          }`}
                        >
                          {task.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Không có nhiệm vụ</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Không có nhiệm vụ nào trong 7 ngày tới.</p>
        )}
        <button
          onClick={() => window.dispatchEvent(new Event('closeCanvas'))}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

export default TaskChart;