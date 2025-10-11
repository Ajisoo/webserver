import React from 'react';
import {NavLink} from "react-router-dom";
import Cookies from "js-cookie";

export default function NavBar() {
  // Check if the refreshToken cookie exists
  const refreshToken = Cookies.get('refreshToken');
  return (
    <nav>
      <ul>
        <li>
          <NavLink
            to="/"
            className={({isActive}) => {
              return isActive ? "active-link" : "";
            }}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/schedule"
            className={({isActive}) => {
              return isActive ? "active-link" : "";
            }}
          >
            Schedule
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/tetris"
            className={({isActive}) => {
              return isActive ? "active-link" : "";
            }}
          >
            Tetris
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/auth"
            className={({isActive}) => {
              return isActive ? "active-link" : "";
            }}
          >
            Auth
          </NavLink>
        </li>

        {/* Conditionally render the Admin link */}
        {refreshToken && (
          <li>
            <NavLink
              to="/admin"
              className={({isActive}) => {
                return isActive ? "active-link" : "";
              }}
            >
              Admin
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};
