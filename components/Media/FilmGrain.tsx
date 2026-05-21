"use client";

import { useEffect, useRef } from 'react';

type FilmGrainProps = {
    strength?: number; // e.g., 0.05 for a subtle effect
    opacity?: number;  // e.g., 0.1 for 10% opacity
};

/**
 * A client component that applies a canvas-based film grain effect.
 * Designed for creating atmospheric, horror, or retro-themed visuals.
 */
export const FilmGrain = ({ strength = 0.05, opacity = 0.1 }: FilmGrainProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = window.innerWidth;
        let h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;

        let animationFrameId: number;
        let noiseData: ImageData[] = [];
        const noiseFrames = 10;

        // Generate several frames of noise to loop through
        const createNoise = () => {
            noiseData = []; // Clear existing noise data
            for (let i = 0; i < noiseFrames; i++) {
                const idata = ctx.createImageData(w, h);
                const buffer32 = new Uint32Array(idata.data.buffer);
                const len = buffer32.length;

                for (let j = 0; j < len; j++) {
                    // Apply grain based on the strength prop
                    if (Math.random() < strength) {
                        // Create a random grayscale value for the grain
                        const value = Math.floor(Math.random() * 255);
                        buffer32[j] =
                            (255   << 24) |    // alpha
                            (value << 16) |    // red
                            (value <<  8) |    // green
                            value;             // blue
                    }
                }
                noiseData.push(idata);
            }
        };

        let frame = 0;
        const loop = () => {
            frame = (frame + 1) % noiseFrames;
            if (noiseData[frame]) {
                ctx.putImageData(noiseData[frame], 0, 0);
            }
            animationFrameId = window.requestAnimationFrame(loop);
        };

        const handleResize = () => {
            w = window.innerWidth;
            h = window.innerHeight;
            if (canvas) {
                canvas.width = w;
                canvas.height = h;
            }
            // Re-create noise for the new canvas dimensions
            createNoise();
        };

        createNoise();
        loop();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.cancelAnimationFrame(animationFrameId);
        };

    }, [strength]); // Re-run effect if strength changes

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full z-50 pointer-events-none"
            style={{ opacity }} // Control opacity via style prop
        />
    );
};
