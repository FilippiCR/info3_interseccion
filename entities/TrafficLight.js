import * as THREE from 'three';

export class TrafficLight {
    constructor() {
        this.mesh = new THREE.Group();
        this.lights = {}; // Referencias a las mallas para cambiar colores
        this.createStructure();
        this.state = 'red';
        this.updateVisuals();
    }

    createStructure() {
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5 });
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x222222 });

        // Poste
        const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 5);
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 2.5;
        this.mesh.add(pole);

        // Caja del semáforo
        const boxGeo = new THREE.BoxGeometry(1, 2.5, 1);
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.set(0, 4, 0);
        this.mesh.add(box);

        // Luces (verde, amarilla, roja de abajo hacia arriba)
        this.lights.green = this.createLightMesh(0, 3.2, 0.5);
        this.lights.yellow = this.createLightMesh(0, 4.0, 0.5);
        this.lights.red = this.createLightMesh(0, 4.8, 0.5);
    }

    createLightMesh(x, y, z) {
        const geo = new THREE.SphereGeometry(0.3);
        const mat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x000000 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        this.mesh.add(mesh);
        return mesh;
    }

    setState(state) {
        this.state = state;
        this.updateVisuals();
    }

    updateVisuals() {
        // Reset all
        this.lights.red.material.emissive.setHex(0x000000);
        this.lights.yellow.material.emissive.setHex(0x000000);
        this.lights.green.material.emissive.setHex(0x000000);

        // Set active
        switch (this.state) {
            case 'red':
                this.lights.red.material.emissive.setHex(0xFF0000);
                break;
            case 'yellow':
                this.lights.yellow.material.emissive.setHex(0xFFFF00);
                break;
            case 'green':
                this.lights.green.material.emissive.setHex(0x00FF00);
                break;
        }
    }
}
