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

  // 🚀 Create Poll
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
          options: options.map(opt => ({
            text: opt,
            votes: 0
          }))
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

  // 🗳 Vote
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

  // 🔓 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* 🔷 NAVBAR */}
      <div className="flex justify-between items-center bg-white shadow-md p-4 rounded-lg mb-8">
        <h2
          className="text-2xl font-bold text-blue-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          🗳 Poll App
        </h2>

        <div className="flex items-center gap-4">
          {token && (
            <span className="text-gray-600 font-medium">
              Welcome, {user?.email}
            </span>
          )}

          {token ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Login
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto">

        {/* CREATE POLL */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Create Poll</h2>

          <input
            type="text"
            placeholder="Enter Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full border p-3 rounded-lg mb-4"
          />

          {options.map((opt, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Option ${index + 1}`}
              value={opt}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                setOptions(newOptions);
              }}
              
              className="w-full border p-3 rounded-lg mb-3"
            />
          ))}

          <div className="flex gap-3">
            <button
              onClick={() => setOptions([...options, ""])}
              className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              + Add Option
            </button>

            <button
              onClick={createPoll}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Poll
            </button>
          </div>
        </div>

        {/* SHOW POLLS */}
        {polls.map((poll) => {
          const hasVoted = poll.voters?.includes(user?.id);

          return (
            <div key={poll._id} className="bg-white shadow-md rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">{poll.question}</h3>

              {hasVoted && (
                <span className="inline-block bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs mb-3">
                  ✔ You already voted
                </span>
              )}

              {poll.options.map((option, index) => {
                const totalVotes = poll.options.reduce(
                  (sum, opt) => sum + opt.votes,
                  0
                );

                const percentage =
                  totalVotes === 0
                    ? 0
                    : ((option.votes / totalVotes) * 100).toFixed(1);

                return (
                  <div key={index} className="mb-4"
                  onClick={() => navigate(`/poll/${poll._id}`)}  >
                    <div className="flex justify-between mb-1"
                    >
                      <span>{option.text}</span>
                      <span>{option.votes} votes ({percentage}%)</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    <button
                      disabled={hasVoted}
                      onClick={() => vote(poll._id, index)}
                      className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:bg-gray-400"
                    >
                      Vote
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
