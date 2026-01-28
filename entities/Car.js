import * as THREE from 'three';

export class Car {
    constructor() {
        this.mesh = new THREE.Group();

        // Ajustes / estado
        this.color = '#ff0000';
        this.hasPassenger = false;
        this.doorOpen = 0; // 0 to 1
        this.lightsOn = false;

        this.materials = {
            body: new THREE.MeshStandardMaterial({ color: this.color }),
            glass: new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5, metalness: 0.9, roughness: 0.1 }),
            tire: new THREE.MeshStandardMaterial({ color: 0x111111 }),
            rim: new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 }),
            interior: new THREE.MeshLambertMaterial({ color: 0x553311 })
        };

        this.parts = {};
        this.buildCar();
    }

    buildCar() {
        // Dimensiones del compacto estilizado (aprox.)
        const width = 1.8;
        const length = 4.2;
        const bodyHeight = 0.65;
        const cabinHeight = 0.9;
        const cabinLength = 2.3;
        const cabinWidth = 1.55;
        const wheelRadius = 0.36;
        const wheelThickness = 0.28;
        const groundClearance = 0.18;

        // Carrocería principal
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(width, bodyHeight, length),
            this.materials.body
        );
        body.position.y = wheelRadius + groundClearance + bodyHeight / 2;
        this.mesh.add(body);
        this.parts.body = body;

        // Capó inclinado
        const hood = new THREE.Mesh(
            new THREE.BoxGeometry(width * 0.95, bodyHeight * 0.25, length * 0.3),
            this.materials.body
        );
        hood.position.set(0, body.position.y + bodyHeight * 0.25, length * 0.28);
        hood.rotation.x = -0.18;
        this.mesh.add(hood);

        // Cabina (carrocería pintada)
        const cabin = new THREE.Mesh(
            new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength),
            this.materials.body
        );
        cabin.position.set(0, body.position.y + bodyHeight / 2 + cabinHeight / 2 - 0.1, -0.2);
        this.mesh.add(cabin);
        this.parts.cabin = cabin;

        // Superficies de vidrio
        const glassMat = this.materials.glass;
        const winY = cabin.position.y;
        const frontZ = cabin.position.z + cabinLength / 2 + 0.01;
        const rearZ = cabin.position.z - cabinLength / 2 - 0.01;
        const sideX = cabinWidth / 2 + 0.01;

        const windshield = new THREE.Mesh(new THREE.PlaneGeometry(cabinWidth, cabinHeight * 0.7), glassMat);
        windshield.position.set(0, winY, frontZ);
        windshield.rotation.x = -0.25;
        this.mesh.add(windshield);

        const rearWindow = new THREE.Mesh(new THREE.PlaneGeometry(cabinWidth, cabinHeight * 0.6), glassMat);
        rearWindow.position.set(0, winY, rearZ);
        rearWindow.rotation.y = Math.PI;
        this.mesh.add(rearWindow);

        const leftWindow = new THREE.Mesh(new THREE.PlaneGeometry(cabinLength * 0.85, cabinHeight * 0.6), glassMat);
        leftWindow.position.set(-sideX, winY, cabin.position.z);
        leftWindow.rotation.y = Math.PI / 2;
        this.mesh.add(leftWindow);

        const rightWindow = new THREE.Mesh(new THREE.PlaneGeometry(cabinLength * 0.85, cabinHeight * 0.6), glassMat);
        rightWindow.position.set(sideX, winY, cabin.position.z);
        rightWindow.rotation.y = -Math.PI / 2;
        this.mesh.add(rightWindow);

        // Ruedas (cilindros redondeados)
        this.createWheels(width, length, wheelRadius, wheelThickness, wheelRadius + groundClearance);

        // Puertas (paneles simples)
        this.parts.doorLeft = this.createDoor('left', width, bodyHeight, length, wheelRadius + groundClearance);
        this.parts.doorRight = this.createDoor('right', width, bodyHeight, length, wheelRadius + groundClearance);

        // Faros (cajas pequeñas brillantes)
        this.createHeadlights(width, bodyHeight, length, wheelRadius + groundClearance);

        // Limpiaparabrisas (barras en la base del parabrisas)
        this.parts.wipers = this.createWipers(cabinWidth, cabinHeight, cabinLength, windshield.position);

        // Interior (conductor/pasajero)
        this.createInterior(width, bodyHeight, length);
    }

    createDoor(side, carWidth, bodyHeight, carLength, wheelY) {
        const group = new THREE.Group();
        const doorWidth = 0.08;
        const doorLength = carLength * 0.55;
        const doorHeight = bodyHeight * 0.95;

        const mesh = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, doorLength), this.materials.body);
        mesh.position.z = 0;
        group.add(mesh);

        const xOffset = (carWidth / 2 + doorWidth / 2) * (side === 'left' ? -1 : 1);
        group.position.set(xOffset, wheelY + doorHeight / 2, -carLength * 0.05);
        this.mesh.add(group);
        return group;
    }

    createWipers(cabinWidth, cabinHeight, cabinLength, cabinPos) {
        const group = new THREE.Group();
        const wiperGeo = new THREE.BoxGeometry(cabinWidth * 0.5, 0.04, 0.05);
        const mat = new THREE.MeshStandardMaterial({ color: 0x000000 });

        const leftWiper = new THREE.Mesh(wiperGeo, mat);
        leftWiper.position.set(-cabinWidth * 0.15, 0, 0);

        const rightWiper = new THREE.Mesh(wiperGeo, mat);
        rightWiper.position.set(cabinWidth * 0.15, 0, 0);

        group.add(leftWiper);
        group.add(rightWiper);

        group.position.set(0, cabinPos.y, cabinPos.z + cabinLength / 2 + 0.02);
        this.mesh.add(group);
        return group;
    }

    createHeadlights(width, height, length, wheelY) {
        this.parts.headlights = [];
        const y = wheelY + height * 0.55;
        const z = length / 2 + 0.05;
        const x = width / 3;

        const geo = new THREE.BoxGeometry(0.18, 0.2, 0.15);
        const mat = new THREE.MeshStandardMaterial({
            color: 0xffffdd,
            emissive: 0xffffaa,
            emissiveIntensity: 0.6
        });
        const left = new THREE.Mesh(geo, mat);
        left.position.set(-x, y, z);
        const right = left.clone();
        right.position.x = x;
        this.mesh.add(left);
        this.mesh.add(right);
        this.parts.headlights.push(left, right);
    }

    createWheels(width, length, radius, thickness, yPos) {
        const geom = new THREE.CylinderGeometry(radius, radius, thickness, 20);
        geom.rotateZ(Math.PI / 2); // eje sobre X
        const rimGeom = new THREE.CylinderGeometry(radius * 0.6, radius * 0.6, thickness * 0.7, 16);
        rimGeom.rotateZ(Math.PI / 2);

        const offsetX = width / 2 - radius * 0.2;
        const offsetZ = length / 2 - radius;
        const wheelPositions = [
            { x: -offsetX, z: offsetZ },   // front-left
            { x: offsetX, z: offsetZ },    // front-right
            { x: -offsetX, z: -offsetZ },  // rear-left
            { x: offsetX, z: -offsetZ },   // rear-right
        ];
        this.parts.wheels = [];
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(geom, this.materials.tire);
            wheel.position.set(pos.x, yPos, pos.z);
            const rim = new THREE.Mesh(rimGeom, this.materials.rim);
            rim.position.copy(wheel.position);
            this.mesh.add(wheel);
            this.mesh.add(rim);
            this.parts.wheels.push(wheel);
        });
    }

    createInterior(width, height, length) {
        this.parts.interior = new THREE.Group();
        // Se agrega al mesh principal, sin depender de un chasis aparte
        this.mesh.add(this.parts.interior);

        // Conductor (volante a la derecha): esfera cabeza + cilindro torso
        const headGeo = new THREE.SphereGeometry(0.25, 16, 12);
        const bodyGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.6, 14);
        const driverMat = new THREE.MeshLambertMaterial({ color: 0x0066ff });

        const driverGroup = new THREE.Group();
        const driverBody = new THREE.Mesh(bodyGeo, driverMat);
        driverBody.position.y = 0.3;
        const driverHead = new THREE.Mesh(headGeo, driverMat);
        driverHead.position.y = 0.7;
        driverGroup.add(driverBody);
        driverGroup.add(driverHead);
        driverGroup.position.set(width / 4, 0.2, 0); // lado derecho, un poco elevado
        this.parts.driver = driverGroup;
        this.parts.interior.add(driverGroup);

        // Pasajero (izquierda) queda como esfera simple
        const passengerMat = new THREE.MeshLambertMaterial({ color: 0xff00ff });
        const passenger = new THREE.Mesh(headGeo, passengerMat);
        passenger.position.set(-width / 4, 0.2, 0);
        passenger.visible = false;
        this.parts.passenger = passenger;
        this.parts.interior.add(passenger);
    }

    // Métodos de modificación
    setPassengerValidity(hasPassenger) {
        this.hasPassenger = hasPassenger;
        this.parts.passenger.visible = hasPassenger;
    }

    setColor(colorHex) {
        this.color = colorHex;
        this.materials.body.color.set(colorHex);
    }

    toggleDoor(isOpen) {
        // Apertura/cierre rápida (sin animación compleja)
        const angle = isOpen ? Math.PI / 3 : 0;
        this.parts.doorLeft.rotation.y = -angle; // Puerta izq se abre hacia afuera(-y rot?)
        this.parts.doorLeft.rotation.y = isOpen ? Math.PI / 4 : 0;
        this.parts.doorRight.rotation.y = isOpen ? -Math.PI / 4 : 0;
    }

    toggleLights(isOn) {
        this.lightsOn = isOn;
        const intensity = isOn ? 0.8 : 0.1;
        this.parts.headlights.forEach(l => {
            if (l.material?.emissive) {
                l.material.emissiveIntensity = intensity;
            }
        });
    }

    setWiperPosition(t) {
        // t de 0 a 1
        // simple anim
        const angle = Math.sin(t * Math.PI) * 1.5;
        this.parts.wipers.rotation.z = angle;
    }
}
