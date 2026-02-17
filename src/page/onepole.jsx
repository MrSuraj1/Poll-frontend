import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://poll-backend-2gxa.onrender.com");

export default function SinglePoll() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);

  useEffect(() => {
    fetch(`https://poll-backend-2gxa.onrender.com/api/polls/${id}`)
      .then(res => res.json())
      .then(data => setPoll(data));

    socket.on("pollUpdated", (updatedPoll) => {
      if (updatedPoll._id === id) {
        setPoll(updatedPoll);
      }
    });

    return () => socket.off("pollUpdated");
  }, [id]);

  if (!poll) return <p>Loading...</p>;

  if (data.success) {
  navigate(`/poll/${data.poll._id}`);
}
  return (
    <div>
      <h2>{poll.question}</h2>

      {poll.options.map((opt, i) => (
        <div key={i}>
          <p>{opt.text} - {opt.votes}</p>
        </div>
      ))}
    </div>
  );
}
