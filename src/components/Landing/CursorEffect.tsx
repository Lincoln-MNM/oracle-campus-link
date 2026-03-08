import { useEffect, useRef } from "react";

const CursorEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let mouse = { x: -200, y: -200 };
    let animationId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      x: number; y: number; size: number; speedX: number; speedY: number;
      opacity: number; hue: number; life: number; maxLife: number;
      constructor(x: number, y: number, fromCursor = false) {
        this.x = x;
        this.y = y;
        this.size = fromCursor ? Math.random() * 3 + 1 : Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * (fromCursor ? 3 : 0.3);
        this.speedY = (Math.random() - 0.5) * (fromCursor ? 3 : 0.3);
        this.opacity = fromCursor ? 0.8 : Math.random() * 0.15 + 0.05;
        this.hue = 224 + Math.random() * 20;
        this.life = 0;
        this.maxLife = fromCursor ? 40 + Math.random() * 30 : 300 + Math.random() * 200;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;
        if (this.life > this.maxLife * 0.7) {
          this.opacity *= 0.96;
        }
      }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 76%, 55%, ${this.opacity})`;
        ctx.fill();
      }
      isDead() { return this.life >= this.maxLife || this.opacity < 0.01; }
    }

    // Ambient floating particles
    for (let i = 0; i < 60; i++) {
      particles.push(new Particle(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      ));
    }

    let frame = 0;
    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener("mousemove", onMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cursor glow orb
      const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
      gradient.addColorStop(0, "hsla(224, 76%, 55%, 0.12)");
      gradient.addColorStop(0.4, "hsla(230, 80%, 60%, 0.05)");
      gradient.addColorStop(1, "hsla(224, 76%, 48%, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Spawn cursor trail particles
      frame++;
      if (frame % 2 === 0 && mouse.x > 0) {
        particles.push(new Particle(
          mouse.x + (Math.random() - 0.5) * 20,
          mouse.y + (Math.random() - 0.5) * 20,
          true
        ));
      }

      // Replenish ambient particles
      if (frame % 15 === 0 && particles.filter(p => !p.isDead()).length < 80) {
        particles.push(new Particle(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        ));
      }

      // Draw connections between nearby cursor particles
      const cursorParticles = particles.filter(p => p.size > 1.5 && !p.isDead());
      for (let i = 0; i < cursorParticles.length; i++) {
        for (let j = i + 1; j < cursorParticles.length; j++) {
          const dx = cursorParticles[i].x - cursorParticles[j].x;
          const dy = cursorParticles[i].y - cursorParticles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(cursorParticles[i].x, cursorParticles[i].y);
            ctx.lineTo(cursorParticles[j].x, cursorParticles[j].y);
            ctx.strokeStyle = `hsla(224, 76%, 55%, ${0.15 * (1 - dist / 80)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => { p.update(); p.draw(ctx); });
      particles = particles.filter(p => !p.isDead());

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

export default CursorEffect;
