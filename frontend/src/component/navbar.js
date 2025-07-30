import React from 'react';
import { NavLink} from "react-router-dom";

export default function NavBar() {
  return (
    <nav>
      <ul>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => {
              return isActive ? "active-link" : "";
            }}
          >
            Homes
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/schedule"
            className={({ isActive }) => {
              return isActive ? "active-link" : "";
           }}
        >
          Schedule
        </NavLink>
        </li>
        <li>
          <NavLink
            to="/tetris"
            className={({ isActive }) => {
              return isActive ? "active-link" : "";
           }}
        >
          Tetris
        </NavLink>
        </li>
      </ul>
    </nav>
  );
};
