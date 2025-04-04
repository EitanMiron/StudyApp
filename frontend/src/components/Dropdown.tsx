// src/components/Dropdown.tsx
import React, { useState } from 'react';
import "../styles/Dropdown.css";

const Dropdown: React.FC = () => {
  const [userDropdown, setUserDropdown] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);

  const toggleUserDropdown = () => {
    setUserDropdown(!userDropdown);
    setAdminDropdown(false);
  };

  const toggleAdminDropdown = () => {
    setAdminDropdown(!adminDropdown);
    setUserDropdown(false);
  };

  return (
    <div className="dropdown-container">
      <button onClick={toggleUserDropdown} className="dropdown-button">
        Login / Register as User
      </button>
      {userDropdown && (
        <div className="dropdown-menu">
          <a href="/login/user">Login as User</a>
          <a href="/register/user">Register as User</a>
        </div>
      )}

      <button onClick={toggleAdminDropdown} className="dropdown-button">
        Login / Register as Admin
      </button>
      {adminDropdown && (
        <div className="dropdown-menu">
          <a href="/login/admin">Login as Admin</a>
          <a href="/register/admin">Register as Admin</a>
        </div>
      )}
    </div>
  );
};

export default Dropdown;