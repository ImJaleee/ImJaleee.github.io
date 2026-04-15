// Only init if webgl container exists
if (document.getElementById('webgl-container') && typeof THREE !== 'undefined') {
    initThreeScene();
}

function initThreeScene() {
    const container = document.getElementById('webgl-container');
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Shapes
    const shapes = [];
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00d4ff, 
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });

    const purpleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x7c3aed, 
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });

    // Generate Icosahedrons
    const geo1 = new THREE.IcosahedronGeometry(2, 0);
    const mesh1 = new THREE.Mesh(geo1, material);
    mesh1.position.set(-5, 2, -5);
    shapes.push({ mesh: mesh1, rx: 0.005, ry: 0.01 });
    scene.add(mesh1);

    const geo2 = new THREE.TorusGeometry(3, 1, 16, 100);
    const mesh2 = new THREE.Mesh(geo2, purpleMaterial);
    mesh2.position.set(6, -2, -8);
    shapes.push({ mesh: mesh2, rx: 0.01, ry: 0.005 });
    scene.add(mesh2);

    const geo3 = new THREE.OctahedronGeometry(1.5, 0);
    const mesh3 = new THREE.Mesh(geo3, material);
    mesh3.position.set(0, -5, -4);
    shapes.push({ mesh: mesh3, rx: 0.01, ry: 0.01 });
    scene.add(mesh3);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0xffffff,
        transparent: true,
        opacity: 0.5
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particlesMesh);

    camera.position.z = 5;

    // Mouse movement
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        shapes.forEach(shape => {
            shape.mesh.rotation.x += shape.rx;
            shape.mesh.rotation.y += shape.ry;
            
            // Subtle parallax
            shape.mesh.position.x += (targetX - shape.mesh.position.x) * 0.02;
            shape.mesh.position.y += (-targetY - shape.mesh.position.y) * 0.02;
        });

        particlesMesh.rotation.y += 0.001;
        particlesMesh.position.x += (targetX - particlesMesh.position.x) * 0.05;
        particlesMesh.position.y += (-targetY - particlesMesh.position.y) * 0.05;

        renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
