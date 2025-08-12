"use client";

import { useEffect, useState } from "react";

const GetStartedAtTime = ({ startedAt }: { startedAt: Date }) => {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const start = new Date(startedAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - start;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTime({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  useEffect(() => {
    const start = new Date(startedAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - start;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTime({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <span>
      Started from: {time.days}d {time.hours}h {time.minutes}m {time.seconds}s
    </span>
  );
};

export default GetStartedAtTime;
