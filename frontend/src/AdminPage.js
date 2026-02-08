import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api";




function AdminPage() {
  // מי ה־ADMIN (שמרנו בלוגין)
    const role = sessionStorage.getItem("role");
    const today = new Date().toISOString().split("T")[0];
    const navigate = useNavigate();

  // stateים לטופס
  const [selectedUserId, setSelectedUserId] = useState("");
  const [taskText, setTaskText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userTasks, setUserTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");




  const isFormValid =
      selectedUserId &&
      taskText.trim() &&
      description.trim() &&
      dueDate &&
      dueDate >= today;

  const isEditValid =
      editText.trim() &&
      editDescription.trim() &&
      editDueDate &&
      editDueDate >= today;

  
 useEffect(() => {
  async function loadUsers() {
    const res = await apiFetch("http://127.0.0.1:8000/users");
    if (!res) return;
    const data = await res.json();
    setUsers(data);
  }

  loadUsers();
}, []);


useEffect(() => {
  if (!selectedUserId) {
    setUserTasks([]);
    return;
  }

  async function loadUserTasks() {
    const res = await apiFetch(
      `http://127.0.0.1:8000/admin/users/${selectedUserId}/tasks`
    );
    if (!res) return;
    const data = await res.json();
    setUserTasks(data);
  }

  loadUserTasks();
}, [selectedUserId]);


  // אם זה לא ADMIN – חוסמים
  if (role !== "admin") {
    return <h2>אין לך הרשאה</h2>;
  }

 async function handleAddTask() {
  if (!isFormValid) {
    setError("יש למלא את כל השדות ולבחור תאריך תקין");
    return;
  }

  setError("");

 await apiFetch(
  `http://127.0.0.1:8000/admin/users/${selectedUserId}/tasks`,
  {
    method: "POST",
    body: JSON.stringify({
      text: taskText,
      completed: false,
      due_date: dueDate,
      description: description,
    }),
  }
);


  setSuccess("המשימה נוספה בהצלחה 🎉");


  // איפוס הכל
  setTaskText("");
  setDescription("");
  setDueDate("");
  setSelectedUserId("");

  setTimeout(() => {
  setSuccess("");
  }, 2500);
}



async function handleAdminDelete(taskId) {
  await apiFetch(
  `http://127.0.0.1:8000/admin/tasks/${taskId}`,
  { method: "DELETE" }
);


  setUserTasks(userTasks.filter((t) => t.id !== taskId));
}

function startEdit(task) {
  setEditingTaskId(task.id);
  setEditText(task.text);
  setEditDescription(task.description || "");
  setEditDueDate(task.due_date || "");
}

async function saveEdit(taskId) {
   if (editDueDate && editDueDate < today) {
    alert("לא ניתן לבחור תאריך מוקדם מהיום");
    return;
  }

  if (!isEditValid) {
    alert("יש למלא את כל השדות ולבחור תאריך תקין");
    return;
  }

  // שאר הקוד נשאר

  
 await apiFetch(
  `http://127.0.0.1:8000/admin/tasks/${taskId}`,
  {
    method: "PUT",
    body: JSON.stringify({
      text: editText,
      description: editDescription,
      due_date: editDueDate,
    }),
  }
);


  // רענון הרשימה
  setUserTasks(
    userTasks.map((t) =>
      t.id === taskId
        ? { ...t, text: editText, description: editDescription, due_date: editDueDate }
        : t
    )
  );

  setEditingTaskId(null);
}


  return (
  <div className="admin-container">

    <div className="admin-header">
      <h1>🛠 Admin Panel</h1>

      <button
        className="back-btn"
        onClick={() => navigate("/")}
      >
        ← חזרה למשימות שלי
      </button>
    </div>

    <div className="admin-content">

      {/* משתמשים */}
      <div className="users-panel">
        <h3>👥 משתמשים</h3>

        {users
        .filter((user) => user.role !== "admin")
        .map((user) => (
          <button
            key={user.id}
            className={`user-item ${
              selectedUserId === user.id.toString() ? "active" : ""
            }`}
            onClick={() => setSelectedUserId(user.id.toString())}
          >
            {user.name}
          </button>
  ))}

      </div>

      {/* הוספת משימה */}
      <div className="task-panel">
        <h3>➕ הוספת משימה</h3>

        <input
          placeholder="כותרת משימה"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
        />

        <textarea
          placeholder="תיאור"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="date"
          value={dueDate}
          min={today}
          onChange={(e) => setDueDate(e.target.value)}
        />
        {success && <p className="success-text">{success}</p>}
        {error && <p className="error-text">{error}</p>}
        <button
          className="add-task-btn"
          onClick={handleAddTask}
          disabled={!selectedUserId}
        >
          הוסף משימה
        </button>
      </div>
       <div className="users-panel">
        <h3>📋 משימות של המשתמש</h3>

        {userTasks.length === 0 ? (
          <p>אין משימות למשתמש זה</p>
        ) : (
      [...userTasks]
      .sort((a, b) => {
        // 1️⃣ משימות שבוצעו יורדות למטה
        if (a.completed !== b.completed) {
          return a.completed - b.completed;
        }

        // 2️⃣ מיון לפי תאריך – קרוב קודם
        const dateA = a.due_date ? new Date(a.due_date) : new Date("9999-12-31");
        const dateB = b.due_date ? new Date(b.due_date) : new Date("9999-12-31");

        return dateA - dateB;
      })
      .map((task) => (

        <div key={task.id} className="user-item">
          {editingTaskId === task.id ? (
            <>
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Task title"
              />

              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description"
              />

              <input
                type="date"
                value={editDueDate}
                min={today}
                onChange={(e) => setEditDueDate(e.target.value)}
              />
              <div className="task-actions">
                <button className="save-btn" onClick={() => saveEdit(task.id)}>Save</button>
                <button className="cancel-btn" onClick={() => setEditingTaskId(null)}>Cancel</button>
              </div>

            </>
          ) : (
            <>
               <strong
                style={{
                  textDecoration: task.completed ? "line-through" : "none",
                  opacity: task.completed ? 0.6 : 1,
                }}
              >
                {task.completed ? "✔️ " : ""}{task.text}
              </strong>
              <div>{task.description}</div>
              <div>Due: {task.due_date || "—"}</div>

              <div className="task-actions">
                <button
                  className="edit-btn"
                  onClick={() => startEdit(task)}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleAdminDelete(task.id)}
                >
                  Delete
                </button>
              </div>

            </>
          )}
        </div>
        ))

         
        )}
      </div>
    </div>
  </div>
);

}

export default AdminPage;
