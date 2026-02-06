import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

function AppLayout() {
  const location = useLocation();

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--nx-void-base)' }}
    >
      <Sidebar />
      <main
        className="lg:ml-64 min-h-screen"
        style={{
          backgroundColor: 'var(--nx-void-base)',
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
        <div key={location.pathname} className="max-w-6xl mx-auto px-6 py-8 lg:px-8 lg:py-10 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export { AppLayout };
