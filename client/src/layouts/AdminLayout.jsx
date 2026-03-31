import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Activity, Users, Settings, LogOut, BedDouble, Bell, Search, User } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-medical-blue text-white flex flex-col">
        <div className="p-4 border-b border-blue-800 flex items-center space-x-2">
          <Activity className="h-8 w-8 text-teal-400" />
          <span className="text-xl font-bold tracking-tight">Apollo HMS</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-800 transition-colors bg-blue-800">
            <Activity className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/staff" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-800 transition-colors">
            <Users className="h-5 w-5" />
            <span>Staff Directory</span>
          </Link>
          <Link to="/admin/beds" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-800 transition-colors">
            <BedDouble className="h-5 w-5" />
            <span>Bed Management</span>
          </Link>
          <Link to="/admin/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-800 transition-colors">
            <Settings className="h-5 w-5" />
            <span>System Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-blue-800">
          <div className="mb-4">
            <p className="text-sm font-medium text-blue-200">Logged in as:</p>
            <p className="text-sm border-b border-blue-700 pb-2">{user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 transition-colors w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm" role="banner">
          <div className="flex items-center gap-4 flex-1">
             <div className="relative w-full max-w-md hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search patients, staff or records..." 
                  aria-label="Global search"
                  className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-primary-500 focus:bg-white transition-all"
                />
             </div>
          </div>

          <div className="flex items-center space-x-5">
            <button 
              className="relative p-2 text-neutral-500 hover:bg-neutral-50 rounded-full transition-colors"
              aria-label="View 3 unread notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" aria-hidden="true"></span>
            </button>

            <Link 
              to="/admin/profile" 
              className="flex items-center gap-3 pl-4 border-l border-neutral-200 group"
              aria-label="Viewing your profile"
            >
               <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">{user?.email?.split('@')[0]}</p>
                  <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-tight">Administrator</p>
               </div>
               <div className="h-9 w-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold border border-primary-200 group-hover:border-primary-400 transition-colors shadow-inner">
                 {user?.email?.[0]?.toUpperCase() || <User size={18} />}
               </div>
            </Link>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
