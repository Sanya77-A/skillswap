import { useState, useEffect } from "react";
import styled from "styled-components";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const Form = styled.form`
  max-width: 500px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid #333;
    border-radius: 8px;
    background: #1a1a2e;
    color: #eee;
  }
  textarea { min-height: 80px; }
  button {
    padding: 0.75rem 1.5rem;
    background: #e94560;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
`;

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState("");
  const [skillsOffered, setSkillsOffered] = useState("");
  const [skillsWanted, setSkillsWanted] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [availability, setAvailability] = useState("flexible");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setSkillsOffered((user.skillsOffered || []).join(", "));
      setSkillsWanted((user.skillsWanted || []).join(", "));
      setExperienceLevel(user.experienceLevel || "intermediate");
      setAvailability(user.availability || "flexible");
      setBio(user.bio || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const offered = skillsOffered.split(",").map((s) => s.trim()).filter(Boolean);
    const wanted = skillsWanted.split(",").map((s) => s.trim()).filter(Boolean);
    const { data } = await api.patch("/users/profile", {
      name,
      skillsOffered: offered,
      skillsWanted: wanted,
      experienceLevel,
      availability,
      bio,
    });
    setUser(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1>Edit Profile</h1>
      <Form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="text" placeholder="Skills I offer (comma-separated, e.g. React, Node)" value={skillsOffered} onChange={(e) => setSkillsOffered(e.target.value)} />
        <input type="text" placeholder="Skills I want (comma-separated, e.g. DSA, Python)" value={skillsWanted} onChange={(e) => setSkillsWanted(e.target.value)} />
        <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>
        <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
          <option value="weekdays">Weekdays</option>
          <option value="weekends">Weekends</option>
          <option value="flexible">Flexible</option>
          <option value="anytime">Anytime</option>
        </select>
        <textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        <button type="submit">{saved ? "Saved!" : "Save"}</button>
      </Form>
    </div>
  );
}
