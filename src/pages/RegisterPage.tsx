import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { Input, Button } from '../components/ui';
import { Card } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { AUTH_CONFIG } from '../types';
import { register } from '../services/authService';

function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  function validateEmail(value: string): boolean {
    if (!value) {
      setEmailError('');
      return false;
    }
    const domain = value.split('@')[1]?.toLowerCase();
    if (value.includes('@') && domain !== AUTH_CONFIG.allowedDomain) {
      setEmailError(`Email must be from @${AUTH_CONFIG.allowedDomain}`);
      return false;
    }
    setEmailError('');
    return true;
  }

  function validatePassword(value: string): boolean {
    if (!value) {
      setPasswordError('');
      return false;
    }
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  }

  function validateConfirmPassword(value: string): boolean {
    if (!value) {
      setConfirmError('');
      return false;
    }
    if (value !== password) {
      setConfirmError('Passwords do not match');
      return false;
    }
    setConfirmError('');
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!firstName.trim() || !lastName.trim() || !email || !password || !confirmPassword) {
      setFormError('All fields are required');
      return;
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (domain !== AUTH_CONFIG.allowedDomain) {
      setEmailError(`Email must be from @${AUTH_CONFIG.allowedDomain}`);
      return;
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });
      setSuccessMessage('Account created! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--nx-void-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 59px,
            var(--nx-grid-line) 59px,
            var(--nx-grid-line) 60px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 59px,
            var(--nx-grid-line) 59px,
            var(--nx-grid-line) 60px
          )
        `,
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }} className="page-enter">
        {/* Branding */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--nx-cyan-aura)',
              border: '1px solid var(--color-border-strong)',
              marginBottom: '1rem',
              boxShadow: 'var(--nx-glow-cyan)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="7" y1="16" x2="12" y2="16" stroke="var(--nx-cyan-base)" strokeWidth="2" strokeLinecap="round"/>
              <line x1="20" y1="16" x2="25" y2="16" stroke="var(--nx-cyan-base)" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="10.5,13.5 13,16 10.5,18.5" fill="none" stroke="var(--nx-cyan-base)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
              <polyline points="23.5,13.5 26,16 23.5,18.5" fill="none" stroke="var(--nx-cyan-base)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
              <circle cx="4" cy="16" r="3" fill="rgba(0,212,255,0.2)" stroke="var(--nx-cyan-base)" strokeWidth="1.5"/>
              <circle cx="16" cy="16" r="3.5" fill="rgba(0,212,255,0.25)" stroke="var(--nx-cyan-base)" strokeWidth="1.5"/>
              <circle cx="28" cy="16" r="3" fill="rgba(0,212,255,0.2)" stroke="var(--nx-cyan-base)" strokeWidth="1.5"/>
            </svg>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: 'var(--nx-cyan-base)',
              textShadow: '0 0 20px var(--nx-cyan-glow)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '0.25rem',
            }}
          >
            Pipeline
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              color: 'var(--nx-text-tertiary)',
            }}
          >
            From Idea to Impact
          </p>
        </div>

        {/* Register Card */}
        <Card padding="lg">
          <h2
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              color: 'var(--nx-text-primary)',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            Create Account
          </h2>

          {successMessage ? (
            <p
              role="status"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--nx-green-base, #00ff88)',
                textAlign: 'center',
                padding: '0.75rem',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
              }}
            >
              {successMessage}
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="First Name"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setFormError('');
                    }}
                    disabled={isLoading}
                    autoComplete="given-name"
                    autoFocus
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setFormError('');
                    }}
                    disabled={isLoading}
                    autoComplete="family-name"
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  placeholder={`you@${AUTH_CONFIG.allowedDomain}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormError('');
                    validateEmail(e.target.value);
                  }}
                  onBlur={() => validateEmail(email)}
                  error={emailError}
                  disabled={isLoading}
                  autoComplete="email"
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormError('');
                    if (e.target.value) validatePassword(e.target.value);
                    if (confirmPassword) validateConfirmPassword(confirmPassword);
                  }}
                  onBlur={() => validatePassword(password)}
                  error={passwordError}
                  disabled={isLoading}
                  autoComplete="new-password"
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setFormError('');
                    if (e.target.value) validateConfirmPassword(e.target.value);
                  }}
                  onBlur={() => validateConfirmPassword(confirmPassword)}
                  error={confirmError}
                  disabled={isLoading}
                  autoComplete="new-password"
                />

                {formError && (
                  <p
                    role="alert"
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--nx-red-base)',
                      textAlign: 'center',
                      padding: '0.5rem',
                      backgroundColor: 'var(--nx-red-aura)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(255, 51, 102, 0.2)',
                    }}
                  >
                    {formError}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="w-full"
                  style={{ marginTop: '0.5rem' }}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          )}

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              color: 'var(--nx-text-tertiary)',
              textAlign: 'center',
              marginTop: '1.5rem',
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--nx-cyan-base)',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default RegisterPage;
