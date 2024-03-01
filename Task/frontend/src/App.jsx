import { useEffect, useState } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
import LoginPage from "./app/Login/Login";
import AdminPanel from "./app/AdminPanel";
import Workshop from "./app/Workshop";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setIsAdmin(role === "admin");
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/workshop"
            element={!isAdmin ? <Workshop /> : <Navigate to="/" replace />}
          />
          <Route
            path="/admin-Panel"
            element={isAdmin ? <AdminPanel /> : <Navigate to="/" replace />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
