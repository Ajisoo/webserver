import React from 'react';
import {Routes, Route} from 'react-router-dom';
import Home from './pages/home';
import Schedule from './pages/schedule';
import Tetris from './pages/tetris';
import Auth from './pages/auth';
import Admin from "./pages/admin";
import NoRoute from './pages/noroute';
import NavBar from './component/navbar';

export default function App() {
  return (
    <>
      <NavBar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/schedule" element={<Schedule/>}/>
        <Route path="/tetris" element={<Tetris/>}/>
        <Route path="/auth" element={<Auth/>}/>
        <Route path="/sadbot" element={<Sadbot/>}/>
        <Route path="/admin" element={<Admin/>}/>
        <Route path="*" element={<NoRoute/>}/>
      </Routes>
    </>
  );
};
