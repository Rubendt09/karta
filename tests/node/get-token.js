const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/api/v1';
const EMAIL = process.env.EMAIL || 'admin@karta.test';
const PASSWORD = process.env.PASSWORD || 'KartaTest2024!';

async function getToken() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Error desconocido');
    console.error(`Login failed: HTTP ${res.status} ${text}`);
    process.exit(1);
  }

  const data = await res.json();
  const token = data.token || data.accessToken || data.data?.token;

  if (!token) {
    console.error('No token found in response:', JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log(token);
}

getToken();
