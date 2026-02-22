import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import styled from "styled-components";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const Card = styled.div`
  max-width: 600px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Form = styled.form`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #333;
  input, textarea {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid #333;
    border-radius: 8px;
    background: #1a1a2e;
    color: #eee;
  }
  button {
    padding: 0.75rem 1.5rem;
    background: #e94560;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
`;

export default function UserProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skillOffered, setSkillOffered] = useState("");
  const [skillWanted, setSkillWanted] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get(`/users/${id}`).then(({ data }) => setProfile(data)).catch(() => setProfile(null));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/swaps", {
        receiverId: id,
        skillOffered: skillOffered.trim(),
        skillWanted: skillWanted.trim(),
        message: message.trim(),
      });
      setSent(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    }
  };

  if (!profile) return <p>Loading...</p>;
  if (profile._id === user?._id) return <p>That's you! <Link to="/profile">Edit your profile</Link></p>;

  return (
    <div>
      <Card>
        <h1>{profile.name}</h1>
        {profile.profileImage && <img src={profile.profileImage} alt="" style={{ width: 80, height: 80, borderRadius: "50%", marginBottom: "1rem" }} />}
        <p>Rating: {profile.rating || 0} ({profile.ratingCount || 0} reviews)</p>
        <p><strong>Offers:</strong> {profile.skillsOffered?.join(", ") || "None"}</p>
        <p><strong>Wants:</strong> {profile.skillsWanted?.join(", ") || "None"}</p>
        <p>Level: {profile.experienceLevel} | {profile.availability}</p>
        {profile.bio && <p>{profile.bio}</p>}

        {!sent ? (
          <Form onSubmit={handleSubmit}>
            <h3>Send Swap Request</h3>
            <input placeholder="Skill you'll offer (e.g. React)" value={skillOffered} onChange={(e) => setSkillOffered(e.target.value)} required />
            <input placeholder="Skill you want (e.g. DSA)" value={skillWanted} onChange={(e) => setSkillWanted(e.target.value)} required />
            <textarea placeholder="Optional message" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button type="submit">Send Request</button>
          </Form>
        ) : (
          <p style={{ color: "#27ae60", marginTop: "1rem" }}>Request sent!</p>
        )}
      </Card>
      <p style={{ marginTop: "1rem" }}>
        <Link to="/chat" style={{ color: "#e94560" }}>Chat with {profile.name}</Link>
      </p>
    </div>
  );
}
