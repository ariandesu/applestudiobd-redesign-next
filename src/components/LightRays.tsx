"use client";

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

interface LightRaysProps {
  raysOrigin?: 'top-center' | 'top-left' | 'top-right' | 'center';
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  pulsating?: boolean;
  followMouse?: boolean;
  mouseInfluence?: number;
  className?: string;
}

export default function LightRays({
  raysOrigin = 'top-center',
  raysColor = '#b4a896', /* warm cream-gold to match palette */
  raysSpeed = 0.6,
  lightSpread = 0.9,
  rayLength = 1.6,
  pulsating = true,
  followMouse = true,
  mouseInfluence = 0.12,
  className = '',
}: LightRaysProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 1.5),
        alpha: true,
        premultipliedAlpha: true,
      });
    } catch {
      // WebGL unavailable (older devices, disabled GPU, etc.) — fail silently
      // instead of taking down the whole page.
      return;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const vertexShader = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uSpeed;
      uniform float uSpread;
      uniform float uRayLength;
      uniform vec3 uRayColor;
      uniform vec2 uOrigin;
      uniform float uPulsating;
      
      #define PI 3.14159265359
      
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      float rays(vec2 uv, vec2 origin, float time) {
        vec2 dir = uv - origin;
        float angle = atan(dir.y, dir.x);
        float dist = length(dir);
        
        float beam = 0.0;
        float mouseInfluence = uMouse.x * 0.5 + 0.5;
        
        for (float i = 0.0; i < 8.0; i++) {
          float a = (i / 8.0) * PI * 2.0 + time * 0.08 * uSpeed;
          float mouseShift = sin(time * 0.3 + i * 1.7) * 0.15 * mouseInfluence;
          a += mouseShift;
          
          float diff = abs(angle - a);
          diff = min(diff, PI * 2.0 - diff);
          
          float intensity = 1.0 - smoothstep(0.0, uSpread, diff);
          intensity *= 1.0 / (1.0 + dist * (3.0 / uRayLength));
          intensity *= smoothstep(0.0, 0.3, dist);
          
          beam += intensity * (0.3 + 0.7 * noise(vec2(i * 3.1, time * 0.1)));
        }
        
        return beam;
      }
      
      void main() {
        vec2 uv = vUv;
        vec2 origin = uOrigin;
        
        float time = uTime * uSpeed;
        float beam = rays(uv, origin, time);
        
        float pulse = mix(1.0, 0.7 + 0.3 * sin(time * 0.5), uPulsating);
        beam *= pulse;
        
        float fadeTop = smoothstep(0.0, 0.4, uv.y);
        beam *= fadeTop;
        
        vec3 color = uRayColor * beam * 0.45;
        float alpha = beam * 0.35;
        
        gl_FragColor = vec4(color, alpha);
      }
    `;

    let geometry: Mesh;
    try {
      geometry = new Mesh(gl, {
        geometry: new Triangle(gl),
        program: new Program(gl, {
          vertex: vertexShader,
          fragment: fragmentShader,
          uniforms: {
            uTime: { value: 0 },
            uMouse: { value: [0.5, 0.5] },
            uSpeed: { value: raysSpeed },
            uSpread: { value: lightSpread },
            uRayLength: { value: rayLength },
            uRayColor: { value: hexToVec3(raysColor) },
            uOrigin: { value: getOrigin(raysOrigin) },
            uPulsating: { value: pulsating ? 1 : 0 },
          },
          transparent: true,
          depthTest: false,
        }),
      });
    } catch {
      // Shader/WebGL failure should never crash the app.
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return;
    }

    const resize = () => {
      renderer.setSize(container.offsetWidth, container.offsetHeight);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      if (!followMouse) return;
      targetMouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * mouseInfluence * 2,
        y: (e.clientY / window.innerHeight - 0.5) * mouseInfluence * 2,
      };
    };
    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.04;

      geometry.program.uniforms.uTime.value += 0.016;
      geometry.program.uniforms.uMouse.value = [
        mouseRef.current.x,
        mouseRef.current.y,
      ];

      renderer.render({ scene: geometry });
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    container.appendChild(gl.canvas);
    gl.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [raysOrigin, raysColor, raysSpeed, lightSpread, rayLength, pulsating, followMouse, mouseInfluence]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}

function getOrigin(origin: string): [number, number] {
  switch (origin) {
    case 'top-left': return [0.1, 0.0];
    case 'top-right': return [0.9, 0.0];
    case 'center': return [0.5, 0.5];
    default: return [0.5, 0.05];
  }
}