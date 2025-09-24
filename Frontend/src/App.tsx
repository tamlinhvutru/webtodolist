import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult, DraggableProvided } from '@hello-pangea/dnd';
import TopBar from './components/TopBar';
import TaskModal from './components/TaskModal';
import Notification from './components/ToastNotification';
import TaskCard from './components/TaskCard';
import TaskChart from './components/TaskChart';
import AddTask from './components/AddTask';
import { useTasks } from './hooks/useTasks';
import type { Task } from './types';
import { isToday, addDays, isWithinInterval, isBefore, parseISO } from 'date-fns';
import Signup from './components/SignUp';
import Login from './components/Login';

function App() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(localStorage.getItem('userId') || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [showChart, setShowChart] = useState(false);
  const [showListPanel, setShowListPanel] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const { tasks, tasksQuery, addTask, editTask, removeTask } = useTasks();

  useEffect(() => {
    const handleOpenCanvas = (event: CustomEvent) => {
      if (event.detail?.type === 'chart') {
        setShowChart(true);
      }
    };

    const handleCloseCanvas = () => {
      setShowChart(false);
    };

    window.addEventListener('openCanvas', handleOpenCanvas as EventListener);
    window.addEventListener('closeCanvas', handleCloseCanvas);

    return () => {
      window.removeEventListener('openCanvas', handleOpenCanvas as EventListener);
      window.removeEventListener('closeCanvas', handleCloseCanvas);
    };
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    if (!isAuthenticated) {
      showNotification('Vui lòng đăng nhập để tạo nhiệm vụ', 'error');
      return;
    }
    try {
      const newOrder = tasks.filter((t) => t.status === taskData.status).length;
      await addTask.mutateAsync({
        ...taskData,
        order: newOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      showNotification('Tạo nhiệm vụ thành công');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể tạo nhiệm vụ';
      showNotification(message, 'error');
    }
  };

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!selectedTask || !isAuthenticated) {
      showNotification('Không tìm thấy nhiệm vụ hoặc chưa đăng nhập', 'error');
      return;
    }
    try {
      if (!taskData.title || !taskData.status) {
        throw new Error('Tiêu đề và trạng thái là bắt buộc');
      }
      await editTask.mutateAsync({
        id: selectedTask.id,
        data: {
          ...taskData,
          order: selectedTask.order,
          updated_at: new Date().toISOString(),
        },
      });
      setSelectedTask((prev) => (prev ? { ...prev, ...taskData, updated_at: new Date().toISOString() } : null));
      showNotification('Cập nhật nhiệm vụ thành công');
      setIsModalOpen(false);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Không thể cập nhật nhiệm vụ';
      console.error('Lỗi cập nhật:', error);
      showNotification(message, 'error');
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!isAuthenticated) {
      showNotification('Vui lòng đăng nhập để xóa nhiệm vụ', 'error');
      return;
    }
    try {
      await removeTask.mutateAsync(id);
      showNotification('Xóa nhiệm vụ thành công');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể xóa nhiệm vụ';
      showNotification(message, 'error');
    }
  };

  const handleStatusChange = async (id: number, status: Task['status']) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      try {
        const newOrder = tasks.filter((t) => t.status === status).length;
        await editTask.mutateAsync({
          id,
          data: {
            status,
            order: newOrder,
            updated_at: new Date().toISOString(),
          },
        });
        showNotification('Cập nhật trạng thái thành công');
      } catch (error: any) {
        const message = error.response?.data?.message || 'Không thể cập nhật trạng thái';
        showNotification(message, 'error');
      }
    }
  };

  const handleEditTask = async (task: Task) => {
    if (!isAuthenticated) {
      showNotification('Vui lòng đăng nhập để chỉnh sửa nhiệm vụ', 'error');
      return;
    }
    setSelectedTask(task);
    setIsModalOpen(true);
    return Promise.resolve();
  };

  const openModal = (task: Task | null = null) => {
    if (!isAuthenticated) {
      showNotification('Vui lòng đăng nhập để thêm nhiệm vụ', 'error');
      return;
    }
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  const handleFilterChange = ({ type, value }: { type: 'date' | 'list'; value: string | null }) => {
    const today = new Date();
    const next7Days = addDays(today, 6);

    let filtered = tasks;

    if (type === 'date') {
      if (value === 'today') {
        filtered = filtered.filter((task) => task.deadline && isToday(parseISO(task.deadline)));
      } else if (value === 'next7Days') {
        filtered = filtered.filter((task) =>
          task.deadline && isWithinInterval(parseISO(task.deadline), { start: addDays(today, 1), end: next7Days })
        );
      } else if (value === 'overdue') {
        filtered = filtered.filter((task) => task.deadline && isBefore(parseISO(task.deadline), today));
      }
    } else if (type === 'list') {
      if (value) {
        filtered = filtered.filter((task) => task.list === value);
      }
    }

    filtered = applySearch(filtered);
    setFilteredTasks(filtered);
  };

  const handleShowList = (listType: string | null) => {
    setShowListPanel(listType);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setCurrentUserId(null);
    showNotification('Đăng xuất thành công');
  };

  const handleAuthSuccess = (userId: string) => {
    setIsAuthenticated(true);
    setCurrentUserId(userId);
    localStorage.setItem('userId', userId);
    setShowSignup(false);
    setShowLogin(false);
  };

  if (tasksQuery.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải nhiệm vụ...</p>
        </div>
      </div>
    );
  }

  const applySearch = (tasksToFilter: Task[]) => {
    return tasksToFilter.filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );
  };

  const tasksToRender = filteredTasks.length > 0 ? filteredTasks : tasks;

  const columns: { id: Task['status']; title: string }[] = [
    { id: 'todo', title: 'Cần làm' },
    { id: 'in_progress', title: 'Đang tiến hành' },
    { id: 'done', title: 'Hoàn thành' },
  ];

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination, source } = result;
    const taskId = parseInt(draggableId, 10);
    const newStatus = destination.droppableId as Task['status'];

    if (source.droppableId !== destination.droppableId) {
      try {
        await handleStatusChange(taskId, newStatus);
      } catch (error) {
        console.error('Error updating status:', error);
      }
    }
  };

  const listTasks = showListPanel ? tasks.filter((task) => task.list === showListPanel) : [];

  if (!isAuthenticated) {
    return (
      <>
        {showSignup && <Signup onSignupSuccess={handleAuthSuccess} onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }} />}
        {showLogin && <Login onLoginSuccess={handleAuthSuccess} onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }} />}
        {!showSignup && !showLogin && (
          <div className="h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Chào mừng đến với Task Manager</h2>
              <button
                onClick={() => setShowLogin(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setShowSignup(true)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Đăng ký
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="h-screen bg-gray-50">
      <TopBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddTask={() => openModal()}
        tasks={tasks}
        onFilterChange={handleFilterChange}
        onShowList={handleShowList}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-4 w-full h-full p-4">
          {columns.map((col) => (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 rounded-lg p-4 shadow-md flex flex-col"
                >
                  <h2 className="text-lg font-semibold mb-4">{col.title}</h2>
                  {applySearch(tasksToRender)
                    .filter((task) => task.status === col.id)
                    .map((task, index) => (
                      <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                        {(provided: DraggableProvided) => (
                          <TaskCard
                            task={task}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                            onStatusChange={handleStatusChange}
                            provided={provided}
                          />
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                  <AddTask status={col.id} onAdd={handleCreateTask} tasks={tasks} />
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      {showListPanel && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-1/2 h-3/4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Danh sách{' '}
              {showListPanel === 'personal'
                ? 'Cá nhân'
                : showListPanel === 'work'
                ? 'Công việc'
                : 'Danh sách mua sắm'}
            </h2>
            {listTasks.length > 0 ? (
              <ul className="space-y-2">
                {listTasks.map((task) => (
                  <li key={task.id} className="p-2 border-b flex justify-between items-center">
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
              <p className="text-gray-500">Không có nhiệm vụ trong danh sách này.</p>
            )}
            <button
              onClick={() => setShowListPanel(null)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={selectedTask ? handleUpdateTask : handleCreateTask}
        onDelete={handleDeleteTask}
      />
      {notification && <Notification message={notification.message} type={notification.type} />}
      {showChart && <TaskChart tasks={tasks} />}
    </div>
  );
}

export default App;