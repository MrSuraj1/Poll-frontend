import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

export default function Polcreate() {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const API = "https://poll-backend-2gxa.onrender.com/api/polls";
  const user = JSON.parse(localStorage.getItem("user"));

  // 🔄 Fetch Polls
  const fetchPolls = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setPolls(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const socket = io("https://poll-backend-2gxa.onrender.com");
    socket.on("pollUpdated", (updatedPoll) => {
      setPolls(prev =>
        prev.map(p => p._id === updatedPoll._id ? updatedPoll : p)
      );
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    fetchPolls();
    setToken(localStorage.getItem("token"));
  }, []);

  const createPoll = async () => {
    if (!question || options.some(opt => !opt)) {
      alert("Please fill all fields");
      return;
    }
    if (!token) {
      alert("Login first bro");
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          question,
          options: options.map(opt => ({ text: opt, votes: 0 }))
        })
      });
      const data = await res.json();
      if (data.success) {
        setPolls(prev => [...prev, data.poll]);
      }
      setQuestion("");
      setOptions(["", ""]);
    } catch (err) {
      console.error(err);
    }
  };

  const vote = async (pollId, optionIndex) => {
    if (!token) {
      alert("Login first bro");
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(`${API}/${pollId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ optionIndex })
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message);
      } else {
        fetchPolls();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      
      {/* 🔷 MODERN NAVBAR */}
      <nav className="max-w-5xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-4 z-50 shadow-sm border border-slate-200 p-4 rounded-2xl mb-10">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="bg-blue-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
             <span className="text-white text-xl">🗳️</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">POLL<span className="text-blue-600">APP</span></h2>
        </div>

        <div className="flex items-center gap-6">
          {token && (
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Logged in as</span>
              <span className="text-sm font-semibold text-slate-700">{user?.email}</span>
            </div>
          )}
          {token ? (
            <button
              onClick={handleLogout}
              className="bg-slate-900 text-white px-5 py-2 rounded-xl font-medium hover:bg-red-600 transition-colors shadow-sm"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto">
        {/* CREATE POLL CARD */}
        <section className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 mb-12 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-900">Create a New Poll</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Question</label>
              <input
                type="text"
                placeholder="What's on your mind?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full bg-slate-50 border-slate-200 border-2 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-lg"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Options</label>
              {options.map((opt, index) => (
                <div key={index} className="group relative">
                   <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[index] = e.target.value;
                      setOptions(newOptions);
                    }}
                    className="w-full bg-white border-slate-200 border-2 p-3 rounded-xl focus:border-blue-400 transition-all outline-none"
                  />
                  {options.length > 2 && (
                    <button 
                      onClick={() => setOptions(options.filter((_, i) => i !== index))}
                      className="absolute right-3 top-3 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => setOptions([...options, ""])}
                className="flex-1 bg-slate-100 text-slate-600 px-4 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors border-2 border-transparent"
              >
                + Add Another Option
              </button>
              <button
                onClick={createPoll}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-transform active:scale-95"
              >
                Launch Poll 🚀
              </button>
            </div>
          </div>
        </section>

        {/* SHOW POLLS LIST */}
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Active Polls ({polls.length})</h3>
          
          {polls.length === 0 && (
             <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No polls available yet. Be the first to create one!</p>
             </div>
          )}

          {polls.map((poll) => {
            const hasVoted = poll.voters?.includes(user?.id);
            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

            return (
              <div key={poll._id} className="group bg-white border border-slate-200 shadow-sm rounded-3xl p-6 transition-all hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-slate-800 leading-tight pr-4">{poll.question}</h3>
                  {hasVoted && (
                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 animate-pulse">
                      <span className="text-sm">✓</span> VOTED
                    </span>
                  )}
                </div>

                <div className="space-y-5">
                  {poll.options.map((option, index) => {
                    const percentage = totalVotes === 0 ? 0 : ((option.votes / totalVotes) * 100).toFixed(1);

                    return (
                      <div key={index} className="relative group/opt">
                        <div className="flex justify-between items-center mb-2 px-1">
                          <span className="font-semibold text-slate-700">{option.text}</span>
                          <span className="text-sm font-bold text-slate-400 group-hover/opt:text-blue-500 transition-colors">
                            {option.votes} votes • {percentage}%
                          </span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-50">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${hasVoted ? 'bg-blue-500' : 'bg-slate-300'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>

                        <button
                          disabled={hasVoted}
                          onClick={() => vote(poll._id, index)}
                          className={`mt-3 w-full py-2.5 rounded-xl font-bold transition-all border-2 
                            ${hasVoted 
                              ? 'bg-transparent border-slate-100 text-slate-300 cursor-not-allowed' 
                              : 'bg-white border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                        >
                          {hasVoted ? 'Selection Locked' : 'Vote Now'}
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className={`h-6 w-6 rounded-full border-2 border-white bg-slate-${i+1}00 flex items-center justify-center text-[10px] font-bold text-slate-400`}>
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                   </div>
                   <button 
                    onClick={() => navigate(`/poll/${poll._id}`)}
                    className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
                   >
                     View Discussion →
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}