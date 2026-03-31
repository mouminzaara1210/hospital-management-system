import { useState, useEffect } from 'react';
import { BedDouble, AlertCircle, X, Search, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { io } from 'socket.io-client';

export default function BedManagement() {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBed, setSelectedBed] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBeds();
    
    const socket = io('http://localhost:5000');
    socket.on('bed:status_changed', () => {
       fetchBeds(); // Fetch fresh to easily maintain groups
    });

    return () => socket.disconnect();
  }, []);

  const fetchBeds = async () => {
    try {
      const res = await api.get('/beds');
      // On empty database, seed it for demo implicitly
      if(res.data.length === 0) {
        await api.post('/beds/seed');
        const res2 = await api.get('/beds');
        setBeds(res2.data);
      } else {
        setBeds(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBedClick = (bed) => {
    setSelectedBed(bed);
    setSearchQuery('');
    setIsModalOpen(true);
  };

  const assignBed = async (e) => {
    e.preventDefault();
    try {
       // Mock patient lookup by query instead of a real search for simplicity in this demo modal
       const res = await api.get('/patients');
       const found = res.data.find(p => p.patientId.includes(searchQuery.trim()));
       
       if(!found && searchQuery) {
          return alert('Patient not found with that ID');
       }

       await api.put(`/beds/${selectedBed._id}`, {
          status: 'Occupied',
          patientId: found._id
       });
       
       setIsModalOpen(false);
       // Socket updates UI naturally
    } catch (err) {
       console.error(err);
       alert('Failed to assign bed');
    }
  };

  const dischargeBed = async () => {
     try {
       await api.put(`/beds/${selectedBed._id}`, {
          status: 'Available',
          patientId: null
       });
       setIsModalOpen(false);
     } catch(err) {
       console.error(err);
     }
  };

  const groupedBeds = beds.reduce((acc, bed) => {
    acc[bed.ward] = acc[bed.ward] || [];
    acc[bed.ward].push(bed);
    return acc;
  }, {});

  if (loading) return <div className="p-8">Loading Bed Matrix...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900">Bed Occupancy Heatmap</h1>
          <p className="text-gray-500 mt-1">Live ward capacity visualization and assignment.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-4">
           {/* Legends */}
           <div className="flex items-center text-sm font-medium"><div className="w-3 h-3 rounded-full bg-soft-teal mr-2"></div> Available</div>
           <div className="flex items-center text-sm font-medium"><div className="w-3 h-3 rounded-full bg-alert-red mr-2"></div> Occupied</div>
           <div className="flex items-center text-sm font-medium"><div className="w-3 h-3 rounded-full bg-amber-400 mr-2"></div> Maintenance</div>
        </div>
      </div>

      {Object.keys(groupedBeds).map(wardName => (
         <div key={wardName} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
               <BedDouble className="w-5 h-5 mr-2 text-medical-blue" />
               {wardName} Ward
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4">
               {groupedBeds[wardName].map(bed => (
                  <div 
                     key={bed._id} 
                     onClick={() => handleBedClick(bed)}
                     className={`cursor-pointer rounded-lg p-3 border-2 transition-all hover:shadow-md transform hover:-translate-y-1 relative 
                        ${bed.status === 'Available' ? 'bg-teal-50 border-soft-teal/40' : 
                          bed.status === 'Occupied' ? 'bg-red-50 border-alert-red/40' : 
                          'bg-amber-50 border-amber-400/40'}`}
                  >
                     <div className={`text-xs font-bold ${
                        bed.status === 'Available' ? 'text-soft-teal' : 
                        bed.status === 'Occupied' ? 'text-alert-red' : 
                        'text-amber-600'
                     }`}>
                        {bed.bedNumber}
                     </div>
                     <BedDouble className={`w-8 h-8 mt-2 mx-auto ${
                        bed.status === 'Available' ? 'text-soft-teal opacity-70' : 
                        bed.status === 'Occupied' ? 'text-alert-red opacity-70' : 
                        'text-amber-500 opacity-70'
                     }`} />
                     {bed.patient && (
                        <div className="mt-2 text-[10px] text-center font-semibold text-gray-700 truncate w-full px-1">
                           {bed.patient.lastName}
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </div>
      ))}

      {/* Assignment Modal UI */}
      {isModalOpen && selectedBed && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden scale-in-center">
               <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                     Bed {selectedBed.bedNumber} <span className="text-gray-400 font-normal ml-2 text-sm">({selectedBed.ward})</span>
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <div className="p-6">
                 {selectedBed.status === 'Available' ? (
                    <form onSubmit={assignBed}>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Assign Patient ID</label>
                       <div className="flex">
                          <input 
                             type="text" 
                             required
                             placeholder="e.g. HMS-2023-XXXXX"
                             value={searchQuery}
                             onChange={e => setSearchQuery(e.target.value)}
                             className="flex-1 rounded-l-lg border-gray-300 focus:ring-medical-blue focus:border-medical-blue p-2.5 border"
                          />
                          <button type="submit" className="bg-medical-blue hover:bg-blue-800 text-white px-4 rounded-r-lg font-medium transition-colors">
                             Assign
                          </button>
                       </div>
                       <p className="text-xs text-gray-500 mt-3 flex items-start">
                          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                          Assigning a patient will mark this bed as Occupied and broadcast to the ward via Socket.IO.
                       </p>
                    </form>
                 ) : selectedBed.status === 'Occupied' ? (
                    <div>
                       <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-6">
                           <p className="text-sm font-medium text-alert-red flex items-center mb-1">
                              <CheckCircle className="w-4 h-4 mr-1" /> Currently Occupied
                           </p>
                           <p className="text-gray-800 font-bold ml-5">
                              {selectedBed.patient?.firstName} {selectedBed.patient?.lastName}
                           </p>
                           <p className="text-gray-500 text-sm ml-5">{selectedBed.patient?.patientId}</p>
                       </div>
                       <button onClick={dischargeBed} className="w-full bg-white border-2 border-dashed border-gray-300 hover:border-alert-red hover:text-alert-red text-gray-600 font-medium py-3 rounded-lg transition-colors">
                          Discharge / Free Bed
                       </button>
                    </div>
                 ) : (
                    <div className="text-center py-6 text-amber-600 font-medium">
                       Bed is currently marked for Maintenance.
                    </div>
                 )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
