import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8000/")
      .then(res => setMessage(res.data.message));
  }, []);

  return (
    <div>
      <h1>React + Python</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
