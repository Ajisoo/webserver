import React from 'react';
import { NavLink } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from 'jwt-decode';
import './navbar.css'

export default function NavBar() {
  const refreshToken = Cookies.get('refreshToken');
  let isAdmin = false;
  let isSadbot = false;

  if (refreshToken) {
    try {
      // Decode the JWT payload (does NOT verify signature)
      const payload = jwtDecode(refreshToken);

      // Read roles
      const roles = payload.roles || [];

      // Example: show/hide modules based on roles
      isAdmin = roles.includes('ROLE_ADMIN');
      isSadbot = roles.includes('ROLE_SADBOT');
    } catch (err) {}
  }

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

        {isSadbot && (
                  <li>
                    <NavLink
                      to="/sadbot"
                      className={({ isActive }) =>
                        "navbar-link" + (isActive ? " active" : "")
                      }
                    >
                      Sadbot
                    </NavLink>
                  </li>
                )}

        {isAdmin && (
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