import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "@docusaurus/router";
import "./Dashboard.css";
import Input from "../components/UI/Input";
import axios from "axios";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Button from "../components/UI/Button";

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const history = useHistory();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [softwareExp, setSoftwareExp] = useState(
    user?.software_experience || "intermediate"
  );
  const [hardwareExp, setHardwareExp] = useState(
    user?.hardware_experience || "intermediate"
  );

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    siteConfig: { customFields },
  } = useDocusaurusContext();

  const API_URL = 'https://textbook-backend.vercel.app';

  if (!user) {
    history.push("/login");
    return null;
  }

  const handleLogout = async () => {
    try {
      setLoading(true);
      logout();
      history.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    try {
      setLoading(true);

      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) throw new Error("No access token");

      const response = await axios.put(
        `${API_URL}/users/me`,
        {
          name,
          email,
          software_experience: softwareExp,
          hardware_experience: hardwareExp,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const updatedUser = response.data;

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile. Try again.");
    } finally {
      setLoading(false);
    }
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
                    disabled={!isEditing || loading}
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
                    disabled={!isEditing || loading}
                  />
                </div>

                {/* Software Experience */}
                <div className="auth-input-field">
                  <label htmlFor="software">Software Experience</label>
                  <select
                    id="software"
                    value={softwareExp}
                    onChange={(e) => setSoftwareExp(e.target.value)}
                    className="auth-select-field"
                    disabled={!isEditing || loading}
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
                    className="auth-select-field"
                    disabled={!isEditing || loading}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Edit / Save Button */}
              <div className="auth-button-wrapper" style={{ marginTop: "1rem" }}>
                <Button onClick={handleUpdate} disabled={loading}>
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Save Changes"
                    : "Edit Profile"}
                </Button>
              </div>

              {/* Logout Button */}
              <div
                className="auth-button-wrapper"
                style={{ marginTop: "0.75rem" }}
              >
                <Button
                  style={{ background: "var(--auth-error)" }}
                  onClick={handleLogout}
                  disabled={loading}
                >
                  {loading ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
