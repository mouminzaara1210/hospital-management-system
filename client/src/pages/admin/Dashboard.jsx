import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Activity, DollarSign, Users, BedDouble } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchSnapshot();
  }, []);

  const fetchSnapshot = async () => {
    try {
      const res = await api.get('/analytics/snapshot');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading Hospital Command Centre...</div>;
  if (!data) return <div className="p-8 text-red-500">Failed to load analytics dashboard.</div>;

  return (
    <div className="space-y-6">
      <div className="mb-8 pl-1 border-l-4 border-medical-blue">
         <h1 className="text-3xl font-bold font-heading text-gray-900">Hospital Command Centre</h1>
         <p className="text-gray-500 mt-1">Live analytics and operational snapshot.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="bg-blue-100 p-4 rounded-lg mr-4">
               <Activity className="w-6 h-6 text-medical-blue" />
            </div>
            <div>
               <p className="text-sm font-medium text-gray-500">Today's Appointments</p>
               <h3 className="text-2xl font-bold text-gray-900">{data.appointmentsToday}</h3>
            </div>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="bg-teal-100 p-4 rounded-lg mr-4">
               <BedDouble className="w-6 h-6 text-soft-teal" />
            </div>
            <div>
               <p className="text-sm font-medium text-gray-500">Bed Utilization</p>
               <h3 className="text-2xl font-bold text-gray-900">{data.bedUtilization}%</h3>
            </div>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="bg-indigo-100 p-4 rounded-lg mr-4">
               <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
               <p className="text-sm font-medium text-gray-500">Doctors Active</p>
               <h3 className="text-2xl font-bold text-gray-900">{data.doctors.filter(d=>d.status==='Available').length} / {data.doctors.length}</h3>
            </div>
         </div>
         {user?.role === 'Super Admin' && (
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
              <div className="bg-green-100 p-4 rounded-lg mr-4">
                 <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                 <p className="text-sm font-medium text-gray-500">Avg Daily Revenue</p>
                 <h3 className="text-2xl font-bold text-gray-900">
                    ${Math.round(data.revenueSnapshot.reduce((a,b)=>a+b.Revenue,0)/7)}
                 </h3>
              </div>
           </div>
         )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Hourly Appointments Bar Chart */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Today's Appointment Load</h3>
            <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.hourlyAppointments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6"/>
                     <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                     <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                     <Bar dataKey="appointments" fill="#1E40AF" radius={[4, 4, 0, 0]} barSize={40} name="Appointments" />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Financial Area Chart (Super Admin only usually, but mapped for both in req) */}
         {user?.role === 'Super Admin' && (
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">7-Day Revenue Trajectory</h3>
              <div className="h-72 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.revenueSnapshot} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                       <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6"/>
                       <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                       <Area type="monotone" dataKey="Revenue" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
         )}
      </div>

    </div>
  );
}
