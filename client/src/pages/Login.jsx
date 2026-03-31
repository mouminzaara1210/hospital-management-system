import { useState } from 'react';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // ❌ If backend fails → use DEMO LOGIN
      if (!res.ok) {
        console.log("Using DEMO login");

        let role = 'Doctor';

        if (email === 'admin@hms.com') {
          role = 'Super Admin';
        } else if (email === 'doctor@hms.com') {
          role = 'Doctor';
        }

        const demoUser = { email, role };

        login(demoUser, 'demo-token');

        // 🔥 STORE ROLE (IMPORTANT)
        localStorage.setItem('role', role);

        if (role === 'Super Admin') navigate('/admin');
        else if (role === 'Doctor') navigate('/doctor');

        return;
      }

      // ✅ REAL LOGIN
      login(data.user, data.accessToken);

      // 🔥 STORE ROLE
      localStorage.setItem('role', data.user.role);

      const roleRoutes = {
        'Super Admin': '/admin',
        'Doctor': '/doctor',
        'Patient': '/patient',
        'Receptionist': '/staff',
        'Nurse': '/staff',
      };

      navigate(roleRoutes[data.user.role] || '/login');

    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        
        <div className="flex flex-col items-center justify-center">
          <Activity className="h-12 w-12 text-medical-blue mb-4" />
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Apollo HMS
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your portal
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          
          <input
            type="email"
            required
            placeholder="Email (admin@hms.com / doctor@hms.com)"
            className="w-full px-4 py-3 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            required
            placeholder="Password"
            className="w-full px-4 py-3 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}