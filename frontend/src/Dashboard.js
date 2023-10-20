import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemType = { TASK: "task" };
const BASE_API_URL = "http://localhost:5000";
const JSON_HEADERS = { "Content-Type": "application/json" };

function Dashboard() {
  const [apiStatus, setApiStatus] = useState("");
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  const fetchData = async (endpoint, options) => {
    try {
      const response = await fetch(`${BASE_API_URL}${endpoint}`, options);
      return await response.json();
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  useEffect(() => {
    fetchData("/")
      .then(data => setApiStatus(data.message))
      .catch(() => setApiStatus("Failed to fetch data from API."));

    fetchData("/tasks").then(data => setTasks(data));
  }, []);

  const refreshTasks = () => fetchData("/tasks").then(data => setTasks(data));

  const addTask = () => {
    fetchData("/tasks", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ title: newTask, column_id: 1 })
    }).then(() => {
      setNewTask("");
      refreshTasks();
    });
  };

  const deleteTask = (columnId, taskIndex) => {
    const taskId = tasks.find(col => col.id === columnId).tasks[taskIndex].id;
    fetchData(`/tasks/${taskId}`, { method: "DELETE" }).then(refreshTasks);
  };

  const moveTask = (fromColumnId, fromIndex, toColumnId, toIndex) => {
    const taskId = tasks.find(col => col.id === fromColumnId).tasks[fromIndex].id;
    fetchData(`/tasks/${taskId}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify({ column_id: toColumnId, task_index: toIndex })
    }).then(refreshTasks);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>API Status: {apiStatus}</div>
      <div className="add-task">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add new task..."
        />
        <button onClick={addTask}>Add Task</button>
      </div>
      <div className="board">
        {tasks && tasks.map(column => (
          <Column
            key={column.id}
            column={column}
            moveTask={moveTask}
            deleteTask={deleteTask}
          />
        ))}
      </div>
    </DndProvider>
  );
}

function Column({ column, moveTask, deleteTask }) {
  return (
    <div className="column">
      <h3>{column.title}</h3>
      <ul>
        {column.tasks.map((taskObj, taskIndex) => (
          <Task
            key={taskObj.id}
            task={taskObj.title}
            columnIndex={column.id}
            taskIndex={taskIndex}
            moveTask={moveTask}
            deleteTask={deleteTask}
          />
        ))}
      </ul>
    </div>
  );
}

function Task({ task, columnIndex, taskIndex, moveTask, deleteTask }) {
  const [, ref] = useDrag({
    type: ItemType.TASK,
    item: { columnIndex, taskIndex },
  });

  const [, drop] = useDrop({
    accept: ItemType.TASK,
    hover: (draggedItem) => {
      if (draggedItem.columnIndex !== columnIndex ||
          draggedItem.taskIndex !== taskIndex) {
        moveTask(draggedItem.columnIndex, draggedItem.taskIndex,
                 columnIndex, taskIndex);
        draggedItem.taskIndex = taskIndex;
        draggedItem.columnIndex = columnIndex;
      }
    },
  });

  return (
    <li ref={(node) => ref(drop(node))}>
      {task}
      <button onClick={() => deleteTask(columnIndex, taskIndex)}>Delete</button>
    </li>
  );
}

export default Dashboard;
