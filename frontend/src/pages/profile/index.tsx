import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useHistory } from "@docusaurus/router";
import Input from '../../components/UI/Input';
import axios from 'axios';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from '@theme/Layout';
import { motion } from 'framer-motion';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const history = useHistory();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [softwareExp, setSoftwareExp] = useState(user?.software_experience || "intermediate");
  const [hardwareExp, setHardwareExp] = useState(user?.hardware_experience || "intermediate");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
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
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSaveSuccess(true);
      setIsEditing(false);

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setSoftwareExp(user?.software_experience || "intermediate");
    setHardwareExp(user?.hardware_experience || "intermediate");
    setIsEditing(false);
    setError(null);
  };

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('').toUpperCase();
    return initials.substring(0, 2);
  };

  return (
    <Layout title="Profile" description="Manage your account settings">
      <div className={styles.profilePage}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={styles.profileContainer}
        >
          {/* Profile Header */}
          <div className={styles.profileHeader}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                {getUserInitials(user?.name || '')}
              </div>
              <div className={styles.userInfo}>
                <h1 className={styles.userName}>{user?.name}</h1>
                <p className={styles.userEmail}>{user?.email}</p>
                {user?.created_at && (
                  <p className={styles.memberSince}>
                    Member since {new Date(user.created_at).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                )}
              </div>
            </div>
            <div className={styles.headerActions}>
              {!isEditing ? (
                <button 
                  className={styles.editButton}
                  onClick={() => setIsEditing(true)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M11.334 2.00004C11.5091 1.82494 11.7169 1.68605 11.9457 1.59129C12.1745 1.49653 12.4197 1.44775 12.6673 1.44775C12.9149 1.44775 13.1601 1.49653 13.3889 1.59129C13.6177 1.68605 13.8256 1.82494 14.0007 2.00004C14.1757 2.17513 14.3146 2.383 14.4094 2.61178C14.5042 2.84055 14.5529 3.08575 14.5529 3.33337C14.5529 3.58099 14.5042 3.82619 14.4094 4.05497C14.3146 4.28374 14.1757 4.49161 14.0007 4.66671L5.00065 13.6667L1.33398 14.6667L2.33398 11L11.334 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <button 
                  className={styles.cancelButton}
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Success/Error Messages */}
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.successMessage}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Profile updated successfully!
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.errorMessage}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {error}
            </motion.div>
          )}

          {/* Profile Form */}
          <div className={styles.profileCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Profile Information</h2>
              <p className={styles.cardSubtitle}>Update your personal details and experience level</p>
            </div>

            <div className={styles.formGrid}>
              {/* Name Field */}
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>Full Name</label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={!isEditing}
                  className={styles.input}
                />
              </div>

              {/* Email Field */}
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email Address</label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={!isEditing}
                  className={styles.input}
                />
              </div>

              {/* Software Experience */}
              <div className={styles.formGroup}>
                <label htmlFor="software" className={styles.label}>Software Experience</label>
                <select
                  id="software"
                  value={softwareExp}
                  onChange={(e) => setSoftwareExp(e.target.value)}
                  disabled={!isEditing}
                  className={styles.select}
                >
                  <option value="beginner">Beginner (0-1 years)</option>
                  <option value="intermediate">Intermediate (2-5 years)</option>
                  <option value="advanced">Advanced (5-10 years)</option>
                  <option value="expert">Expert (10+ years)</option>
                </select>
              </div>

              {/* Hardware Experience */}
              <div className={styles.formGroup}>
                <label htmlFor="hardware" className={styles.label}>Hardware Experience</label>
                <select
                  id="hardware"
                  value={hardwareExp}
                  onChange={(e) => setHardwareExp(e.target.value)}
                  disabled={!isEditing}
                  className={styles.select}
                >
                  <option value="beginner">Beginner (0-1 years)</option>
                  <option value="intermediate">Intermediate (2-5 years)</option>
                  <option value="advanced">Advanced (5-10 years)</option>
                  <option value="expert">Expert (10+ years)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={handleUpdate}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className={styles.spinner}></span>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className={styles.dangerZone}>
            <div className={styles.dangerHeader}>
              <h3 className={styles.dangerTitle}>Danger Zone</h3>
              <p className={styles.dangerSubtitle}>Irreversible actions for your account</p>
            </div>
            <button
              className={styles.logoutButton}
              onClick={handleLogout}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H7M14 15L19 10M19 10L14 5M19 10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Logout from Account
            </button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}