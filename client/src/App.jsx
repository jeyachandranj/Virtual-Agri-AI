import React, { useState } from 'react';
import {  Route, Routes, useLocation } from 'react-router-dom';
import Start from "./pages/TamilBot"
import Home from "./pages/Home"
function App() {

  return (
    <div className="App">
      <Routes>
        <Route path="/interview" element={<Start/>}/>
        <Route path="/" element={<Home/>}/>
      </Routes>
    </div>
  );
}

export default App;