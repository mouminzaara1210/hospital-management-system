import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, CheckCircle2, Clock, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments/me');
        setAppointments(res.data);
      } catch (err) {
        // Handle gracefully
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const upcomingAppts = appointments.filter(a => ['Pending', 'Confirmed', 'In-Progress'].includes(a.status));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-1">Here is a summary of your health journey.</p>
        </div>
        <Link 
          to="/patient/booking" 
          className="mt-4 sm:mt-0 flex items-center justify-center px-6 py-2.5 bg-soft-teal hover:bg-teal-700 text-white rounded-lg shadow-sm font-medium transition-colors"
        >
          <CalendarPlus className="w-5 h-5 mr-2" />
          Book Appointment
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                 <Clock className="w-5 h-5 mr-2 text-medical-blue" />
                 Upcoming Appointments
               </h2>
             </div>
             
             {loading ? (
               <div className="animate-pulse flex space-x-4">
                 <div className="flex-1 space-y-4 py-1">
                   <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                   <div className="space-y-2">
                     <div className="h-10 bg-gray-200 rounded"></div>
                   </div>
                 </div>
               </div>
             ) : upcomingAppts.length > 0 ? (
               <div className="space-y-4">
                 {upcomingAppts.map(appt => (
                   <div key={appt._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                     <div className="flex items-start mb-3 sm:mb-0">
                       <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm mr-4 text-center min-w-[70px]">
                         <div className="text-sm font-bold text-medical-blue">{new Date(appt.appointmentDate).getDate()}</div>
                         <div className="text-xs uppercase text-gray-500 font-medium">
                           {new Date(appt.appointmentDate).toLocaleString('default', { month: 'short' })}
                         </div>
                       </div>
                       <div>
                         <h4 className="font-semibold text-gray-900">Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}</h4>
                         <div className="flex items-center text-sm text-gray-500 mt-1">
                           <Clock className="w-3.5 h-3.5 mr-1" /> {appt.slotTime}
                         </div>
                         <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                            {appt.status}
                         </div>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Queue Status</div>
                       <div className={`font-bold ${appt.queueStatus === 'Calling' ? 'text-alert-red animate-pulse' : 'text-medical-blue'}`}>
                         {appt.queueStatus}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                 <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                 <p className="text-gray-500">You have no upcoming appointments.</p>
               </div>
             )}
           </div>
        </div>

        <div className="space-y-6">
           {/* Action Card */}
           <div className="bg-gradient-to-br from-medical-blue to-blue-800 rounded-xl shadow-md p-6 text-white relative overflow-hidden">
             <div className="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-10 rounded-full"></div>
             <AlertCircle className="w-8 h-8 text-blue-200 mb-4" />
             <h3 className="text-xl font-bold mb-2">Registration Incomplete</h3>
             <p className="text-blue-100 text-sm mb-4">Complete your registration to speed up your OPD wait times.</p>
             <Link to="/patient/registration" className="inline-block bg-white text-medical-blue px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
               Complete Now
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
