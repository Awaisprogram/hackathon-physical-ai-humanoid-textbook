import React, { useState } from 'react';
import { useHistory } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../UI/Input';
import Button from '../UI/Button';
import './LoginForm.css';

const LoginForm: React.FC = () => {
  const { login, user } = useAuth();
  const history = useHistory();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      history.push('/docs');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    history.push('/');
    return null;
  }

  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(formData.email) && formData.password.length > 0;
  };

  return (
    <Layout title="Login" description="Sign in to your account">
      <div className="auth-login-container">
        <div className="auth-card">
          <div className="auth-card-content">
            <div className="auth-header">
              <h1 className="auth-title">Sign in to your account</h1>
              <p className="auth-subtitle">Enter your credentials to continue</p>
            </div>

            {error && (
              <div className="auth-error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-form-group">
                <div className="auth-input-field">
                  <Input
                    label="Email address"
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      handleInputChange('email', e.target.value)
                    }
                    required
                  />
                </div>

                <div className="auth-input-field">
                  <Input
                    label="Password"
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    required
                  />
                </div>

                <div className="auth-checkbox-group">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) =>
                        handleInputChange('rememberMe', e.target.checked)
                      }
                      className="auth-checkbox"
                    />
                    <span className="auth-checkbox-text">
                      Remember me for 7 days
                    </span>
                  </label>
                </div>

                <div className="auth-button-wrapper">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                    disabled={!isFormValid() || loading}
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </div>
              </div>
            </form>

            <div className="auth-login-footer">
              <p className="auth-signup-link">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="auth-link">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginForm;
