import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api";


function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();


 useEffect(() => {
  async function loadTasks() {
    const res = await apiFetch("http://127.0.0.1:8000/tasks/");
    if (!res) return;
    const data = await res.json();
    setTasks(data);
  }

  loadTasks();
}, []);

 const formatDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

  const selectedDate = formatDate(date);

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const taskDates = safeTasks
  .filter(task => task.due_date)
  .map(task => task.due_date);


const tasksForDate = safeTasks.filter(
  (task) => task.due_date === selectedDate
);





  return (
    <div className="container">
      <h1 className="main-title">📅 Calendar</h1>

      <button className="send-button" onClick={() => navigate("/")}>
        Back to Tasks
      </button>

      <div style={{ marginTop: "20px" }}>
        <Calendar
          value={date}
          onChange={setDate}
          tileClassName={({ date, view }) => {
            if (view === "month") {
              const day = formatDate(date);
              if (taskDates.includes(day)) {
                return "day-with-task";
              }
            }
            return null;
          }}
        />

      </div>

      <h2 style={{ marginTop: "20px" }}>
        Tasks for {selectedDate}
      </h2>

      {tasksForDate.length === 0 ? (
        <p>No tasks for this date.</p>
      ) : (
        <ul className="tasks-list">
          {tasksForDate.map((task) => (
            <li key={task.id} className="task-item">
              {task.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CalendarPage;
