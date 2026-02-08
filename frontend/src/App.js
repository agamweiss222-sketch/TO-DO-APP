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
  const [missions, setMissions] = useState([]);
  const navigate = useNavigate();
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

  async function loadMissions() {
    const res = await apiFetch("http://127.0.0.1:8000/missions");
    if (!res) return;
    const data = await res.json();
    setMissions(data);
  }

  loadMissions();
}, [submitted]);





  const toggleComplete = async (mission) => {
    const method = mission.completed ? "DELETE" : "POST";

    await apiFetch(`http://127.0.0.1:8000/missions/${mission.id}/complete`, {
      method: method,
      headers: { "Content-Type": "application/json" },
    });

    setMissions((prevMissions) =>
      Array.isArray(prevMissions)
        ? prevMissions.map((m) =>
            m.id === mission.id ? { ...m, completed: !m.completed } : m
          )
        : []
    );
  };

  const toggleEdit = (id) => {
    setMissions(
      missions.map((mission) =>
        mission.id === id 
          ? { 
              ...mission,
              isEditing: !mission.isEditing,
              editText: mission.title,
              editDescription: mission.description || "",
              editDueDate: mission.due_date || "",
            } 
            : mission
      )
    );
  };

const saveEdit = async (mission) => {
  if (!mission.editDescription?.trim() || !mission.editDueDate) {
    alert("יש למלא תיאור ותאריך");
    return;
  }

  if (mission.editDueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(mission.editDueDate);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) {
      alert("You cannot select a past due date");
      return;
    }
  }

  const response = await apiFetch(
    `http://127.0.0.1:8000/missions/${mission.id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: mission.editText,
        due_date: mission.editDueDate ? mission.editDueDate : null,
        description: mission.editDescription ? mission.editDescription : null,
      }),
    }
  );

  const updatedMission = await response.json();

  setMissions((prevMissions) =>
    Array.isArray(prevMissions)
      ? prevMissions.map((m) =>
          m.id === updatedMission.id
            ? { ...updatedMission, isEditing: false }
            : m
        )
      : []
  );
};


  const deleteMission = async (id) => {
    await apiFetch(
      `http://127.0.0.1:8000/missions/${id}`,
      { method: "DELETE" }
    );

    setMissions((prevMissions) =>
      Array.isArray(prevMissions)
        ? prevMissions.filter((mission) => mission.id !== id)
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
    setMissions([]); 
  };

  const sortMissions = (missionsArray) => {
  if (!Array.isArray(missionsArray)) {
    return [];
  }

  return [...missionsArray].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed - b.completed;
    }
    return new Date(a.due_date) - new Date(b.due_date);
  });
};

const isOverdue = (mission) => {
  if (!mission.due_date) return false;
  if (mission.completed) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(mission.due_date);
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
              missions={missions}
              setMissions={setMissions}
              sortMissions={sortMissions}
              isOverdue={isOverdue}
              toggleComplete={toggleComplete}
              toggleEdit={toggleEdit}
              saveEdit={saveEdit}
              deleteMission={deleteMission}
              openTasks={openTasks}
              toggleDescription={toggleDescription}
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
      element={<CalendarPage missions={missions} />}
    />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/admin" element={<AdminPage />} />
  </Routes>
);



  
}
export default App;