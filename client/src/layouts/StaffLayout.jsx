import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Activity, Beaker, ClipboardList, BedDouble, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function StaffLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-medical-blue text-white flex flex-col">
        <div className="p-4 border-b border-blue-800 flex items-center space-x-2">
          <Activity className="h-8 w-8 text-teal-400" />
          <span className="text-xl font-bold tracking-tight">Staff Portal</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {user?.role === 'Receptionist' && (
            <Link to="/staff/reception" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-800 transition-colors bg-blue-800">
              <ClipboardList className="h-5 w-5" />
              <span>OPD Queue</span>
            </Link>
          )}
          {user?.role === 'Nurse' && (
             <>
               <Link to="/staff/ward" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-800 transition-colors bg-blue-800">
                 <BedDouble className="h-5 w-5" />
                 <span>Ward View</span>
               </Link>
               <Link to="/staff/labs" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-800 transition-colors">
                 <Beaker className="h-5 w-5" />
                 <span>Lab Orders</span>
               </Link>
             </>
          )}
        </nav>

        <div className="p-4 border-t border-blue-800">
          <p className="text-sm font-medium text-blue-200 mb-2 truncate">Staff: {user?.email}</p>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 transition-colors w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">Hospital Operations</h1>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gray-100">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
