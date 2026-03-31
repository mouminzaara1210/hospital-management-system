import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, ArrowRightCircle, PhoneCall } from 'lucide-react';
import api from '../../services/api';
// Normally imported socket from context or service
import { io } from 'socket.io-client';

export default function DoctorDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueue();
    
    // In production, socket URL should be from env
    const socket = io('http://localhost:5000');
    
    // Example socket listener for live additions
    socket.on('appointment:booked', (newAppt) => {
       fetchQueue(); // easiest way to refresh sorting
    });

    return () => socket.disconnect();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await api.get('/appointments/doctor/queue');
      setQueue(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCallPatient = async (id) => {
    try {
      await api.put(`/appointments/${id}/status`, { queueStatus: 'Calling' });
      fetchQueue();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const startConsultation = async (appt) => {
    try {
      await api.put(`/appointments/${appt._id}/status`, { status: 'In-Progress', queueStatus: 'Consulting' });
      navigate(`/doctor/ehr/${appt.patient?._id}?appt=${appt._id}`);
    } catch (err) {
      console.error('Err', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Today's Schedule</h1>
          <p className="text-gray-500 mt-1">Manage your incoming OPD patients.</p>
        </div>
        <div className="bg-blue-50 text-medical-blue p-3 rounded-lg flex items-center font-semibold">
          <Users className="w-5 h-5 mr-2" />
          {queue.length} Total Patients
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                 <tr>
                   <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading schedule...</td>
                 </tr>
              ) : queue.length === 0 ? (
                 <tr>
                   <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No appointments scheduled for today.</td>
                 </tr>
              ) : (
                queue.map((appt) => (
                  <tr key={appt._id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="bg-blue-100 text-medical-blue font-bold px-3 py-1 rounded-md inline-block">#{appt.tokenNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{appt.patient?.firstName} {appt.patient?.lastName}</div>
                      <div className="text-sm text-gray-500">{appt.patient?.patientId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1.5" />
                        {appt.slotTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${appt.queueStatus === 'Calling' ? 'bg-yellow-100 text-yellow-800 animate-pulse' : ''}
                        ${appt.queueStatus === 'Waiting' ? 'bg-gray-100 text-gray-800' : ''}
                        ${appt.queueStatus === 'Consulting' ? 'bg-green-100 text-green-800' : ''}
                        ${appt.queueStatus === 'Done' ? 'bg-blue-100 text-medical-blue' : ''}
                      `}>
                        {appt.queueStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      {appt.queueStatus === 'Waiting' && (
                        <button 
                          onClick={() => handleCallPatient(appt._id)}
                          className="text-amber-600 hover:text-amber-900 flex items-center justify-end"
                        >
                          <PhoneCall className="w-4 h-4 mr-1" /> Call
                        </button>
                      )}
                      {(appt.queueStatus === 'Calling' || appt.queueStatus === 'Consulting') && (
                        <button 
                          onClick={() => startConsultation(appt)}
                          className="text-medical-blue hover:text-blue-900 flex items-center justify-end font-bold"
                        >
                          <ArrowRightCircle className="w-5 h-5 mr-1" /> Consult
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
