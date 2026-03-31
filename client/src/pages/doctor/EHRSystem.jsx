import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Activity, Beaker, FileText, TrendingUp, Edit3 } from 'lucide-react';
import api from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';

export default function EHRSystem() {
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const currentApptId = searchParams.get('appt');
  
  const navigate = useNavigate();
  const [ehrData, setEhrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEHR();

    const socket = io('http://localhost:5000');
    socket.on('vitals:new', (newVitals) => {
       if (newVitals.patient === patientId) {
         setEhrData(prev => ({
           ...prev,
           vitals: [newVitals, ...prev.vitals].slice(0, 10) // Mocking Recharts real-time append logic
         }));
       }
    });

    return () => socket.disconnect();
  }, [patientId]);

  const fetchEHR = async () => {
    try {
      const res = await api.get(`/clinical/ehr/${patientId}`);
      setEhrData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading EHR timeline...</div>;
  if (!ehrData) return <div className="p-10 text-center text-red-500">Failed to load patient records.</div>;

  // Transform vitals for recharts (Reverse because API gave descending, we want ascending left-to-right)
  const chartData = [...ehrData.vitals].reverse().map(v => ({
    time: new Date(v.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    bpSystolic: v.bpSystolic,
    bpDiastolic: v.bpDiastolic,
    spo2: v.spo2,
    pulse: v.pulse
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-medical-blue text-white p-6 rounded-xl shadow-md flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-bold font-heading">{ehrData.patient.firstName} {ehrData.patient.lastName}</h1>
            <div className="mt-2 flex items-center space-x-4 text-blue-100 text-sm">
               <span>ID: {ehrData.patient.patientId}</span>
               <span>|</span>
               <span>{ehrData.patient.gender}</span>
               <span>|</span>
               <span>Blood Group: <span className="font-bold text-white">{ehrData.patient.bloodGroup || 'N/A'}</span></span>
            </div>
         </div>
         {currentApptId && (
            <button 
               onClick={() => navigate(`/doctor/prescription/${patientId}?appt=${currentApptId}`)}
               className="bg-white text-medical-blue hover:bg-gray-100 px-5 py-2.5 rounded-lg flex items-center font-bold font-heading shadow-sm transition-colors"
            >
               <Edit3 className="w-5 h-5 mr-2" />
               Write Prescription
            </button>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Live Vitals Chart */}
         <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center mb-6">
              <TrendingUp className="w-5 h-5 text-soft-teal mr-2" />
              Live Vitals Timeline
            </h3>
            {chartData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="time" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                    <YAxis yAxisId="right" orientation="right" stroke="#0D9488" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="bpSystolic" stroke="#1E40AF" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="BP (Sys)" />
                    <Line yAxisId="left" type="monotone" dataKey="pulse" stroke="#DC2626" strokeWidth={2} dot={false} name="Pulse" />
                    <Line yAxisId="right" type="monotone" dataKey="spo2" stroke="#0D9488" strokeWidth={3} dot={{r: 4}} name="SpO2 %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed text-sm">
                No recent vitals logged.
              </div>
            )}
         </div>

         {/* Past Encounters */}
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full max-h-[400px] flex flex-col">
               <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4 border-b pb-3">
                 <FileText className="w-5 h-5 text-medical-blue mr-2" />
                 Past Prescriptions
               </h3>
               <div className="overflow-y-auto flex-1 space-y-4 pr-2">
                 {ehrData.prescriptions.length === 0 ? (
                   <div className="text-sm text-gray-500">No past prescriptions found.</div>
                 ) : (
                   ehrData.prescriptions.map(p => (
                     <div key={p._id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors">
                       <div className="text-xs text-gray-500 font-semibold mb-1">
                         {new Date(p.createdAt).toLocaleDateString()} - Dr. {p.doctor?.lastName}
                       </div>
                       <div className="text-sm font-medium text-gray-900">
                         {p.diagnosis.length > 0 ? p.diagnosis.join(', ') : 'No diagnosis specified'}
                       </div>
                       <div className="mt-2 text-xs text-medical-blue flex items-center">
                         <Beaker className="w-3 h-3 mr-1" /> {p.medicines.length} Medicines prescribed
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
