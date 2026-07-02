import { useAuth } from "../AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();
  return (
    <div style={{ padding: 20 }}>
      <h1>Esports Turniri</h1>
      {user ? (
        <p>Ulogovan si kao <b>{user.username}</b> (nivo: {user.role}).</p>
      ) : (
        <p>Prijavi se ili registruj da nastaviš.</p>
      )}
    </div>
  );
}