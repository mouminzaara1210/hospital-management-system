import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, User, Building } from 'lucide-react';
import api from '../../services/api';

export default function Booking() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const navigate = useNavigate();

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

  const availableSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:30 PM'];

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedSlot) return alert('Fill all required fields');
    
    try {
      await api.post('/appointments', {
        doctorId: selectedDoctor,
        appointmentDate: selectedDate,
        slotTime: selectedSlot,
        reasonForVisit: reason
      });
      alert('Appointment booked successfully!');
      navigate('/patient');
    } catch (err) {
      console.error(err);
      alert('Failed to book appointment');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
         <h2 className="text-2xl font-bold text-gray-900 font-heading">Book an Appointment</h2>
         <p className="text-gray-500 mt-1">Select a doctor, date, and time slot for your visit.</p>
         
         <form onSubmit={handleBooking} className="mt-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Doctor Selection */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 mr-2 text-medical-blue" />
                  Select Specialist
                </label>
                <div className="grid gap-3">
                  {doctors.map(doc => (
                    <div 
                      key={doc._id}
                      onClick={() => setSelectedDoctor(doc._id)}
                      className={`border p-4 rounded-lg cursor-pointer transition-all ${selectedDoctor === doc._id ? 'border-medical-blue bg-blue-50 ring-1 ring-medical-blue' : 'border-gray-200 hover:border-blue-300'}`}
                    >
                      <h4 className="font-semibold text-gray-900">Dr. {doc.firstName} {doc.lastName}</h4>
                      <p className="text-sm text-gray-500">{doc.specialisation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date & Time Selection */}
              <div className="space-y-6">
                 <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                      <CalendarIcon className="w-4 h-4 mr-2 text-medical-blue" />
                      Select Date
                    </label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-medical-blue focus:border-medical-blue border-gray-300 shadow-sm"
                      required
                    />
                 </div>

                 {selectedDate && (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                        <Clock className="w-4 h-4 mr-2 text-medical-blue" />
                        Available Slots
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {availableSlots.map(slot => (
                          <div 
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2 text-center text-sm rounded-md cursor-pointer transition-colors border ${selectedSlot === slot ? 'bg-medical-blue text-white border-medical-blue' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'}`}
                          >
                            {slot}
                          </div>
                        ))}
                      </div>
                    </div>
                 )}
              </div>
            </div>

            <div className="border-t pt-6">
               <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit (Optional)</label>
               <textarea 
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-medical-blue focus:ring-medical-blue p-3 border"
                  placeholder="Describe your symptoms or reason for booking..."
               />
            </div>

            <div className="flex justify-end">
               <button 
                type="submit" 
                disabled={!selectedDoctor || !selectedDate || !selectedSlot}
                className="bg-medical-blue hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Confirm Booking
               </button>
            </div>
         </form>
      </div>
    </div>
  );
}
