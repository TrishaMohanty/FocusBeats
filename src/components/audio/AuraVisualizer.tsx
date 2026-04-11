import { useEffect, useRef } from 'react';
import { useAudio } from '../../contexts/AudioContext';

interface AuraVisualizerProps {
  color?: string; // Hex color for the aura
}

export function AuraVisualizer({ color = '#10b981' }: AuraVisualizerProps) {
  const { analyser, isPlaying } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Average low frequencies for the "pulse"
      const bassValue = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
      const midValue = dataArray.slice(10, 50).reduce((a, b) => a + b, 0) / 40;
      
      const normalizedBass = bassValue / 255;
      const normalizedMid = midValue / 255;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Draw Inner Core (Sharp)
      const coreSize = 100 + (normalizedBass * 40);
      const gradient = ctx.createRadialGradient(centerX, centerY, coreSize * 0.2, centerX, centerY, coreSize);
      gradient.addColorStop(0, `${color}44`); // 25% opacity
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw Outer Aura (Soft/Bloom)
      const auraSize = 250 + (normalizedMid * 100);
      const auraGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, auraSize);
      auraGradient.addColorStop(0, `${color}11`); // Very low opacity
      auraGradient.addColorStop(0.5, `${color}05`);
      auraGradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, auraSize, 0, Math.PI * 2);
      ctx.fillStyle = auraGradient;
      ctx.fill();

      // Draw Subtle Waveform rings
      if (normalizedMid > 0.3) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreSize + 20, 0, Math.PI * 2);
        ctx.strokeStyle = `${color}22`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    if (isPlaying) {
      draw();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isPlaying, color]);

  return (
    <canvas 
      ref={canvasRef}
      width={1000}
      height={1000}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] pointer-events-none opacity-40 mix-blend-screen scale-125"
    />
  );
}
