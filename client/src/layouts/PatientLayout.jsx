import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Activity, Clock, FileText, UserCircle, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { MessageSquare, X, Send, User, Bot, Minimize2, Maximize2 } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

export default function PatientLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { messages, addMessage, isOpen: isChatOpen, setIsOpen: setIsChatOpen } = useChatStore();
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    addMessage({ role: 'user', content: inputText });
    setInputText('');
    
    // Simulate AI response
    setTimeout(() => {
       addMessage({ role: 'assistant', content: "Hello! I'm your HMS assistant. How can I help you regarding your appointments or health records today?" });
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-white border-r flex flex-col md:h-full shadow-sm">
        <div className="p-4 border-b flex items-center space-x-2">
          <Activity className="h-8 w-8 text-medical-blue" />
          <span className="text-xl font-heading font-bold tracking-tight text-gray-800">My Health</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
          <Link to="/patient" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-medical-blue font-medium bg-blue-50/50 min-w-max">
            <Clock className="h-5 w-5" />
            <span className="hidden md:inline">Appointments</span>
          </Link>
          <Link to="/patient/records" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 min-w-max">
            <FileText className="h-5 w-5" />
            <span className="hidden md:inline">My Records</span>
          </Link>
          <Link to="/patient/profile" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 min-w-max">
            <UserCircle className="h-5 w-5" />
            <span className="hidden md:inline">Profile</span>
          </Link>
        </nav>

        <div className="p-4 border-t hidden md:block">
           <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-alert-red transition-colors w-full text-left font-medium"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50/50">
          <Outlet />
        </div>

        {/* Persisted AI Chatbot Popup */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
           {isChatOpen ? (
              <div className={`bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col transition-all duration-300 origin-bottom-right ${isMinimized ? 'w-64 h-12' : 'w-80 sm:w-96 h-[500px]'}`}>
                 {/* Chat Header */}
                 <div className="p-3 border-b border-neutral-100 flex items-center justify-between bg-primary-600 text-white rounded-t-2xl">
                    <div className="flex items-center gap-2">
                       <Bot size={18} />
                       <span className="font-semibold text-sm">Health Assistant</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/20 rounded transition-colors">
                          {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                       </button>
                       <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-white/20 rounded transition-colors">
                          <X size={14} />
                       </button>
                    </div>
                 </div>

                 {!isMinimized && (
                    <>
                       {/* Chat Messages */}
                       <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                          {messages.length === 0 && (
                             <div className="text-center py-8">
                                <Bot size={40} className="mx-auto text-neutral-200 mb-2" />
                                <p className="text-xs text-neutral-500 max-w-[180px] mx-auto italic">Ask me about your pills, reports or upcoming visits.</p>
                             </div>
                          )}
                          {messages.map((msg, i) => (
                             <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600'}`}>
                                   {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div className={`p-2.5 rounded-2xl text-xs max-w-[80%] ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-neutral-50 text-neutral-800 rounded-tl-none border border-neutral-100 shadow-sm'}`}>
                                   {msg.content}
                                </div>
                             </div>
                          ))}
                       </div>

                       {/* Chat Input */}
                       <div className="p-3 border-t border-neutral-100 flex gap-2 items-center">
                          <input 
                             type="text" 
                             value={inputText}
                             onChange={(e) => setInputText(e.target.value)}
                             onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                             placeholder="Type a message..."
                             className="flex-1 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                          />
                          <button 
                             onClick={handleSendMessage}
                             disabled={!inputText.trim()}
                             className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm"
                          >
                             <Send size={16} />
                          </button>
                       </div>
                    </>
                 )}
              </div>
           ) : (
              <button 
                 onClick={() => setIsChatOpen(true)}
                 className="w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-primary-700 transition-all hover:scale-110 active:scale-95 group relative"
                 aria-label="Open Health Assistant Chat"
              >
                 <MessageSquare size={24} />
                 <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>
           )}
        </div>
      </main>
    </div>
  );
}
