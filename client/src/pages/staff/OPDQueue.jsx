import { useState, useEffect } from 'react';
import { Users, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { io } from 'socket.io-client';

export default function OPDQueue() {
  const [queue, setQueue] = useState([]);
  const [doctorId, setDoctorId] = useState(''); // Could select doctor from drop down
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/patients/doctors');
        setDoctors(res.data);
      } catch (err) {
        console.error('Failed to fetch doctors', err);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if(!doctorId) return;

    fetchQueue();
    const socket = io('http://localhost:5000');
    
    socket.on('queue:token_called', () => {
       fetchQueue(); 
    });
    socket.on('appointment:booked', () => {
       fetchQueue();
    });

    return () => socket.disconnect();
  }, [doctorId]);

  const fetchQueue = async () => {
    try {
      // doctorId passed as query param based on backend definition
      const res = await api.get(`/appointments/doctor/queue?doctorId=${doctorId}`);
      setQueue(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Live OPD Queue</h1>
          <p className="text-gray-500 mt-1">Select a department doctor to view their waiting area.</p>
        </div>
        <div className="mt-4 sm:mt-0 max-w-xs w-full">
           <select 
             className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-medical-blue focus:border-medical-blue shadow-sm font-medium"
             value={doctorId}
             onChange={(e) => setDoctorId(e.target.value)}
           >
             <option value="">-- Select specific Doctor TV --</option>
             {doctors.map(d => (
                <option key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName}</option>
             ))}
           </select>
        </div>
      </div>

      {!doctorId ? (
         <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Doctor Selected</h3>
            <p className="text-gray-500 mt-1">Please select a doctor to begin monitoring the live screen.</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Active Display Panel mimicking a wait-room screen */}
            {queue.map(appt => (
               <div key={appt._id} className={`p-6 bg-white rounded-xl shadow-sm border-2 overflow-hidden relative transition-all ${appt.queueStatus === 'Calling' ? 'border-alert-red animate-pulse' : appt.queueStatus === 'Consulting' ? 'border-soft-teal' : 'border-transparent'}`}>
                  {appt.queueStatus === 'Calling' && (
                     <div className="absolute top-0 inset-x-0 h-1.5 bg-alert-red"></div>
                  )}
                  {appt.queueStatus === 'Consulting' && (
                     <div className="absolute top-0 inset-x-0 h-1.5 bg-soft-teal"></div>
                  )}
                  
                  <div className="flex justify-between items-start mb-6">
                     <div className="bg-gray-100 px-4 py-2 rounded-lg text-4xl font-black font-heading tracking-tight text-gray-800">
                        {String(appt.tokenNumber).padStart(3, '0')}
                     </div>
                     <span className={`px-3 py-1 font-bold text-xs uppercase tracking-wider rounded-full ${
                        appt.queueStatus === 'Waiting' ? 'bg-gray-100 text-gray-600' : 
                        appt.queueStatus === 'Calling' ? 'bg-red-100 text-alert-red' : 
                        appt.queueStatus === 'Consulting' ? 'bg-teal-100 text-teal-800' : 
                        'bg-blue-100 text-medical-blue'
                     }`}>
                        {appt.queueStatus}
                     </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 border-b pb-4 mb-4 truncate">{appt.patient?.firstName} {appt.patient?.lastName}</h3>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500">Slot Time:</span>
                     <span className="font-semibold text-gray-700">{appt.slotTime}</span>
                  </div>
               </div>
            ))}
         </div>
      )}
    </div>
  );
}
