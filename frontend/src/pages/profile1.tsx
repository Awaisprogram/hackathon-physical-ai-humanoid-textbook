import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import LoadingSkeleton from '../components/UI/LoadingSkeleton';
import './Profile.css';
import { useHistory } from "@docusaurus/router";
import axios from 'axios';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from '@theme/Layout';

interface ProfileFormData {
  name: string;
  email: string;
  softwareExperience: string;
  hardwareExperience: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    softwareExperience: '',
    hardwareExperience: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, logout, setUser, isLoading, updateUserProfile } = useAuth();
  const history = useHistory();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [softwareExp, setSoftwareExp] = useState(user?.software_experience || "intermediate");
  const [hardwareExp, setHardwareExp] = useState(user?.hardware_experience || "intermediate");
  const [password, setPassword] = useState(user?.password || "");

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
    } catch (err) {
      console.error(err);
      alert("Failed to update profile. Try again.");
    }
  };

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        softwareExperience: user.softwareExperience || '',
        hardwareExperience: user.hardwareExperience || '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  // Handle input changes
  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // Prepare update data (only include changed fields)
      const updateData: any = {};

      if (formData.name !== user?.name) updateData.name = formData.name;
      if (formData.email !== user?.email) updateData.email = formData.email;
      if (formData.softwareExperience !== user?.softwareExperience) updateData.softwareExperience = formData.softwareExperience;
      if (formData.hardwareExperience !== user?.hardwareExperience) updateData.hardwareExperience = formData.hardwareExperience;

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match');
          return;
        }
        updateData.password = formData.newPassword;
      }

      // Call the update profile function from context
      const result = await updateUserProfile(updateData);

      if (result.success) {
        setSaveSuccess(true);
        setIsEditing(false);

        // Hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred while updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel editing
  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        softwareExperience: user.softwareExperience || '',
        hardwareExperience: user.hardwareExperience || '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setIsEditing(false);
    setError(null);
  };

  // Calculate user initials
  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('').toUpperCase();
    return initials.substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="auth-profile-page">
        <div className="auth-profile-header">
          <LoadingSkeleton type="circle" width={80} height={80} />
          <div>
            <LoadingSkeleton type="text" width={200} height={32} />
            <LoadingSkeleton type="text" width={150} height={20} />
          </div>
        </div>
        <div className="auth-profile-content">
          <LoadingSkeleton type="card" height={400} />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-profile-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="auth-profile-content"
      >
        <div className="auth-profile-header">
          <div className="auth-profile-avatar">
            {user?.initials || getUserInitials(user?.name || '')}
          </div>
          <div className="auth-profile-info">
            <h1 className="auth-profile-name">{user?.name}</h1>
            <p className="auth-profile-email">{user?.email}</p>
            <p className="auth-profile-member-since">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>

        <div className="auth-profile-section">
          <div className="auth-profile-section-header">
            <h2 className="auth-profile-section-title">Profile Information</h2>
            {!isEditing && (
              <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="auth-profile-form">
            {saveSuccess && (
              <div className="auth-success-message">
                Profile updated successfully!
              </div>
            )}

            {error && (
              <div className="auth-error-message">
                {error}
              </div>
            )}

            <div className="auth-profile-form-grid">
              <div className="auth-form-group">
                <Input
                  label="Full Name"
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  required
                />

                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                  required
                />

                <label htmlFor="softwareExperience" className="auth-select-label">
                  Software Experience Level
                </label>
                <select
                  id="software"
                  value={softwareExp}
                  onChange={(e) => setSoftwareExp(e.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>

                <label htmlFor="hardwareExperience" className="auth-select-label">
                  Hardware Experience Level
                </label>
                <select
                  id="hardware"
                  value={hardwareExp}
                  onChange={(e) => setHardwareExp(e.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {isEditing && (
                <div className="auth-form-group">
                  <h3 className="auth-form-group-title">Change Password</h3>
                  <Input
                    label="New Password"
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Leave blank to keep current password"
                  />

                  <Input
                    label="Confirm New Password"
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your new password"
                  />
                </div>
              )}
            </div>

            {isEditing && (
              <div className="auth-profile-form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={handleUpdate}
                  variant="primary"
                  loading={isSaving}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </form>
        </div>

       
        
      </motion.div>
    </div>
  );
};

export default ProfilePage;