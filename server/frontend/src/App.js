import Login from "./components/Login/Login.jsx";
import Register from "./components/Register/Register.jsx"; 
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} /> 
    </Routes>
  );
}

export default App;
