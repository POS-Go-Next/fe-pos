"use client";

import { FC, useEffect, useState } from "react";

interface TimeDisplayProps {}

const TimeDisplay: FC<TimeDisplayProps> = () => {
    const [time, setTime] = useState<string>("");
    const [date, setDate] = useState<string>("");

    const updateTime = () => {
        const currentDate = new Date();
        const hours = currentDate.getHours().toString().padStart(2, "0");
        const minutes = currentDate.getMinutes().toString().padStart(2, "0");
        const seconds = currentDate.getSeconds().toString().padStart(2, "0");
        setTime(`${hours}:${minutes}:${seconds}`);

        const month = currentDate.toLocaleString("default", { month: "long" });
        const day = currentDate.getDate();
        const year = currentDate.getFullYear();
        setDate(`${month} ${day}, ${year}`);
    };

    useEffect(() => {
        updateTime();

        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-right">
            <div className="text-xl font-semibold text-black">{time}</div>
            <div className="text-sm font-normal text-[#636566]">{date}</div>
        </div>
    );
};

export default TimeDisplay;
