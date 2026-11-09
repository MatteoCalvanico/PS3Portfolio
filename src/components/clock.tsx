import { useEffect, useState } from "react";

export default function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <time dateTime={now.toISOString()}>
      {now.toLocaleDateString("en-GB", { day: "numeric", month: "numeric" })}
      <span className="clock-time">
        {now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </time>
  );
}
