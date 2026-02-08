import "./APP.css";

function TodoPage({
  name,
  role,
  missions,
  setMissions,
  sortMissions,
  isOverdue,
  toggleComplete,
  toggleEdit,
  saveEdit,
  deleteMission,
  openTasks,
  toggleDescription,
  navigate,
}) {
  return (
    <>
    
      <p className="welcome-message">Hello {name}!</p>

      {role?.trim().toLowerCase() === "admin" && (

        <button
          className="send-button"
          style={{ marginBottom: "15px", background: "#6c4ed9" }}
          onClick={() => navigate("/admin")}
        >
          Admin Panel
        </button>
      )}

      <div className="todo-layout">
        {/* צד שמאל – משימות */}
        <div className="tasks-panel">
          <h2 className="panel-title">Your Missions</h2>

          <button
            className="send-button"
            onClick={() => navigate("/calendar")}
            style={{ marginBottom: "15px" , background: "#6c4ed9" }}
          >
            📅 Calendar
          </button>

          <ul className="tasks-list">
            {sortMissions(missions).map((mission) => (
              <li
                key={mission.id}
                className={`task-item ${isOverdue(mission) ? "overdue" : ""}`}
              >
                <div className="task-left">
                  <input
                    type="checkbox"
                    checked={mission.completed}
                    onChange={() => toggleComplete(mission)}
                  />

                  {mission.isEditing ? (
                    <div className="edit-box">
                      <input
                        className="input-box edit-input"
                        value={mission.editText}
                        autoFocus
                        onChange={(e) =>
                          setMissions(
                            missions.map((m) =>
                              m.id === mission.id
                                ? { ...m, editText: e.target.value }
                                : m
                            )
                          )
                        }
                      />

                      <textarea
                        className="input-box edit-input"
                        value={mission.editDescription}
                        placeholder="Edit description..."
                        onChange={(e) =>
                          setMissions(
                            missions.map((m) =>
                              m.id === mission.id
                                ? {
                                    ...m,
                                    editDescription: e.target.value,
                                  }
                                : m
                            )
                          )
                        }
                      />

                      <input
                        className="input-box edit-input"
                        type="date"
                        value={mission.editDueDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          setMissions(
                            missions.map((m) =>
                              m.id === mission.id
                                ? {
                                    ...m,
                                    editDueDate: e.target.value,
                                  }
                                : m
                            )
                          )
                        }
                      />

                      <button
                        className="send-button"
                        onClick={() => saveEdit(mission)}
                        style={{background: "#6c4ed9" }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="task-text">
                      <div className="task-main-line">
                        <span
                          className={mission.completed ? "completed" : ""}
                        >
                          {mission.title}
                        </span>

                        {mission.description && (
                          <button
                            className="arrow-button"
                            onClick={() =>
                              toggleDescription(mission.id)
                            }
                          >
                            {openTasks[mission.id] ? "▲" : "▼"}
                          </button>
                        )}
                      </div>

                      {mission.due_date && (
                        <div className="task-date">
                          Due: {mission.due_date}
                        </div>
                      )}

                      {openTasks[mission.id] && (
                        <div className="task-description">
                          {mission.description && (
                            <div>
                              <b>Description:</b> {mission.description}
                            </div>
                          )}

                          <div>
                            <b>Created by:</b> {mission.created_by_name}
                          </div>

                          {mission.created_at && (
                            <div>
                              <b>Created at:</b>{" "}
                              {new Date(
                                mission.created_at
                              ).toLocaleDateString("he-IL")}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!mission.isEditing && role?.trim().toLowerCase() === "admin" && (
                  <div className="task-actions">
                    <button
                      className="send-button edit-button"
                      onClick={() => toggleEdit(mission.id)}
                    >
                      Edit
                    </button>

                    <button
                      className="send-button delete-button"
                      onClick={() => deleteMission(mission.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default TodoPage;
