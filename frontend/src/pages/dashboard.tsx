import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "@docusaurus/router";
import "./Dashboard.css";
import Input from '../components/UI/Input';
import axios from 'axios';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from '@theme/Layout';

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const history = useHistory();

  // State for form data
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [softwareExp, setSoftwareExp] = useState(user?.software_experience || "intermediate");
  const [hardwareExp, setHardwareExp] = useState(user?.hardware_experience || "intermediate");
  const [isEditing, setIsEditing] = useState(false); // New state for edit mode

  const {
    siteConfig: { customFields },
  } = useDocusaurusContext();

  const API_URL = customFields.BACKEND_URL || 'http://localhost:8000';

  if (!user) {
    history.push("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    history.push("/login");
  };

  const handleUpdate = async () => {
    if (!isEditing) {
      // User clicks 'Edit Profile' button
      setIsEditing(true);
      return;
    }

    // User clicks 'Save Changes' button
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) throw new Error("No access token");

      // Send update request to backend
      const response = await axios.put(
        `${API_URL}/users/me`,
        {
          name,
          email,
          software_experience: softwareExp,
          hardware_experience: hardwareExp,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const updatedUser = response.data;

      // Update state & localStorage
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Profile updated successfully!");
      setIsEditing(false); // Exit edit mode after successful update
    } catch (err) {
      console.error(err);
      alert("Failed to update profile. Try again.");
    }
  };
 
  // Function to get initials (kept for completeness, though not used in the UI)
  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('').toUpperCase();
    return initials.substring(0, 2);
  };


  return (
    <Layout title="Dashboard" description="Make changes to your account">
    <div className="auth-login-container">
      <div className="auth-card">
        <div className="auth-card-content">
          <div className="auth-header">
            <h2 className="auth-title">Your Profile</h2>
            <p className="auth-subtitle">Update your account details</p>
          </div>

          <div className="auth-form">
            <div className="auth-form-group">
              {/* Name */}
              <div className="auth-input-field">
                <label htmlFor="name">Name</label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={!isEditing} // Disabled when not editing
                />
              </div>

              {/* Email */}
              <div className="auth-input-field">
                <label htmlFor="email">Email</label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={!isEditing} // Disabled when not editing
                />
              </div>

              {/* Software Experience */}
              <div className="auth-input-field">
                <label htmlFor="software">Software Experience</label>
                <select
                  id="software"
                  value={softwareExp}
                  onChange={(e) => setSoftwareExp(e.target.value)}
                  className="auth-select-field" // Added class for styling
                  disabled={!isEditing} // Disabled when not editing
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Hardware Experience */}
              <div className="auth-input-field">
                <label htmlFor="hardware">Hardware Experience</label>
                <select
                  id="hardware"
                  value={hardwareExp}
                  onChange={(e) => setHardwareExp(e.target.value)}
                  className="auth-select-field" // Added class for styling
                  disabled={!isEditing} // Disabled when not editing
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Update/Edit Button */}
            <div className="auth-button-wrapper" style={{ marginTop: "1rem" }}>
              <button onClick={handleUpdate}>
                {isEditing ? "Save Changes" : "Edit Profile"}
              </button>
            </div>

            {/* Logout Button */}
            <div className="auth-button-wrapper" style={{ marginTop: "0.75rem" }}>
              <button
                style={{ background: "var(--auth-error)" }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
      </Layout>
  );
}