import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // バックエンドからタスクデータを取得するAPI呼び出し
    fetch('/api/tasks')
      .then((response) => response.json())
      .then((data) => setTasks(data))
      .catch((error) => console.error('Error fetching tasks', error));
  }, []);

  return (
    <div>
      <h1>タスクトラッキングダッシュボード</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
