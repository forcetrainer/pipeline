import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { Input, Button, Card } from '../components/ui';
import { initSetup } from '../services/setupService';

function SetupPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function validatePasswords(pw: string, confirm: string) {
    if (confirm && pw !== confirm) {
      setPasswordError('Passwords do not match');
    } else if (pw && pw.length < 8) {
      setPasswordError('Password must be at least 8 characters');
    } else {
      setPasswordError('');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('All fields are required');
      return;
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await initSetup({
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
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
      <div style={{ width: '100%', maxWidth: 480 }} className="page-enter">
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
            Welcome to Pipeline
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              color: 'var(--nx-text-tertiary)',
              textAlign: 'center',
            }}
          >
            Let's set up your admin account to get started
          </p>
        </div>

        {/* Setup Card */}
        <Card padding="lg">
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(0, 255, 136)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 600,
                  color: 'var(--nx-text-primary)',
                  marginBottom: '0.5rem',
                }}
              >
                Admin Account Created
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--nx-text-tertiary)',
                }}
              >
                Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <>
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
                Create Admin Account
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <Input
                        label="First Name"
                        type="text"
                        placeholder="Jane"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          setError('');
                        }}
                        disabled={isLoading}
                        autoComplete="given-name"
                        autoFocus
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Input
                        label="Last Name"
                        type="text"
                        placeholder="Smith"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          setError('');
                        }}
                        disabled={isLoading}
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
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
                      setError('');
                      validatePasswords(e.target.value, confirmPassword);
                    }}
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
                      setError('');
                      validatePasswords(password, e.target.value);
                    }}
                    error={passwordError}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />

                  {error && (
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
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    isLoading={isLoading}
                    disabled={isLoading || !!passwordError}
                    className="w-full"
                    style={{ marginTop: '0.5rem' }}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Admin Account'}
                  </Button>
                </div>
              </form>
            </>
          )}
        </Card>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-xs)',
            color: 'var(--nx-text-ghost)',
            textAlign: 'center',
            marginTop: '1.5rem',
          }}
        >
          This setup is only available when no users exist
        </p>
      </div>
    </div>
  );
}

export default SetupPage;
