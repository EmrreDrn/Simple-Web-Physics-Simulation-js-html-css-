import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MouseController } from './MouseController.js';
import * as dat from 'dat.gui';


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020202); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace; 
renderer.toneMapping = THREE.LinearToneMapping; 
renderer.toneMappingExposure = 1.0; 

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 20, 20);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const world = new CANNON.World();
world.gravity.set(0, -9.81, 0);
const mouseCtrl = new MouseController(camera, scene, world, renderer);

// --- LIGHTING AND SHADOWS ---
const topLight = new THREE.DirectionalLight(0xffffff, 3);
topLight.position.set(5, 30, 5);
topLight.castShadow = true;
topLight.shadow.mapSize.set(2048, 2048);
scene.add(topLight);

const ambient = new THREE.AmbientLight(0xffffff, 0.4); // Slightly brightens shadows without changing colors
scene.add(ambient);

// --- GROUND ---
const groundMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.5 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(new CANNON.Plane());
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// --- OBJECT SYSTEM ---
const objects = [];
const settings = {
    type: 'box',
    mass: 5,
    customColor: '#ff00ff', // Default pink
    randomColor: false,     // Off by default so selected color is applied
    spawn: () => {
        let shape, geo;
        const size = 2;
        
        // COLOR LOGIC FIXED:
        const finalColor = new THREE.Color();
        if (settings.randomColor) {
            finalColor.setHSL(Math.random(), 0.8, 0.5);
        } else {
            // Directly use the hex string (pink, blue, etc.) in correct color space
            finalColor.set(settings.customColor); 
        }

        const mat = new THREE.MeshStandardMaterial({ 
            color: finalColor, 
            roughness: 0.2, 
            metalness: 0.1
        });

        // SHAPE OPTIONS
        if (settings.type === 'Box') {
            shape = new CANNON.Box(new CANNON.Vec3(size/2, size/2, size/2));
            geo = new THREE.BoxGeometry(size, size, size);
        } else if (settings.type === 'Sphere') {
            shape = new CANNON.Sphere(size/2);
            geo = new THREE.SphereGeometry(size/2, 32, 32);
        } else if (settings.type === 'Cylinder') {
            shape = new CANNON.Cylinder(size/2, size/2, size, 16);
            geo = new THREE.CylinderGeometry(size/2, size/2, size, 16);
        } else {
            shape = new CANNON.Cylinder(0, size/2, size, 16);
            geo = new THREE.ConeGeometry(size/2, size, 16);
        }

        const body = new CANNON.Body({ mass: settings.mass, shape: shape });
        body.position.set(Math.random()*4-2, 15, Math.random()*4-2);
        
        world.addBody(body);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.userData.physicsBody = body;
        scene.add(mesh);
        objects.push({ mesh, body });
    }
};

// --- GUI (UPDATED) ---
const gui = new dat.GUI();
gui.add(settings, 'type', ['Box', 'Sphere', 'Cylinder', 'Cone']).name("Shape");
gui.add(settings, 'mass', 0.1, 100).name("Mass (kg)");
gui.addColor(settings, 'customColor').name("Select Color"); // Selecting pink now works
gui.add(settings, 'randomColor').name("Random?");
gui.add(world.gravity, 'y', -40, 0).name("Gravity");
gui.add(settings, 'spawn').name("🔥 SPAWN OBJECT");

// --- LOOP ---
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.1);
    world.step(1/60, dt, 3);
    objects.forEach(obj => {
        obj.mesh.position.copy(obj.body.position);
        obj.mesh.quaternion.copy(obj.body.quaternion);
    });
    controls.update();
    renderer.render(scene, camera);
}
animate();
