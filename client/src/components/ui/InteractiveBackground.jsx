import React, { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const hexSize = 45;
    const hexHeight = hexSize * 2;
    const hexWidth = Math.sqrt(3) * hexSize;
    const mouseRadius = 250; // Slightly smaller interaction area
    
    let scanPos = 0;
    const scanSpeed = 1.2; // Slower, more subtle scan

    let hexes = [];
    let mouse = { x: null, y: null };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    class Hexagon {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.brightness = 0;
        this.scale = 1;
      }

      update() {
        let dist = Infinity;
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          dist = Math.sqrt(dx * dx + dy * dy);
        }

        const scanDist = Math.abs(this.y - scanPos);
        const scanForce = scanDist < 120 ? (120 - scanDist) / 120 : 0;

        if (dist < mouseRadius) {
          const force = (mouseRadius - dist) / mouseRadius;
          this.brightness = Math.max(this.brightness, force);
          this.scale = 1 + force * 0.08; // Less dramatic scaling
        } else {
          this.brightness = Math.max(this.brightness * 0.94, scanForce * 0.15); // Lower scan brightness
          this.scale = 1 + (this.scale - 1) * 0.94;
        }
      }

      draw() {
        const size = hexSize * this.scale;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          ctx.lineTo(
            this.x + size * Math.cos((Math.PI / 3) * i + Math.PI / 6),
            this.y + size * Math.sin((Math.PI / 3) * i + Math.PI / 6)
          );
        }
        ctx.closePath();

        // More subtle lines for light mode
        const alpha = 0.02 + this.brightness * 0.1; 
        ctx.strokeStyle = `rgba(15, 23, 42, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Softer glow fill without expensive shadowBlur
        if (this.brightness > 0.1) {
            ctx.fillStyle = `rgba(56, 189, 248, ${this.brightness * 0.08})`;
            ctx.fill();
        }
      }
    }

    const init = () => {
      hexes = [];
      const columns = Math.ceil(canvas.width / hexWidth) + 1;
      const rows = Math.ceil(canvas.height / (hexHeight * 0.75)) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
          let x = c * hexWidth;
          let y = r * hexHeight * 0.75;
          if (r % 2 === 1) x += hexWidth / 2;
          hexes.push(new Hexagon(x, y));
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      scanPos += scanSpeed;
      if (scanPos > canvas.height + 200) scanPos = -200;

      hexes.forEach((hex) => {
        hex.update();
        hex.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    handleResize();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}
