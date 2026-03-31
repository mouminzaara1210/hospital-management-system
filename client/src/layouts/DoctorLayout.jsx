import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Activity, Calendar, FileText, Bot, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function DoctorLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col shadow-sm">
        <div className="p-4 border-b flex items-center space-x-2">
          <Activity className="h-8 w-8 text-medical-blue" />
          <span className="text-xl font-heading font-bold tracking-tight text-gray-800">Doctor Portal</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/doctor" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-medical-blue font-medium bg-gray-50">
            <Calendar className="h-5 w-5" />
            <span>Appointments</span>
          </Link>
          <Link to="/doctor/patients" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
            <FileText className="h-5 w-5 text-gray-500" />
            <span>My Patients</span>
          </Link>
          <Link to="/doctor/ai-assist" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
            <Bot className="h-5 w-5 text-soft-teal" />
            <span>AI Assist</span>
          </Link>
        </nav>

        <div className="p-4 border-t">
          <p className="text-sm font-medium text-gray-500 mb-2 truncate">{user?.email}</p>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-alert-red transition-colors w-full text-left font-medium"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
          <h1 className="text-2xl font-semibold font-heading text-gray-800">Overview</h1>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
