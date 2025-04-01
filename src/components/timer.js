import {useState, useEffect, useRef} from 'react';
import {GAME_CONFIG} from '../config/config';

export const useCountdownTimer = (initialValue = GAME_CONFIG.DEFAULT_TIMER_SECONDS) => {
    const [seconds, setSeconds] = useState(initialValue);
    const timerRef = useRef(null);

    const startTimer = () => {
        clearInterval(timerRef.current);
        setSeconds(initialValue);

        timerRef.current = setInterval(() => {
            setSeconds(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
    };

    const stopTimer = () => {
        clearInterval(timerRef.current);
        return initialValue - seconds;
    };

    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    return {
        seconds,
        startTimer,
        stopTimer,
        formattedTime: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
    };
};
