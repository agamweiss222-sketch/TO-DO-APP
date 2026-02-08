import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api";


function CalendarPage({ missions }) {
  const [date, setDate] = useState(new Date());
  const [localMissions, setLocalMissions] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    async function loadMissions() {
      const res = await apiFetch("http://127.0.0.1:8000/missions");
      if (!res) return;
      const data = await res.json();
      setLocalMissions(data);
    }

    loadMissions();
  }, []);

 const formatDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

  const selectedDate = formatDate(date);

  const safeMissions = Array.isArray(localMissions) ? localMissions : [];

  const missionDates = safeMissions
    .filter(mission => mission.due_date)
    .map(mission => mission.due_date);

  const missionsForDate = safeMissions.filter(
    (mission) => mission.due_date === selectedDate
  );





  return (
    <div className="container">
      <h1 className="main-title">📅 Calendar</h1>

      <button className="send-button" onClick={() => navigate("/")}>
        Back to Missions
      </button>

      <div style={{ marginTop: "20px" }}>
        <Calendar
          value={date}
          onChange={setDate}
          tileClassName={({ date, view }) => {
            if (view === "month") {
              const day = formatDate(date);
              if (missionDates.includes(day)) {
                return "day-with-task";
              }
            }
            return null;
          }}
        />

      </div>

      <h2 style={{ marginTop: "20px" }}>
        Missions for {selectedDate}
      </h2>

      {missionsForDate.length === 0 ? (
        <p>No missions for this date.</p>
      ) : (
        <ul className="tasks-list">
          {missionsForDate.map((mission) => (
            <li key={mission.id} className="task-item">
              {mission.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CalendarPage;
