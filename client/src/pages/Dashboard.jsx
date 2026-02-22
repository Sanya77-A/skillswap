import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  h3 {
    margin-bottom: 0.5rem;
    color: #e94560;
  }
  p {
    color: #aaa;
    font-size: 0.9rem;
  }
  a {
    display: inline-block;
    margin-top: 1rem;
    color: #e94560;
    text-decoration: none;
  }
`;

export default function Dashboard() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    api.get("/matches").then(({ data }) => setMatches(data)).catch(() => setMatches([]));
  }, []);

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p style={{ color: "#aaa", marginBottom: "2rem" }}>
        Your skills: {user?.skillsOffered?.join(", ") || "None added"} | Want: {user?.skillsWanted?.join(", ") || "None"}
      </p>
      <h2>Suggested Matches</h2>
      {matches.length === 0 ? (
        <p>Add skills in your profile to get matches. <Link to="/profile">Edit Profile</Link></p>
      ) : (
        <Grid>
          {matches.slice(0, 6).map((m) => (
            <Card key={m.user._id}>
              <h3>{m.user.name}</h3>
              <p>{m.matchReason}</p>
              <p>Offers: {m.user.skillsOffered?.join(", ")}</p>
              <p>Wants: {m.user.skillsWanted?.join(", ")}</p>
              <Link to={`/user/${m.user._id}`}>View Profile</Link>
            </Card>
          ))}
        </Grid>
      )}
    </div>
  );
}
