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
            Home
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
      </ul>
    </nav>
  );
};
