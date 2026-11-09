import Clock from "../../components/clock";

interface SystemHeaderProps {
  profile: { name: string; image: string };
}

export default function SystemHeader({ profile }: SystemHeaderProps) {
  return (
    <header className="system-header">
      <div className="user-panel">
        <img
          className="avatar"
          src={profile.image}
          alt="Matteo’s GitHub avatar"
        />
        <div className="user-info">
          <span>{profile.name}</span>
          <Clock />
        </div>
        <span className="system-orb" aria-hidden="true" />
      </div>
    </header>
  );
}
