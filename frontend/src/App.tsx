import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./global.css";
import ChatRoom from "./pages/ChatRoom";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <div className="w-full mx-auto min-h-screen flex items-center justify-center">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chat" element={<ChatRoom />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
