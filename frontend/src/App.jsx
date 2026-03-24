import { useEffect, useState } from "react";

//const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/";
//const API_BASE = "http://127.0.0.1:8000";
const API_BASE = "https://lab3-dv4i.onrender.com"; //Backend
console.log("API BASE:", API_BASE);


export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [incidents, setIncidents] = useState([]);
  const [message, setMessage] = useState("");

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [incidentForm, setIncidentForm] = useState({
    title: "",
    description: "",
    status: "",
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  async function fetchIncidents() {
    setMessage("");

    try {
      console.log("FETCH URL:", `${API_BASE}/incidents`);

      const response = await fetch(`${API_BASE}/incidents`);

      console.log("Status:", response.status);
      console.log("Response URL:", response.url);

      const data = await response.json();
      console.log("Incidents data:", data);

      if (!response.ok) {
        setMessage(`Failed to load incidents. Status: ${response.status}`);
        return;
      }

      setIncidents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch incidents error:", error);
      setMessage("Could not connect to backend.");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", loginForm.username);
      formData.append("password", loginForm.password);

      const response = await fetch(`${API_BASE}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Login failed.");
        return;
      }

      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
      setMessage("Login successful.");
    } catch (error) {
      setMessage("Could not connect to backend.");
    }
  }

  async function handleCreateIncident(e) {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Please log in first.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(incidentForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Failed to create incident.");
        return;
      }

      setMessage("Incident created successfully.");

      setIncidentForm({
        title: "",
        description: "",
        status: "",
      });

      fetchIncidents();
    } catch (error) {
      setMessage("Could not create incident.");
    }
  }

  async function handleDeleteIncident(id) {
    setMessage("");

    if (!token) {
      setMessage("Please log in first.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/incidents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Failed to delete incident.");
        return;
      }

      setMessage("Incident deleted successfully.");
      fetchIncidents();
    } catch (error) {
      setMessage("Could not delete incident.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken("");
    setMessage("Logged out.");
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Network Incident Reporting System</h1>
        <p style={styles.subheading}>Frontend UI for local backend testing</p>

        {message && <div style={styles.message}>{message}</div>}

        <div style={styles.section}>
          <h2>Login</h2>
          {!token ? (
            <form onSubmit={handleLogin} style={styles.form}>
              <input
                type="text"
                placeholder="Username"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, username: e.target.value })
                }
                style={styles.input}
              />

              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                style={styles.input}
              />

              <button type="submit" style={styles.button}>
                Log In
              </button>
            </form>
          ) : (
            <div>
              <p>You are logged in.</p>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Log Out
              </button>
            </div>
          )}
        </div>

        <div style={styles.section}>
          <h2>Create Incident</h2>
          <form onSubmit={handleCreateIncident} style={styles.form}>
            <input
              type="text"
              placeholder="Title"
              value={incidentForm.title}
              onChange={(e) =>
                setIncidentForm({ ...incidentForm, title: e.target.value })
              }
              style={styles.input}
            />

            <textarea
              placeholder="Description"
              value={incidentForm.description}
              onChange={(e) =>
                setIncidentForm({
                  ...incidentForm,
                  description: e.target.value,
                })
              }
              style={styles.textarea}
            />

            <input
              type="text"
              placeholder="Status"
              value={incidentForm.status}
              onChange={(e) =>
                setIncidentForm({ ...incidentForm, status: e.target.value })
              }
              style={styles.input}
            />

            <button type="submit" style={styles.button}>
              Create Incident
            </button>
          </form>
        </div>

        <div style={styles.section}>
          <h2>All Incidents</h2>
          <button onClick={fetchIncidents} style={styles.refreshButton}>
            Refresh Incidents
          </button>

          {incidents.length === 0 ? (
            <p style={{ marginTop: "15px" }}>No incidents found.</p>
          ) : (
            <div style={styles.cardContainer}>
              {incidents.map((incident) => (
                <div key={incident.id} style={styles.card}>
                  <h3>{incident.title || "Untitled Incident"}</h3>
                  <p>
                    <strong>Description:</strong>{" "}
                    {incident.description || "No description"}
                  </p>
                  <p>
                    <strong>Status:</strong> {incident.status || "No status"}
                  </p>
                  <p>
                    <strong>ID:</strong> {incident.id}
                  </p>

                  {token && (
                    <button
                      onClick={() => handleDeleteIncident(incident.id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f4f7fb",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  heading: {
    textAlign: "center",
    marginBottom: "8px",
    color: "#1f3c88",
  },
  subheading: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#555",
  },
  section: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  textarea: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    minHeight: "100px",
    resize: "vertical",
  },
  button: {
    padding: "12px",
    backgroundColor: "#1f3c88",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  logoutButton: {
    padding: "10px 14px",
    backgroundColor: "#666",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  refreshButton: {
    padding: "10px 14px",
    backgroundColor: "#2d6a4f",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "15px",
  },
  deleteButton: {
    marginTop: "10px",
    padding: "10px 14px",
    backgroundColor: "#c1121f",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  cardContainer: {
    display: "grid",
    gap: "15px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "15px",
    backgroundColor: "#fafafa",
  },
  message: {
    marginBottom: "20px",
    padding: "12px",
    backgroundColor: "#e9f5ff",
    border: "1px solid #b6e0fe",
    borderRadius: "8px",
    color: "#0c5460",
  },
};