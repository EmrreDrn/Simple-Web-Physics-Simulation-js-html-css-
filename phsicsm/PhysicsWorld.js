import * as CANNON from 'cannon-es';

export class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.81, 0);
        this.world.allowSleep = true;
        
        // Çarpışma materyali
        const defaultMat = new CANNON.Material("default");
        const contactMat = new CANNON.ContactMaterial(defaultMat, defaultMat, {
            friction: 0.5,
            restitution: 0.5
        });
        this.world.addContactMaterial(contactMat);
    }

    updateGravity(g) {
        this.world.gravity.set(0, g, 0);
    }

    step(dt) {
        this.world.step(1/60, dt, 3);
    }
}