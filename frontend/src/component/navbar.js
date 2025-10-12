import React from 'react';
import { NavLink } from "react-router-dom";
import Cookies from "js-cookie";
import './navbar.css'

export default function NavBar() {
  const refreshToken = Cookies.get('refreshToken');

  return (
    <nav className="navbar"> {/* <-- Add navbar class */}
      <ul className="navbar-list"> {/* <-- Add navbar-list class */}
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              "navbar-link" + (isActive ? " active" : "") // <-- Updated className logic
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/schedule"
            className={({ isActive }) =>
              "navbar-link" + (isActive ? " active" : "")
            }
          >
            Schedule
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/tetris"
            className={({ isActive }) =>
              "navbar-link" + (isActive ? " active" : "")
            }
          >
            Tetris
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/auth"
            className={({ isActive }) =>
              "navbar-link" + (isActive ? " active" : "")
            }
          >
            Auth
          </NavLink>
        </li>

        {refreshToken && (
          <li>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                "navbar-link" + (isActive ? " active" : "")
              }
            >
              Admin
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};