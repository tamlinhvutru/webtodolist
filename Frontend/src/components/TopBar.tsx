import { Search, Filter, Plus, BarChart2 } from "lucide-react";
import { isToday, addDays, isWithinInterval, isBefore, parseISO } from "date-fns";
import { useState } from "react";

interface TopBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddTask: () => void;
  tasks: { id: number; deadline?: string; status: string; list?: string }[];
  onFilterChange?: (filter: { type: "date" | "list"; value: string | null }) => void;
  onShowList?: (listType: string | null) => void;
  isAuthenticated: boolean;
  onLogout?: () => void;
}

function TopBar({
  searchTerm,
  setSearchTerm,
  onAddTask,
  tasks,
  onFilterChange,
  onShowList,
  isAuthenticated,
  onLogout,
}: TopBarProps) {
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);

  const today = new Date();
  const next7Days = addDays(today, 6);

  const todayTasks = tasks.filter((task) => task.deadline && isToday(parseISO(task.deadline))).length;
  const next7DaysTasks = tasks.filter((task) =>
    task.deadline && isWithinInterval(parseISO(task.deadline), { start: addDays(today, 1), end: next7Days })
  ).length;
  const overdueTasks = tasks.filter((task) => task.deadline && isBefore(parseISO(task.deadline), today)).length;
  const personalTasks = tasks.filter((task) => task.list === "personal").length;
  const workTasks = tasks.filter((task) => task.list === "work").length;
  const groceryTasks = tasks.filter((task) => task.list === "grocery").length;

  const openChart = () => {
    if (confirm("Bạn có muốn tạo biểu đồ thống kê nhiệm vụ trong 7 ngày tiếp theo không?")) {
      window.dispatchEvent(new CustomEvent("openCanvas", { detail: { type: "chart", data: tasks } }));
    }
  };

  const handleTimeFilterSelect = (value: string | null) => {
    if (onFilterChange) {
      onFilterChange({ type: "date", value });
    }
    setIsTimeFilterOpen(false);
  };

  const handleCategoryFilterSelect = (value: string | null) => {
    if (onFilterChange) {
      onFilterChange({ type: "list", value });
    }
    if (value && onShowList) {
      onShowList(value);
    }
    setIsCategoryFilterOpen(false);
  };

  return (
    <div className="bg-white shadow-sm p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">To Do List</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm nhiệm vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 hover:bg-gray-100 rounded-lg relative cursor-pointer">
            <button onClick={() => setIsTimeFilterOpen(!isTimeFilterOpen)} className="flex items-center">
              <Filter size={20} />
              <span className="ml-1">Thời gian</span>
            </button>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {todayTasks + next7DaysTasks + overdueTasks}
            </span>
            <div
              className={`absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg p-2 z-20 ${
                isTimeFilterOpen ? "block" : "hidden"
              }`}
            >
              <button
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                onClick={() => handleTimeFilterSelect("today")}
              >
                Hôm nay ({todayTasks})
              </button>
              <button
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                onClick={() => handleTimeFilterSelect("next7Days")}
              >
                7 ngày tới ({next7DaysTasks})
              </button>
              <button
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded text-red-600"
                onClick={() => handleTimeFilterSelect("overdue")}
              >
                Quá hạn ({overdueTasks})
              </button>
              <button
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                onClick={() => handleTimeFilterSelect(null)}
              >
                Tất cả
              </button>
            </div>
          </div>

          <div className="p-2 hover:bg-gray-100 rounded-lg relative cursor-pointer">
            <button onClick={() => setIsCategoryFilterOpen(!isCategoryFilterOpen)} className="flex items-center">
              <Filter size={20} />
              <span className="ml-1">Phân loại</span>
            </button>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {personalTasks + workTasks + groceryTasks}
            </span>
            <div
              className={`absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg p-2 z-20 ${
                isCategoryFilterOpen ? "block" : "hidden"
              }`}
            >
              <button
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                onClick={() => handleCategoryFilterSelect("personal")}
              >
                Cá nhân ({personalTasks})
              </button>
              <button
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                onClick={() => handleCategoryFilterSelect("work")}
              >
                Công việc ({workTasks})
              </button>
              <button
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                onClick={() => handleCategoryFilterSelect("grocery")}
              >
                Danh sách mua sắm ({groceryTasks})
              </button>
              <button
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                onClick={() => handleCategoryFilterSelect(null)}
              >
                Tất cả
              </button>
            </div>
          </div>

          {isAuthenticated && (
            <>
              <button
                onClick={onAddTask}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <Plus size={20} />
                Thêm nhiệm vụ
              </button>
              <button
                onClick={openChart}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Xem biểu đồ thống kê nhiệm vụ"
              >
                <BarChart2 size={20} />
              </button>
            </>
          )}
          {isAuthenticated && onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Đăng xuất
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopBar;