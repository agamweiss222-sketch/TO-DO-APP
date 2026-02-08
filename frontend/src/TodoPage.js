import "./APP.css";

const today = new Date().toISOString().split("T")[0];




function TodoPage({
  name,
  role,
  tasks,
  setTasks,
  sortTasks,
  isOverdue,
  toggleComplete,
  toggleEdit,
  saveEdit,
  deleteTask,
  openTasks,
  toggleDescription,
  taskInput,
  setTaskInput,
  description,
  setDescription,
  dueDate,
  setDueDate,
  addTask,
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
          <h2 className="panel-title">Your Tasks</h2>

          <button
            className="send-button"
            onClick={() => navigate("/calendar")}
            style={{ marginBottom: "15px" , background: "#6c4ed9" }}
          >
            📅 Calendar
          </button>

          <ul className="tasks-list">
            {sortTasks(tasks).map((task) => (
              <li
                key={task.id}
                className={`task-item ${isOverdue(task) ? "overdue" : ""}`}
              >
                <div className="task-left">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task)}
                  />

                  {task.isEditing ? (
                    <div className="edit-box">
                      <input
                        className="input-box edit-input"
                        value={task.editText}
                        autoFocus
                        onChange={(e) =>
                          setTasks(
                            tasks.map((t) =>
                              t.id === task.id
                                ? { ...t, editText: e.target.value }
                                : t
                            )
                          )
                        }
                      />

                      <textarea
                        className="input-box edit-input"
                        value={task.editDescription}
                        placeholder="Edit description..."
                        onChange={(e) =>
                          setTasks(
                            tasks.map((t) =>
                              t.id === task.id
                                ? {
                                    ...t,
                                    editDescription: e.target.value,
                                  }
                                : t
                            )
                          )
                        }
                      />

                      <input
                        className="input-box edit-input"
                        type="date"
                        value={task.editDueDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          setTasks(
                            tasks.map((t) =>
                              t.id === task.id
                                ? {
                                    ...t,
                                    editDueDate: e.target.value,
                                  }
                                : t
                            )
                          )
                        }
                      />

                      <button
                        className="send-button"
                        onClick={() => saveEdit(task)}
                        style={{background: "#6c4ed9" }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="task-text">
                      <div className="task-main-line">
                        <span
                          className={task.completed ? "completed" : ""}
                        >
                          {task.text}
                        </span>

                        {task.description && (
                          <button
                            className="arrow-button"
                            onClick={() =>
                              toggleDescription(task.id)
                            }
                          >
                            {openTasks[task.id] ? "▲" : "▼"}
                          </button>
                        )}
                      </div>

                      {task.due_date && (
                        <div className="task-date">
                          Due: {task.due_date}
                        </div>
                      )}

                      {openTasks[task.id] && (
                        <div className="task-description">
                          {task.description && (
                            <div>
                              <b>Description:</b> {task.description}
                            </div>
                          )}

                          <div>
                            <b>Created by:</b> {task.created_by_name}
                          </div>

                          {task.created_at && (
                            <div>
                              <b>Created at:</b>{" "}
                              {new Date(
                                task.created_at
                              ).toLocaleDateString("he-IL")}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!task.isEditing && (
                  <div className="task-actions">
                    <button
                      className="send-button edit-button"
                      onClick={() => toggleEdit(task.id)}
                    >
                      Edit
                    </button>

                    <button
                      className="send-button delete-button"
                      onClick={() => deleteTask(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* צד ימין – הוספת משימה */}
        <div className="add-panel">
          <h2 className="panel-title">Add New Task</h2>

          <div className="task-input-container">
            <input
              className="input-box"
              type="text"
              placeholder="Add a task"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
            />

            <textarea
              className="input-box"
              placeholder="Description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              className="input-box"
              type="date"
              value={dueDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <button className="send-button" onClick={addTask}
            style={{ background: "#6c4ed9" }}>
              Add
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default TodoPage;
