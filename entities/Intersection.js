import * as THREE from 'three';

export class Intersection {
    constructor() {
        this.mesh = new THREE.Group();
        this.createRoads();
    }

    createRoads() {
        const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

        // Dimensiones del camino
        const roadWidth = 10;
        const roadLength = 40;

        // Centro
        const centerParams = [roadWidth, 0.1, roadWidth];
        const centerGeo = new THREE.BoxGeometry(...centerParams);
        const center = new THREE.Mesh(centerGeo, roadMaterial);
        center.position.y = 0.05; // Un poco sobre 0 para evitar z-fighting con el plano del suelo
        this.mesh.add(center);

        // Brazos
        const rotations = [0, Math.PI / 2];

        // Dos franjas cruzadas forman la intersección
        const stripLength = roadLength * 2 + roadWidth;
        const stripGeo = new THREE.BoxGeometry(roadWidth, 0.1, stripLength);

        // Usamos dos boxes cruzados para las calles para tener la cruz (Para simplificar la superposicion del punto de cruce)
        // Calle vertical (North-South)
        const vRoad = new THREE.Mesh(stripGeo, roadMaterial);
        vRoad.position.y = 0.05;
        this.mesh.add(vRoad);

        // Calle horizontal(East-West)
        const hRoad = new THREE.Mesh(stripGeo, roadMaterial);
        hRoad.rotation.y = Math.PI / 2;
        hRoad.position.y = 0.05;
        this.mesh.add(hRoad);

        // Marcas viales (líneas)
        // Líneas discontinuas centrales
        this.createMarkings(markingMaterial, roadWidth, roadLength);
    }

    createMarkings(material, width, length) {
        // Líneas discontinuas centrales
        // Para la vía vertical
        for (let z = -length - width / 2; z <= length + width / 2; z += 4) {
            if (z > -width / 2 && z < width / 2) continue; // Skip intersection center
            const markGeo = new THREE.PlaneGeometry(0.5, 2);
            const mark = new THREE.Mesh(markGeo, material);
            mark.rotation.x = -Math.PI / 2;
            mark.position.set(0, 0.11, z);
            this.mesh.add(mark);
        }

        // For horizontal road
        for (let x = -length - width / 2; x <= length + width / 2; x += 4) {
            if (x > -width / 2 && x < width / 2) continue;
            const markGeo = new THREE.PlaneGeometry(2, 0.5);
            const mark = new THREE.Mesh(markGeo, material);
            mark.rotation.x = -Math.PI / 2;
            mark.position.set(x, 0.11, 0);
            this.mesh.add(mark);
        }
    }
}
