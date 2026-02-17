import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import AuthForm from "./page/LoginSignup";
import Polcreate from "./page/pollpage";
import SinglePoll from "./page/onepole";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/");
    }
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<AuthForm />} />
      <Route path="/" element={<Polcreate />} />
      <Route path="/poll/:id" element={<SinglePoll />} />

    </Routes>
  );
}

export default App;
