import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';
import { Input, Button } from '../components/ui';
import { Card } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { AUTH_CONFIG } from '../types';

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loginError, setLoginError] = useState('');
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

  function handleEmailChange(value: string) {
    setEmail(value);
    setLoginError('');
    validateEmail(value);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoginError('');

    if (!email || !password) {
      setLoginError('Please enter both email and password');
      return;
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (domain !== AUTH_CONFIG.allowedDomain) {
      setEmailError(`Email must be from @${AUTH_CONFIG.allowedDomain}`);
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
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
            rgba(0, 212, 255, 0.025) 59px,
            rgba(0, 212, 255, 0.025) 60px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 59px,
            rgba(0, 212, 255, 0.025) 59px,
            rgba(0, 212, 255, 0.025) 60px
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
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              marginBottom: '1rem',
              boxShadow: 'var(--nx-glow-cyan)',
            }}
          >
            <Lightbulb size={28} style={{ color: 'var(--nx-cyan-base)' }} />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: 'var(--nx-cyan-base)',
              textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '0.25rem',
            }}
          >
            AI Use Cases
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              color: 'var(--nx-text-tertiary)',
            }}
          >
            & Prompt Library
          </p>
        </div>

        {/* Login Card */}
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
            Sign In
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="Email"
                type="email"
                placeholder={`you@${AUTH_CONFIG.allowedDomain}`}
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => validateEmail(email)}
                error={emailError}
                disabled={isLoading}
                autoComplete="email"
                autoFocus
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError('');
                }}
                disabled={isLoading}
                autoComplete="current-password"
              />

              {loginError && (
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
                  {loginError}
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
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-xs)',
              color: 'var(--nx-text-ghost)',
              textAlign: 'center',
              marginTop: '1.5rem',
            }}
          >
            Use your @{AUTH_CONFIG.allowedDomain} email to sign in
          </p>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
