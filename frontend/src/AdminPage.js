import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api";




function AdminPage() {
    const role = sessionStorage.getItem("role");
    const today = new Date().toISOString().split("T")[0];
    const navigate = useNavigate();

  // stateים לטופס
  const [missionTitle, setMissionTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [missions, setMissions] = useState([]);
  const [editingMissionId, setEditingMissionId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");




  const isFormValid =
      missionTitle.trim() &&
      description.trim() &&
      dueDate &&
      dueDate >= today;

  const isEditValid =
      editTitle.trim() &&
      editDescription.trim() &&
      editDueDate &&
      editDueDate >= today;

  useEffect(() => {
    async function loadMissions() {
      const res = await apiFetch("http://127.0.0.1:8000/admin/missions");
      if (!res) return;
      const data = await res.json();
      setMissions(data);
    }

    loadMissions();
  }, []);


  if (role !== "admin") {
    return <h2>אין לך הרשאה</h2>;
  }

  async function handleAddMission() {
    if (!isFormValid) {
      setError("יש למלא את כל השדות ולבחור תאריך תקין");
      return;
    }

    setError("");

    const response = await apiFetch(
      "http://127.0.0.1:8000/admin/missions",
      {
        method: "POST",
        body: JSON.stringify({
          title: missionTitle,
          due_date: dueDate,
          description: description,
        }),
      }
    );

    const newMission = await response.json();
    setMissions([...missions, newMission]);
    setSuccess("המשימה נוספה בהצלחה 🎉");

    setMissionTitle("");
    setDescription("");
    setDueDate("");

    setTimeout(() => {
      setSuccess("");
    }, 2500);
  }



async function handleAdminDelete(missionId) {
  await apiFetch(
    `http://127.0.0.1:8000/admin/missions/${missionId}`,
    { method: "DELETE" }
  );

  setMissions(missions.filter((m) => m.id !== missionId));
}

function startEdit(mission) {
  setEditingMissionId(mission.id);
  setEditTitle(mission.title);
  setEditDescription(mission.description || "");
  setEditDueDate(mission.due_date || "");
}

async function saveEdit(missionId) {
  if (editDueDate && editDueDate < today) {
    alert("לא ניתן לבחור תאריך מוקדם מהיום");
    return;
  }

  if (!isEditValid) {
    alert("יש למלא את כל השדות ולבחור תאריך תקין");
    return;
  }

  await apiFetch(
    `http://127.0.0.1:8000/admin/missions/${missionId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        due_date: editDueDate,
      }),
    }
  );

  setMissions(
    missions.map((m) =>
      m.id === missionId
        ? { ...m, title: editTitle, description: editDescription, due_date: editDueDate }
        : m
    )
  );

  setEditingMissionId(null);
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

        {/* הוספת משימה */}
        <div className="task-panel">
          <h3>➕ הוספת משימה חדשה</h3>

          <input
            placeholder="כותרת משימה"
            value={missionTitle}
            onChange={(e) => setMissionTitle(e.target.value)}
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
            onClick={handleAddMission}
          >
            הוסף משימה
          </button>
        </div>

        <div className="users-panel">
          <h3>📋 כל המשימות</h3>

          {missions.length === 0 ? (
            <p>אין משימות במערכת</p>
          ) : (
            [...missions]
              .sort((a, b) => {
                const dateA = a.due_date ? new Date(a.due_date) : new Date("9999-12-31");
                const dateB = b.due_date ? new Date(b.due_date) : new Date("9999-12-31");
                return dateA - dateB;
              })
              .map((mission) => (

                <div key={mission.id} className="user-item">
                  {editingMissionId === mission.id ? (
                    <>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Mission title"
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
                        <button className="save-btn" onClick={() => saveEdit(mission.id)}>Save</button>
                        <button className="cancel-btn" onClick={() => setEditingMissionId(null)}>Cancel</button>
                      </div>

                    </>
                  ) : (
                    <>
                      <strong>{mission.title}</strong>
                      <div>{mission.description}</div>
                      <div>Due: {mission.due_date || "—"}</div>
                      <div>Created by: {mission.created_by_name || "—"}</div>

                      <div className="task-actions">
                        <button
                          className="edit-btn"
                          onClick={() => startEdit(mission)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleAdminDelete(mission.id)}
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
