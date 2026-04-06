export async function getSetupStatus(): Promise<{ needsSetup: boolean }> {
  // Direct fetch, not api wrapper (setup runs before auth)
  const res = await fetch('/api/setup/status');
  return res.json();
}

export async function initSetup(data: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}) {
  const res = await fetch('/api/setup/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Setup failed');
  }
  return res.json();
}
