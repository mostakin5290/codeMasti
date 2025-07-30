import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import Header from '../components/layout/Header';
import { useTheme } from '../context/ThemeContext';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FaBug, FaCodeBranch, FaPlay, FaProjectDiagram } from 'react-icons/fa';
import { GiCircuitry } from 'react-icons/gi';
import CodeDubgger from '../components/Tools/CodeDubgger'; // This component will likely be used on the new route

const defaultTheme = {
    background: 'bg-gray-900',
    text: 'text-white',
    primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600',
    secondary: 'bg-blue-600',
    secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800/80',
    cardText: 'text-gray-300',
    border: 'border-gray-700',
    buttonPrimary: 'bg-indigo-600',
    buttonPrimaryHover: 'bg-indigo-700',
    buttonText: 'text-white',
    highlight: 'text-cyan-400',
    highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400',
    iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900',
    gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
    accent: 'bg-cyan-500',
};

const Tools = () => {
    const { theme: themeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...themeFromContext };

    const mountRef = useRef(null);
    const mousePosition = useRef({ x: 0, y: 0 });
    const [showDebugger, setShowDebugger] = useState(false); // This state will no longer control routing, but can still control background animations
    const [activeTab, setActiveTab] = useState('debugger');

    // --- Background Animations ---
    // The background animations should ONLY run when the debugger is not active.
    // The visualizer part is now handled by a separate route/page.
    useEffect(() => {
        // The condition here should ideally check the current route if the animations are global,
        // but for this component, we keep it as is, assuming 'showDebugger' might implicitly
        // represent being on the 'Tools' overview page vs. a dedicated debugger route.
        // If the debugger is moved to a new route, then `showDebugger` should always be false here.
        if (showDebugger) return;

        const container = document.createElement('div');
        container.className = 'fixed inset-0 -z-10 overflow-hidden pointer-events-none';
        document.body.appendChild(container);

        const canvas = document.createElement('canvas');
        canvas.className = 'absolute inset-0 w-full h-full';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class Node {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 2 - 1;
                this.color = `rgba(${
                    Math.floor(Math.random() * 100 + 155)
                }, ${
                    Math.floor(Math.random() * 100 + 155)
                }, ${
                    Math.floor(Math.random() * 100 + 155)
                }, 0.8)`;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const nodes = [];
        const nodeCount = Math.floor(window.innerWidth / 10);
        for (let i = 0; i < nodeCount; i++) {
            nodes.push(new Node());
        }

        let animationId;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            nodes.forEach(node => {
                node.update();
                node.draw();
            });

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(100, 200, 255, ${1 - distance / 150})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            container.remove();
        };
    }, [showDebugger]);

    // Three.js initialization (simplified version)
    useEffect(() => {
        if (showDebugger) return;

        let scene, camera, renderer, controls;
        let cubes = [];
        const numCubes = 15;

        const init = () => {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 25;

            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                powerPreference: "high-performance"
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            if (mountRef.current) {
                mountRef.current.innerHTML = '';
                mountRef.current.appendChild(renderer.domElement);
            }

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
            scene.add(ambientLight);

            const pointLight = new THREE.PointLight(0xffffff, 1, 100);
            pointLight.position.set(10, 10, 10);
            scene.add(pointLight);

            // Create glowing cubes
            for (let i = 0; i < numCubes; i++) {
                const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
                const material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(
                        Math.random() * 0.5 + 0.5,
                        Math.random() * 0.5 + 0.5,
                        Math.random() * 0.5 + 0.5
                    ),
                    metalness: 0.7,
                    roughness: 0.3,
                    emissive: new THREE.Color(
                        Math.random() * 0.5 + 0.5,
                        Math.random() * 0.5 + 0.5,
                        Math.random() * 0.5 + 0.5
                    ),
                    emissiveIntensity: 0.3
                });
                const cube = new THREE.Mesh(geometry, material);

                cube.position.x = (Math.random() - 0.5) * 30;
                cube.position.y = (Math.random() - 0.5) * 30;
                cube.position.z = (Math.random() - 0.5) * 30;

                cubes.push(cube);
                scene.add(cube);
            }

            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
        };

        const animate = () => {
            requestAnimationFrame(animate);

            cubes.forEach(cube => {
                cube.rotation.x += 0.01;
                cube.rotation.y += 0.01;
            });

            if (controls) controls.update();
            if (renderer) renderer.render(scene, camera);
        };

        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        init();
        animate();
        window.addEventListener('resize', onWindowResize);

        return () => {
            window.removeEventListener('resize', onWindowResize);
            if (mountRef.current && renderer?.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            if (renderer) renderer.dispose();
            if (controls) controls.dispose();
        };
    }, [showDebugger]);
    // --- End Background Animations ---

    const sectionClasses = `backdrop-blur-lg border ${theme.border}/30 shadow-2xl rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-${theme.primary.replace('bg-', '')}/20`;

    return (
        <div className={`min-h-screen relative overflow-hidden ${theme.text} bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo}`}>
            <Header />

            {/* Conditional Rendering of Main Content */}
            {/* The CodeDubgger component should now be rendered on its own route, e.g., /tools/debug */}
            {/* So, we remove the direct conditional rendering here */}
            {/* {showDebugger ? (
                <CodeDubgger appTheme={theme} onClose={() => setShowDebugger(false)} />
            ) : ( */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
                    <div className="text-center mb-8">
                        <h1 className={`text-4xl sm:text-6xl font-extrabold mb-4 bg-gradient-to-r ${theme.primary} ${theme.highlight} bg-clip-text text-transparent`}>
                            Code Visualization Studio
                        </h1>
                        <p className={`text-xl ${theme.cardText} max-w-3xl mx-auto leading-relaxed`}>
                            Step into your code with interactive 3D visualizations and real-time debugging.
                        </p>
                    </div>

                    {/* Tab navigation */}
                    <div className={`flex mb-4 p-1 rounded-xl ${theme.cardBg} border ${theme.border}`}>
                        {['debugger', 'visualizer'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    // setShowDebugger(false); // No longer strictly needed if debugger is on its own route
                                }}
                                className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === tab ? `${theme.buttonPrimary} ${theme.buttonText}` : `${theme.cardText} hover:${theme.background}`}`}
                            >
                                {tab === 'debugger' && <FaBug className="inline mr-2" />}
                                {tab === 'visualizer' && <FaProjectDiagram className="inline mr-2" />}
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Tab content (initial state for debugger or visualizer) */}
                    <div className="w-full max-w-5xl">
                        {activeTab === 'debugger' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className={`${sectionClasses} p-8 flex flex-col items-center text-center group`}>
                                    <div className={`p-5 rounded-full ${theme.iconBg} mb-6 transition-all duration-500 group-hover:bg-${theme.primary.replace('bg-', '')}/20`}>
                                        <FaBug className={`h-12 w-12 ${theme.highlight} group-hover:${theme.primary} transition-colors duration-500`} />
                                    </div>
                                    <h2 className={`text-2xl font-bold mb-4 ${theme.text}`}>
                                        Interactive Debugger
                                    </h2>
                                    <p className={`${theme.cardText} mb-6`}>
                                        Execute your code line by line with visual variable tracking and call stack visualization.
                                    </p>
                                    {/* MODIFIED: Changed button to Link */}
                                    <Link
                                        to="/tools/debug" // Target route for the debugger
                                        className={`px-8 py-3 rounded-lg ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} font-semibold transition-all flex items-center`}
                                    >
                                        <FaPlay className="mr-2" /> Start Debug Session
                                    </Link>
                                </div>

                                <div className={`${sectionClasses} p-8 flex flex-col`}>
                                    <h3 className={`text-xl font-semibold mb-4 ${theme.highlight} flex items-center`}>
                                        <FaBug className="mr-2" /> Debugging Features
                                    </h3>
                                    <ul className="space-y-4">
                                        {[
                                            "Step-through execution",
                                            "Real-time variable inspection",
                                            "Visual call stack",
                                            "Breakpoint management",
                                            "Execution history timeline"
                                        ].map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className={`inline-block mr-3 mt-1 ${theme.successColor}`}>✓</span>
                                                <span className={theme.cardText}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeTab === 'visualizer' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className={`${sectionClasses} p-8 flex flex-col items-center text-center group`}>
                                        <div className={`p-5 rounded-full ${theme.iconBg} mb-6 transition-all duration-500 group-hover:bg-${theme.secondary.replace('bg-', '')}/20`}>
                                            <FaProjectDiagram className={`h-12 w-12 ${theme.highlightSecondary} group-hover:${theme.secondary} transition-colors duration-500`} />
                                        </div>
                                        <h2 className={`text-2xl font-bold mb-4 ${theme.text}`}>
                                            Data Structure & Algorithm Visualizer
                                        </h2>
                                        <p className={`${theme.cardText} mb-6`}>
                                            Watch your data structures and algorithms come to life with animated 3D representations.
                                        </p>
                                        <Link
                                            to="/tools/visualizer"
                                            className={`px-8 py-3 rounded-lg ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText} font-semibold transition-all flex items-center`}
                                        >
                                            <FaPlay className="mr-2" /> Explore Visualizations
                                        </Link>
                                    </div>

                                    <div className={`${sectionClasses} p-8 flex flex-col`}>
                                        <h3 className={`text-xl font-semibold mb-4 ${theme.highlightSecondary} flex items-center`}>
                                            <GiCircuitry className="mr-2" /> Supported Visualizations
                                        </h3>
                                        <ul className="space-y-4">
                                            {[
                                                "Sorting Algorithms (e.g., Bubble, Quick, Merge)",
                                                "Searching Algorithms (e.g., Linear, Binary)",
                                                "Tree Structures (e.g., Binary Search Tree, AVL)",
                                                "Graph Algorithms (e.g., BFS, DFS, Dijkstra's)",
                                                "Linked Lists & Stacks/Queues"
                                            ].map((structure, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className={`inline-block mr-3 mt-1 ${theme.successColor}`}>✓</span>
                                                    <span className={theme.cardText}>{structure}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            {/* ) // Closing the conditional rendering block */}

            {/* Three.js Canvas Container - More subtle background */}
            <div ref={mountRef} className="fixed inset-0 -z-10 opacity-20 pointer-events-none" />
        </div>
    );
};

export default Tools;