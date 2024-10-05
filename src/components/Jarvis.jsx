import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { FaMicrophone, FaPaperPlane, FaPaperclip } from 'react-icons/fa';
import './Jarvis.css';



const Jarvis = () => {
  const [message, setMessage] = useState('');
  const mountRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, torus, particles, animationId, glowtorus;

    const init = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 1);
      mountRef.current.appendChild(renderer.domElement);

      const geometry = new THREE.TorusGeometry(2, 0.5, 16, 100);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      });
      torus = new THREE.Mesh(geometry, material);
      scene.add(torus);

      const glowGeometry = new THREE.TorusGeometry(2.1, 32, 32);
      const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
          c: { type: "f", value: 0.5 },
          p: { type: "f", value: 4.0 },
          glowColor: { type: "c", value: new THREE.Color(0x00ffff) },
          viewVector: { type: "v3", value: camera.position }
        },
        vertexShader: `
          uniform vec3 viewVector;
          varying float intensity;
          void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));
            intensity = pow(dot(normalize(viewVector), actual_normal), 8.0);
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          varying float intensity;
          void main() {
            vec3 glow = glowColor * intensity;
            gl_FragColor = vec4(glow, 1.0);
          }
        `,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      });
      glowtorus = new THREE.Mesh(glowGeometry, glowMaterial);
      scene.add(glowtorus);

      const particlesGeometry = new THREE.BufferGeometry();
      const particlePositions = [];
      const particlesCount = 2000;

      for (let i = 0; i < particlesCount; i++) {
        const x = Math.random() * 8 - 4;
        const y = Math.random() * 8 - 4;
        const z = Math.random() * 8 - 4;
        particlePositions.push(x, y, z);
      }

      particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
      const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.012,
        transparent: true,
        opacity: 0.9,
      });
      particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);

      camera.position.z = 5;
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      torus.rotation.y += 0.01;
      glowtorus.rotation.y += 0.01;

      particles.rotation.x += 0.0002;
      particles.rotation.y += 0.0003;

      renderer.render(scene, camera);
    };

    init();
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);
  

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Message sent:', message);
    setMessage('');
  };
  const handleMicClick = () => {
    if (typeof window.eel !== 'undefined') {
      window.eel.takecommand()().then((result) => {
        console.log(result);
        setMessage(result);
      }).catch((error) => {
        console.error('Error calling takecommand:', error);
      });
    } else {
      console.error('Eel is not defined');
    }
  };
  return (
    <div className="jarvis-container">
      <div ref={mountRef} className="ai-animation-container"></div>
      <div className="jarvis-text">J.A.R.V.I.S</div>
      <div className="input-container container">
        <form onSubmit={handleSubmit} className="row align-items-center">
          <div className="col-12 col-md-8 mb-2 mb-md-0">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask Jarvis..."
              className="form-control"
            />
          </div>
          <div className="col-12 col-md-4 text-md-end">
            <div className="button-container d-flex justify-content-between">
              <button
                type="button"
                className="icon-button btn btn-light me-2"
                onClick={handleMicClick}
              >
                <FaMicrophone />
              </button>
              <button type="submit" className="icon-button btn btn-light me-2">
                <FaPaperPlane />
              </button>
              <button type="button" className="icon-button btn btn-light">
                <FaPaperclip />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Jarvis;
