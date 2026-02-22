import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import api from "../utils/api";

const Form = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  input, select {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid #333;
    background: #1a1a2e;
    color: #eee;
  }
  button { padding: 0.5rem 1rem; background: #e94560; color: white; border: none; border-radius: 8px; cursor: pointer; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

const Card = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 1rem;
  a { color: #e94560; text-decoration: none; }
`;

export default function Search() {
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("");
  const [availability, setAvailability] = useState("");
  const [users, setUsers] = useState([]);

  const search = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (skill) params.set("skill", skill);
    if (level) params.set("level", level);
    if (availability) params.set("availability", availability);
    api.get(`/users/search?${params}`).then(({ data }) => setUsers(data)).catch(() => setUsers([]));
  };

  return (
    <div>
      <h1>Search Users</h1>
      <Form onSubmit={search}>
        <input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
        <input placeholder="Skill" value={skill} onChange={(e) => setSkill(e.target.value)} />
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Any level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>
        <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
          <option value="">Any</option>
          <option value="weekdays">Weekdays</option>
          <option value="weekends">Weekends</option>
          <option value="flexible">Flexible</option>
          <option value="anytime">Anytime</option>
        </select>
        <button type="submit">Search</button>
      </Form>
      <Grid>
        {users.map((u) => (
          <Card key={u._id}>
            <h3><Link to={`/user/${u._id}`}>{u.name}</Link></h3>
            <p>Offers: {u.skillsOffered?.join(", ")}</p>
            <p>Wants: {u.skillsWanted?.join(", ")}</p>
          </Card>
        ))}
      </Grid>
    </div>
  );
}
