import { Link } from "react-router-dom";
import styled from "styled-components";

const Hero = styled.section`
  text-align: center;
  padding: 4rem 2rem;
  h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    background: linear-gradient(90deg, #e94560, #0f3460);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  p {
    font-size: 1.2rem;
    color: #aaa;
    max-width: 600px;
    margin: 0 auto 2rem;
  }
`;

const Cta = styled(Link)`
  display: inline-block;
  background: #e94560;
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  &:hover {
    background: #c73e54;
  }
`;

export default function Landing() {
  return (
    <Hero>
      <h1>SkillSwap</h1>
      <p>Exchange skills with peers. Teach React, learn DSA. No money, just knowledge.</p>
      <Cta to="/register">Get Started</Cta>
    </Hero>
  );
}
