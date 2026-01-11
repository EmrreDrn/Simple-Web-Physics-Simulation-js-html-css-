import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class MouseController {
    constructor(camera, scene, world, renderer) {
        this.camera = camera;
        this.scene = scene;
        this.world = world;
        this.renderer = renderer;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.jointBody = new CANNON.Body({ mass: 0 });
        this.jointBody.addShape(new CANNON.Sphere(0.1));
        this.jointBody.collisionFilterGroup = 0; 
        this.world.addBody(this.jointBody);
        this.mouseConstraint = null;

        this.renderer.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mouseup', () => this.onMouseUp());
    }

    onMouseDown(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);
        const hit = intersects.find(i => i.object.userData.physicsBody);

        if (hit) {
            const body = hit.object.userData.physicsBody;
            body.wakeUp();
            const pos = hit.point;
            this.jointBody.position.copy(pos);
            const localPivot = new CANNON.Vec3().copy(pos).vsub(body.position);
            this.mouseConstraint = new CANNON.PointToPointConstraint(body, localPivot, this.jointBody, new CANNON.Vec3(0,0,0));
            this.world.addConstraint(this.mouseConstraint);
        }
    }

    onMouseMove(e) {
        if (this.mouseConstraint) {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const targetPos = new THREE.Vector3();
            this.raycaster.ray.at(12, targetPos); // 12 birim derinlikte tut
            this.jointBody.position.copy(targetPos);
        }
    }

    onMouseUp() {
        if (this.mouseConstraint) {
            this.world.removeConstraint(this.mouseConstraint);
            this.mouseConstraint = null;
        }
    }
}