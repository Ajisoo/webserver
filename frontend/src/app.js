import React from 'react';
import {Routes, Route, useLocation} from 'react-router-dom';

import Home from './pages/home';
import Schedule from './pages/schedule';
import Tetris from './pages/tetris';
import Auth from './pages/auth';
import Admin from "./pages/admin";
import Sadbot from "./pages/sadbot";
import Plum from "./pages/plum";
import NoRoute from './pages/noroute';
import NavBar from './component/navbar';

import Apple from './pages/apple';
import AppleLeaderboard from './pages/appleLeaderboard';

function AppContent() {
  const location = useLocation();
  const isSecret = location.pathname.startsWith('/secret');

  return (
    <>
      {!isSecret && <NavBar/>}

      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/schedule" element={<Schedule/>}/>
        <Route path="/tetris" element={<Tetris/>}/>
        <Route path="/auth" element={<Auth/>}/>
        <Route path="/sadbot" element={<Sadbot/>}/>
        <Route path="/admin" element={<Admin/>}/>
        <Route path="/plum" element={<Plum/>}/>

        <Route path="/secret/1" element={<Apple paintingId={1}/>}/>
        <Route path="/secret/2" element={<Apple paintingId={2}/>}/>
        <Route path="/secret/3" element={<Apple paintingId={3}/>}/>
        <Route path="/secret/leaderboard" element={<AppleLeaderboard/>}/>

        <Route path="*" element={<NoRoute/>}/>
      </Routes>
    </>
  );
}

export default function App() {
  return <AppContent/>;
}