import { useEffect, useRef } from "react";

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Algorithm-related code snippets
    const codeSnippets = [
      "for(i=0;i<n;i++)",
      "while(left<right)",
      "if(arr[i]>max)",
      "O(log n)",
      "merge(left,right)",
      "quicksort(arr)",
      "Binary Search",
      "DFS(node)",
      "BFS(queue)",
      "dp[i][j]",
      "tree.insert()",
      "hash.get(key)",
    ];

    // Falling code particles
    class CodeParticle {
      x: number;
      y: number;
      speed: number;
      text: string;
      opacity: number;
      size: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.speed = 0.5 + Math.random() * 1.5;
        this.text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        this.opacity = 0.1 + Math.random() * 0.2;
        this.size = 12 + Math.random() * 8;
      }

      update() {
        this.y += this.speed;
        if (this.y > canvas.height + 50) {
          this.y = -50;
          this.x = Math.random() * canvas.width;
          this.text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        }
      }

      draw() {
        if (!ctx) return;
        ctx.font = `${this.size}px 'Courier New', monospace`;
        ctx.fillStyle = `hsla(193, 100%, 50%, ${this.opacity})`;
        ctx.fillText(this.text, this.x, this.y);
      }
    }

    // Network nodes
    class Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      connections: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = 2 + Math.random() * 3;
        this.connections = 0;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(270, 70%, 65%, 0.4)";
        ctx.fill();
      }
    }

    // Binary rain
    class BinaryDrop {
      x: number;
      y: number;
      speed: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.speed = 2 + Math.random() * 3;
        this.opacity = 0.1 + Math.random() * 0.15;
      }

      update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
          this.y = -20;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        if (!ctx) return;
        const binary = Math.random() > 0.5 ? "1" : "0";
        ctx.font = "14px 'Courier New', monospace";
        ctx.fillStyle = `hsla(160, 100%, 50%, ${this.opacity})`;
        ctx.fillText(binary, this.x, this.y);
      }
    }

    // Create particles
    const codeParticles: CodeParticle[] = [];
    const nodes: Node[] = [];
    const binaryDrops: BinaryDrop[] = [];

    for (let i = 0; i < 15; i++) {
      codeParticles.push(new CodeParticle());
    }

    for (let i = 0; i < 50; i++) {
      nodes.push(new Node());
    }

    for (let i = 0; i < 30; i++) {
      binaryDrops.push(new BinaryDrop());
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = "rgba(13, 15, 23, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections between nodes
      nodes.forEach((node, i) => {
        node.connections = 0;
        nodes.forEach((otherNode, j) => {
          if (i !== j) {
            const dx = node.x - otherNode.x;
            const dy = node.y - otherNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150 && node.connections < 3) {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(otherNode.x, otherNode.y);
              ctx.strokeStyle = `hsla(193, 100%, 50%, ${0.1 - distance / 1500})`;
              ctx.lineWidth = 1;
              ctx.stroke();
              node.connections++;
            }
          }
        });
      });

      // Update and draw all elements
      binaryDrops.forEach((drop) => {
        drop.update();
        drop.draw();
      });

      codeParticles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      nodes.forEach((node) => {
        node.update();
        node.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: "hsl(230 35% 7%)" }}
    />
  );
};

export default AnimatedBackground;
