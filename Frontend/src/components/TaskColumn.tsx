import { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import type { Task } from "../types";
import type { DraggableProvided } from "@hello-pangea/dnd";

interface TaskColumnProps {
  column: {
    id: Task["status"];
    title: string;
  };
  tasks: Task[];
  onEdit: (task: Task) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
  onStatusChange: (taskId: number, newStatus: Task["status"]) => Promise<void>;
  onAddTask: (taskData: Partial<Task>) => Promise<void>;
}

function AddTaskForm({
  status,
  onAdd,
}: {
  status: Task["status"];
  onAdd: (taskData: Partial<Task>) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onAdd({
      title,
      status,
      deadline: deadline || undefined,
      priority: "medium",
      list: "Personal",
      tags: [],
    });
    setTitle("");
    setDeadline("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nhiệm vụ mới..."
        className="border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        className="border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
      >
        Thêm
      </button>
    </form>
  );
}

function TaskColumn({ column, tasks, onEdit, onDelete, onStatusChange, onAddTask }: TaskColumnProps) {
  return (
    <Droppable droppableId={column.id}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="bg-gray-100 rounded-lg p-4 shadow-md flex flex-col min-w-[250px]"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-800">{column.title}</h2>
          <div className="flex-1 space-y-3">
            {tasks
              .filter((task) => task.status === column.id)
              .map((task, index) => (
                <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                  {(draggableProvided: DraggableProvided) => (
                    <TaskCard
                      task={task}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                      provided={draggableProvided}
                    />
                  )}
                </Draggable>
              ))}
            {provided.placeholder}
          </div>
          <AddTaskForm status={column.id} onAdd={onAddTask} />
        </div>
      )}
    </Droppable>
  );
}

export default TaskColumn;