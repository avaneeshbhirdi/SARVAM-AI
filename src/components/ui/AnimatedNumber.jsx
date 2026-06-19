import React, { useEffect, useState, useRef } from 'react';

export function AnimatedNumber({ value, duration = 400 }) {
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef(null);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = displayValue;
    const targetValue = value;

    if (startValue === targetValue) return;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutCubic for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentVal = Math.floor(startValue + (targetValue - startValue) * easeProgress);
      setDisplayValue(currentVal);

      if (progress < 1) {
        animationRef.current = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValue);
      }
    };

    if (animationRef.current) {
      window.cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = window.requestAnimationFrame(step);

    return () => {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return <span>{displayValue}</span>;
}
