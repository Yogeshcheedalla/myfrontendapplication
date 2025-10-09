import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Login from "./Login";
import Signup from "./Signup";
import Teacher from "./Teacher";
import Student from "./Student";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/teacher" element={<Teacher />} />
      <Route path="/student" element={<Student />} />
    </Routes>
  );
}

export default App;
