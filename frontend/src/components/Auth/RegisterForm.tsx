import React, { useState } from 'react';
import { useHistory } from '@docusaurus/router'; 
import Link from '@docusaurus/Link'; 
import { useAuth } from '../../contexts/AuthContext';
import Input from '../UI/Input';
import Button from '../UI/Button';
import LoadingSkeleton from '../UI/LoadingSkeleton';
import './RegisterForm.css';
import Layout from '@theme/Layout'; 


interface FormData {
  step1: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  step2: {
    softwareExperience: string;
    hardwareExperience: string;
  };
  currentStep: number;
}

const RegisterForm: React.FC = () => {
  const { login, register } = useAuth();
  const history = useHistory(); 
  const [formData, setFormData] = useState<FormData>({
    step1: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    step2: {
      softwareExperience: '',
      hardwareExperience: ''
    },
    currentStep: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState([
    { text: 'At least 8 characters', met: false },
    { text: 'Contains uppercase letter', met: false },
    { text: 'Contains lowercase letter', met: false },
    { text: 'Contains number', met: false },
   
  ]);

  // Experience options
  const experienceOptions = [
    { value: 'beginner', label: 'Beginner (0–1 years)' },
    { value: 'intermediate', label: 'Intermediate (2–5 years)' },
    { value: 'advanced', label: 'Advanced (5+ years)' }
  ];
  

  // Handle input changes
  const handleInputChange = (section: keyof FormData, field: string, value: string) => {
    // Skip if section is currentStep
    if (section === 'currentStep') return;
  
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, any>), 
        [field]: value
      }
    }));
  
    
    if (section === 'step1' && field === 'password') {
      calculatePasswordStrength(value);
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    const requirements = [
      { text: 'At least 8 characters', met: password.length >= 8 },
      { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { text: 'Contains lowercase letter', met: /[a-z]/.test(password) },
      { text: 'Contains number', met: /\d/.test(password) },
    ];

    setPasswordRequirements(requirements);

    const metCount = requirements.filter(req => req.met).length;
    setPasswordStrength(metCount);
  };

  // Handle form navigation
  const goToNextStep = () => {
    setFormData(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1
    }));
  };

  const goToPrevStep = () => {
    setFormData(prev => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      await register({
        name: formData.step1.name,
        email: formData.step1.email,
        password: formData.step1.password,
  
        // ✅ BACKEND EXPECTS SNAKE_CASE
        software_experience: formData.step2.softwareExperience,
        hardware_experience: formData.step2.hardwareExperience
      });
  
      // ✅ AUTO LOGIN (same as working page)
      await login(formData.step1.email, formData.step1.password);
  
      history.push('/login');
  
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  

  // Validate step 1
  const isStep1Valid = () => {
    const { name, email, password, confirmPassword } = formData.step1;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return (
      name.trim().length >= 2 &&
      emailRegex.test(email) &&
      password.length >= 8 &&
      password === confirmPassword &&
      passwordRequirements.every(req => req.met)
    );
  };

  // Validate step 2
  const isStep2Valid = () => {
    const { softwareExperience, hardwareExperience } = formData.step2;
    return softwareExperience && hardwareExperience;
  };

  // Render step 1 (Basic Info)
  const renderStep1 = () => (
    <div className="auth-register-step">
      <h2 className="auth-register-step-title">Create Account</h2>
      <p className="auth-register-step-subtitle">Tell us about yourself</p>

      <div className="auth-form-group">
        <Input
          label="Full Name"
          id="name"
          type="text"
          value={formData.step1.name}
          onChange={(e) => handleInputChange('step1', 'name', e.target.value)}
          required
        />

        <Input
          label="Email"
          id="email"
          type="email"
          value={formData.step1.email}
          onChange={(e) => handleInputChange('step1', 'email', e.target.value)}
          required
        />

        <Input
          label="Password"
          id="password"
          type="password"
          value={formData.step1.password}
          onChange={(e) => handleInputChange('step1', 'password', e.target.value)}
          required
        />

        <Input
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          value={formData.step1.confirmPassword}
          onChange={(e) => handleInputChange('step1', 'confirmPassword', e.target.value)}
          required
        />

        {/* Password Strength Indicator */}
        <div className="auth-password-strength">
          <div className="auth-password-strength-bar">
            <div
              className={`auth-password-strength-fill auth-password-strength-${passwordStrength}`}
              style={{ width: `${(passwordStrength / 5) * 100}%` }}
            ></div>
          </div>
          <div className="auth-password-requirements">
            {passwordRequirements.map((req, index) => (
              <div key={index} className={`auth-password-req ${req.met ? 'met' : ''}`}>
                {req.met ? '✓' : '○'} {req.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-actions">
        <Button
          variant="primary"
          onClick={goToNextStep}
          disabled={!isStep1Valid()}
        >
          Next: Experience Levels
        </Button>
      </div>
    </div>
  );

  // Render step 2 (Experience Levels)
  const renderStep2 = () => (
    <div className="auth-register-step">
      <h2 className="auth-register-step-title">Your Experience</h2>
      <p className="auth-register-step-subtitle">Help us tailor your experience</p>

      <div className="auth-form-group">
        <label htmlFor="softwareExperience" className="auth-select-label">
          Software Experience Level
        </label>
        <select
          id="softwareExperience"
          value={formData.step2.softwareExperience}
          onChange={(e) => handleInputChange('step2', 'softwareExperience', e.target.value)}
          className="auth-select"
        >
          <option value="">Select your software experience</option>
          {experienceOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label htmlFor="hardwareExperience" className="auth-select-label">
          Hardware Experience Level
        </label>
        <select
          id="hardwareExperience"
          value={formData.step2.hardwareExperience}
          onChange={(e) => handleInputChange('step2', 'hardwareExperience', e.target.value)}
          className="auth-select"
        >
          <option value="">Select your hardware experience</option>
          {experienceOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="auth-form-actions">
        <Button variant="secondary" onClick={goToPrevStep}>
          Previous
        </Button>
        <Button
          variant="primary"
          onClick={goToNextStep}
          disabled={!isStep2Valid()}
        >
          Next: Review
        </Button>
      </div>
    </div>
  );

  // Render step 3 (Review)
  const renderStep3 = () => (
    <div className="auth-register-step">
      <h2 className="auth-register-step-title">Review Information</h2>
      <p className="auth-register-step-subtitle">Confirm your details before submitting</p>

      <div className="auth-review-summary">
        <div className="auth-review-section">
          <h3>Personal Information</h3>
          <p><strong>Name:</strong> {formData.step1.name}</p>
          <p><strong>Email:</strong> {formData.step1.email}</p>
        </div>

        <div className="auth-review-section">
          <h3>Experience Levels</h3>
          <p><strong>Software:</strong> {experienceOptions.find(o => o.value === formData.step2.softwareExperience)?.label || 'Not selected'}</p>
          <p><strong>Hardware:</strong> {experienceOptions.find(o => o.value === formData.step2.hardwareExperience)?.label || 'Not selected'}</p>
        </div>
      </div>

      <div className="auth-form-actions">
        <Button variant="secondary" onClick={goToPrevStep}>
          Previous
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={loading}
        >
          Create Account
        </Button>
      </div>
    </div>
  );

  // Render progress indicator
  const renderProgressIndicator = () => (
    <div className="auth-progress-indicator">
      {[1, 2, 3].map(step => (
        <div
          key={step}
          className={`auth-progress-step ${step === formData.currentStep ? 'active' : ''} ${step < formData.currentStep ? 'completed' : ''}`}
          onClick={() => step < formData.currentStep && setFormData(prev => ({ ...prev, currentStep: step }))}
        >
          <div className="auth-progress-step-number">{step}</div>
          <div className="auth-progress-step-label">
            {step === 1 && 'Basic Info'}
            {step === 2 && 'Experience'}
            {step === 3 && 'Review'}
          </div>
          {step < 3 && <div className="auth-progress-step-separator"></div>}
        </div>
      ))}
    </div>
  );

  return (
    <Layout title="Register" description="Create a new account">

    <div className="auth-register-form">
      {renderProgressIndicator()}

      {error && (
        <div className="auth-error-message">
          {error}
        </div>
      )}

      {formData.currentStep === 1 && renderStep1()}
      {formData.currentStep === 2 && renderStep2()}
      {formData.currentStep === 3 && renderStep3()}

      <div className="auth-register-footer">
        <p>
          Already have an account?{' '}
          <Link to="/login" className="auth-link"> {/* ✅ Changed from <a> */}
            Login
          </Link>
        </p>
      </div>
    </div>
    </Layout>

  );
};

export default RegisterForm;