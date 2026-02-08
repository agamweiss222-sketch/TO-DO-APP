import { useState, useEffect } from "react";
import "./APP.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import CalendarPage from "./CalendarPage";
import SignupPage from "./SignupPage";
import AdminPage from "./AdminPage";
import LoginPage from "./LoginPage";
import TodoPage from "./TodoPage";
import { apiFetch } from "./api";






function App() {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [ openTasks, setOpenTasks] = useState({});
  const role = sessionStorage.getItem("role");
  
  


  useEffect(() => {
  const savedUserName = sessionStorage.getItem("userName");

  if (savedUserName) {
    setName(savedUserName);
    setSubmitted(true);
  }
  }, []);

  const handleLogin = (userData) => {
  sessionStorage.setItem("accessToken", userData.access_token);
  sessionStorage.setItem("userName", userData.name);
  sessionStorage.setItem("role", userData.role);

  setName(userData.name);
  setSubmitted(true);
};

useEffect(() => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) return;

  async function loadTasks() {
    const res = await apiFetch("http://127.0.0.1:8000/tasks/");
    if (!res) return;
    const data = await res.json();
    setTasks(data);
  }

  loadTasks();
}, [submitted]);



  const addTask = async () => {
    if (taskInput.trim() === "") return;

    if (!taskInput.trim() || !description.trim() || !dueDate) {
      alert("יש למלא כותרת, תיאור ותאריך");
      return;
    }

    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);


      const selected = new Date(dueDate);
      selected.setHours(0, 0, 0, 0);

    

      if (selected < today) {
        alert("You cannot select a past due date");
        return;
      }
    }

      const response = await apiFetch(
      "http://127.0.0.1:8000/tasks/",
      {
        method: "POST",
        body: JSON.stringify({
          text: taskInput.trim(),
          completed: false,
          due_date: dueDate || null,
          description: description.trim() || null,
        }),
      }
    );


    const savedTask = await response.json();
    setTasks((prevTasks) =>
      Array.isArray(prevTasks) ? [...prevTasks, savedTask] : [savedTask]
    );
    setTaskInput("");
    setDueDate("");
    setDescription("");

  };

  const toggleComplete = async (task) => {
    const response = await apiFetch(
    `http://127.0.0.1:8000/tasks/${task.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: task.text,
          completed: !task.completed,
          due_date: task.due_date,
          description: task.description,
      }),
      }
    );
    const updatedTask = await response.json();

    setTasks((prevTasks) =>
  Array.isArray(prevTasks)
    ? prevTasks.map((t) =>
        t.id === updatedTask.id ? updatedTask : t
      )
    : []
);

  };

  const toggleEdit = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id 
          ? { 
              ...task,
              isEditing: !task.isEditing,
              editText: task.text,
              editDescription: task.description || "",
              editDueDate: task.due_date || "",
            } 
            : task
      )
    );
  };

 const saveEdit = async (task) => {

  if (!task.editDescription?.trim() ||
  !task.editDueDate) {
    alert("יש למלא תיאור ותאריך");
    return;
  }


  // ✅ חסימת תאריך עבר בעריכה
  if (task.editDueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(task.editDueDate);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) {
      alert("You cannot select a past due date");
      return;
    }
  }

  const response = await apiFetch(
  `http://127.0.0.1:8000/tasks/${task.id}`,

    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: task.editText,
        completed: task.completed,
        due_date: task.editDueDate ? task.editDueDate : null,
        description: task.editDescription ? task.editDescription : null,
      }),
    }
  );

  const updatedTask = await response.json();

  setTasks((prevTasks) =>
  Array.isArray(prevTasks)
    ? prevTasks.map((t) =>
        t.id === updatedTask.id
          ? { ...updatedTask, isEditing: false }
          : t
      )
    : []
);

};


  const deleteTask = async (id) => {
    await apiFetch(
  `http://127.0.0.1:8000/tasks/${id}`,
  { method: "DELETE" }
);


    setTasks((prevTasks) =>
  Array.isArray(prevTasks)
    ? prevTasks.filter((task) => task.id !== id)
    : []
);

  };
  //פונקציה שפותחת חץ
  const toggleDescription = (id) => {
  setOpenTasks((prev) => ({
    ...prev,
    [id]: !prev[id],
  }));
};

  const logout = () => {
    sessionStorage.clear();
    setSubmitted(false);
    setName("");
    setTasks([]); 
  };

  const sortTasks = (tasksArray) => {
  if (!Array.isArray(tasksArray)) {
    return [];
  }

  return [...tasksArray].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed - b.completed;
    }
    return new Date(a.due_date) - new Date(b.due_date);
  });
};

const isOverdue = (task) => {
  if (!task.due_date) return false;
  if (task.completed) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(task.due_date);
  due.setHours(0, 0, 0, 0);

  return due < today;
};

return (
  <Routes>
    <Route
      path="/"
      element={
        submitted ? (
          <div className="container">
            <h1 className="main-title">TO DO LIST</h1>

            <button
              className="logout-button page-logout"
              onClick={logout}
            >
              Logout
            </button>

            <TodoPage
              name={name}
              role={role}
              tasks={tasks}
              setTasks={setTasks}
              sortTasks={sortTasks}
              isOverdue={isOverdue}
              toggleComplete={toggleComplete}
              toggleEdit={toggleEdit}
              saveEdit={saveEdit}
              deleteTask={deleteTask}
              openTasks={openTasks}
              toggleDescription={toggleDescription}
              taskInput={taskInput}
              setTaskInput={setTaskInput}
              description={description}
              setDescription={setDescription}
              dueDate={dueDate}
              setDueDate={setDueDate}
              addTask={addTask}
              navigate={navigate}
            />

          </div>
        ) : (
          <LoginPage onLogin={handleLogin} />
        )
      }
    />

    <Route
      path="/calendar"
      element={<CalendarPage tasks={tasks} />}
    />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/admin" element={<AdminPage />} />
  </Routes>
);



  
}
export default App;