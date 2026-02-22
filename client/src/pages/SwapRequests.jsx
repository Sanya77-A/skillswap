import { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const RatingForm = styled.form`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
  input { width: 60px; padding: 0.25rem; }
  button { padding: 0.25rem 0.5rem; font-size: 0.85rem; }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  .info {
    flex: 1;
    min-width: 200px;
  }
  .status {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    &.pending { background: #f39c12; color: #000; }
    &.accepted { background: #27ae60; color: #fff; }
    &.rejected { background: #e74c3c; color: #fff; }
    &.completed { background: #3498db; color: #fff; }
  }
  button {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    margin-left: 0.5rem;
  }
  .accept { background: #27ae60; color: white; }
  .reject { background: #e74c3c; color: white; }
  .complete { background: #3498db; color: white; }
`;

export default function SwapRequests() {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState([]);

  const load = () => api.get("/swaps").then(({ data }) => setSwaps(data)).catch(() => setSwaps([]));

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/swaps/${id}/status`, { status });
    load();
  };

  const complete = async (id) => {
    await api.patch(`/swaps/${id}/complete`);
    load();
  };

  const [ratingFor, setRatingFor] = useState(null);
  const [ratingVal, setRatingVal] = useState(5);
  const submitRating = async (e, swap) => {
    e.preventDefault();
    const otherId = swap.receiverId?._id === user?._id ? swap.senderId?._id : swap.receiverId?._id;
    await api.post("/ratings", { ratedUserId: otherId, swapRequestId: swap._id, rating: ratingVal });
    setRatingFor(null);
    load();
  };

  return (
    <div>
      <h1>Swap Requests</h1>
      {swaps.length === 0 ? (
        <p>No swap requests yet.</p>
      ) : (
        <List>
          {swaps.map((s) => {
            const isReceiver = s.receiverId?._id === user?._id;
            const other = isReceiver ? s.senderId : s.receiverId;
            return (
              <Card key={s._id}>
                <div className="info">
                  <strong>{other?.name}</strong>
                  <p>Offers: {s.skillOffered} | Wants: {s.skillWanted}</p>
                  {s.message && <p style={{ color: "#aaa" }}>{s.message}</p>}
                </div>
                <span className={`status ${s.status}`}>{s.status}</span>
                {isReceiver && s.status === "pending" && (
                  <>
                    <button className="accept" onClick={() => updateStatus(s._id, "accepted")}>Accept</button>
                    <button className="reject" onClick={() => updateStatus(s._id, "rejected")}>Reject</button>
                  </>
                )}
                {s.status === "accepted" && (
                  <button className="complete" onClick={() => complete(s._id)}>Mark Complete</button>
                )}
                {s.status === "completed" && ratingFor !== s._id && (
                  <button onClick={() => setRatingFor(s._id)}>Rate</button>
                )}
                {s.status === "completed" && ratingFor === s._id && (
                  <RatingForm onSubmit={(e) => submitRating(e, s)}>
                    <input type="number" min="1" max="5" value={ratingVal} onChange={(e) => setRatingVal(Number(e.target.value))} />
                    <button type="submit">Submit</button>
                    <button type="button" onClick={() => setRatingFor(null)}>Cancel</button>
                  </RatingForm>
                )}
              </Card>
            );
          })}
        </List>
      )}
    </div>
  );
}
