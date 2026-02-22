import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import api from "../utils/api";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
  .badge {
    display: inline-block;
    background: #0f3460;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.8rem;
    margin: 0.25rem 0.25rem 0 0;
  }
  a {
    display: inline-block;
    margin-top: 1rem;
    color: #e94560;
    text-decoration: none;
  }
`;

export default function Matches() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    api.get("/matches").then(({ data }) => setMatches(data)).catch(() => setMatches([]));
  }, []);

  return (
    <div>
      <h1>Skill Matches</h1>
      <p style={{ color: "#aaa", marginBottom: "2rem" }}>Users who complement your skills</p>
      {matches.length === 0 ? (
        <p>No matches yet. Add skills in your profile.</p>
      ) : (
        <Grid>
          {matches.map((m) => (
            <Card key={m.user._id}>
              <h3>{m.user.name}</h3>
              <p style={{ color: "#7fdbda", fontSize: "0.9rem" }}>{m.matchReason}</p>
              <div>
                {m.user.skillsOffered?.map((s) => (
                  <span key={s} className="badge">Offers: {s}</span>
                ))}
              </div>
              <div>
                {m.user.skillsWanted?.map((s) => (
                  <span key={s} className="badge">Wants: {s}</span>
                ))}
              </div>
              <p>Level: {m.user.experienceLevel} | {m.user.availability}</p>
              <Link to={`/user/${m.user._id}`}>View & Send Request</Link>
            </Card>
          ))}
        </Grid>
      )}
    </div>
  );
}
