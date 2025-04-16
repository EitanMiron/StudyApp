// src/components/Dropdown.tsx
import React, { useState } from 'react';
import {Link} from 'react-router-dom';
import "../styles/Dropdown.css";

const Dropdown: React.FC = () => {
  const [studentDropdown, setStudentDropdown] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);

  const toggleUserDropdown = () => {
    setStudentDropdown(!studentDropdown);
    setAdminDropdown(false);
  };

  const toggleAdminDropdown = () => {
    setAdminDropdown(!adminDropdown);
    setStudentDropdown(false);
  };

  return (
    <div className="dropdown-container">
      <button onClick={toggleUserDropdown} className="dropdown-button">
        Login / Register as User
      </button>
      {studentDropdown && (
        <div className="dropdown-menu">
          <Link to="/login/user">Student Login</Link>
          <Link to="/register/user">Student Registration</Link>
        </div>
      )}

      <button onClick={toggleAdminDropdown} className="dropdown-button">
        Login / Register as Admin
      </button>
      {adminDropdown && (
        <div className="dropdown-menu">
          <Link to="/login/admin">Admin Login</Link>
          <Link to="/register/admin">Admin Register</Link>
        </div>
      )}
    </div>
  );
};

export default Dropdown;