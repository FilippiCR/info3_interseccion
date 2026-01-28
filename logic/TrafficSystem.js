import * as THREE from 'three';
import { Car } from '../entities/Car.js';

export class TrafficSystem {
    constructor(scene, trafficLights) {
        this.scene = scene;
        this.trafficLights = trafficLights; // Array de 4 luces

        this.cars = [];
        this.lanes = this.createLanes();
        // Mapea cada carril al semáforo que le corresponde
        // 0: Sur→Norte usa el semáforo inferior derecho (índice 2)
        // 1: Norte→Sur usa el superior izquierdo (índice 0)
        // 2: Oeste→Este usa el inferior izquierdo (índice 3)
        // 3: Este→Oeste usa el superior derecho (índice 1)
        this.laneLightMap = { 0: 2, 1: 0, 2: 3, 3: 1 };
        this.cycleTime = 0;
        this.lastSpawnFrame = [ -Infinity, -Infinity, -Infinity, -Infinity ];
        this.currentPhase = 0; // 0: NS verde, 1: NS amarilla, 2: EW verde, 3: EW amarilla
        this.spawnPeriod = 90; // cuadros (~1.5 s a 60fps)
        this.maxCars = 20;
        this.turnTarget = { 0: 2, 1: 3, 2: 1, 3: 0 }; // mapeo de giro a la derecha
        this.turnExit = {
            0: { x: 6, z: 2.5 },
            1: { x: -6, z: -2.5 },
            2: { x: -2.5, z: 6 },
            3: { x: 2.5, z: -6 }
        };
        this.turnCtrl = {
            0: { x: 6, z: -1 },
            1: { x: -6, z: 1 },
            2: { x: -1, z: 6 },
            3: { x: 1, z: -6 }
        };
        this.allowTurns = false; // habilita/deshabilita giros
    }

    createLanes() {
        // Define paths
        // 0: Sur -> Norte (avance en -Z). Inicio Z=50, fin Z=-50. X = 2.5
        // 1: Norte -> Sur (avance en +Z). Inicio Z=-50, fin Z=50. X = -2.5
        // 2: Oeste -> Este (avance en +X). Inicio X=-50, fin X=50. Z = 2.5
        // 3: Este -> Oeste (avance en -X). Inicio X=50, fin X=-50. Z = -2.5

        return [
            { id: 0, axis: 'z', dir: -1, x: 2.5, start: 50, end: -50, lightIndex: 2 }, // enlaza con semáforo específico
            { id: 1, axis: 'z', dir: 1, x: -2.5, start: -50, end: 50, lightIndex: 0 },
            { id: 2, axis: 'x', dir: 1, z: 2.5, start: -50, end: 50, lightIndex: 3 },
            { id: 3, axis: 'x', dir: -1, z: -2.5, start: 50, end: -50, lightIndex: 1 }
        ];
    }

    addCar(car) {
        const lane = this.pickSpawnLane();
        if (!lane) {
            throw new Error('No safe lane available to spawn a car right now.');
        }

        // Estado inicial del auto
        car.lane = lane;
        car.speed = 0;
        car.maxSpeed = 0.1 + Math.random() * 0.05;
        car.turningRight = this.allowTurns && Math.random() < 0.2;
        car.hasTurned = false;
        car.turnData = null;

        // Posición inicial
        if (lane.axis === 'z') {
            car.mesh.position.set(lane.x, 0, lane.start);
            car.mesh.rotation.y = lane.dir === -1 ? Math.PI : 0; // Orientación
        } else {
            car.mesh.position.set(lane.start, 0, lane.z);
            car.mesh.rotation.y = lane.dir === 1 ? Math.PI / 2 : -Math.PI / 2;
        }

        this.cars.push(car);
        this.scene.add(car.mesh);
        this.lastSpawnFrame[lane.id] = this.cycleTime;
    }

    pickSpawnLane() {
        // Orden aleatorio para repartir tráfico
        const order = [...this.lanes].sort(() => Math.random() - 0.5);
        const minInterval = 180; // cuadros (~3 s)
        const spawnGap = 8; // al menos 8 unidades libres en el spawn

        for (const lane of order) {
            const last = this.lastSpawnFrame[lane.id];
            if (this.cycleTime - last < minInterval) continue;

            const axis = lane.axis === 'z' ? 'z' : 'x';
            const startCoord = lane.start;
            const occupied = this.cars.some(c => {
                if (c.lane.id !== lane.id) return false;
                const pos = axis === 'z' ? c.mesh.position.z : c.mesh.position.x;
                return Math.abs(pos - startCoord) < spawnGap;
            });
            if (occupied) continue;
            return lane;
        }
        return null;
    }

    update() {
        this.updateLights();
        this.maybeSpawnCar();
        this.updateCars();
    }

    maybeSpawnCar() {
        if (this.cars.length >= this.maxCars) return;
        if (this.cycleTime % this.spawnPeriod !== 0) return;
        const car = new Car();
        try {
            this.addCar(car);
        } catch (e) {
            // Sin carril disponible ahora; se omite
        }
    }

    updateLights() {
        this.cycleTime++;
        // Cadencia más lenta: ~10 s verde y ~2 s amarilla a ~60fps
        const greenDuration = 600; // cuadros
        const yellowDuration = 120;

        // Lógica simple de fases
        // Fase 0: NS verde (carriles 0,1)
        // Fase 1: NS amarilla
        // Fase 2: EW verde (carriles 2,3)
        // Fase 3: EW amarilla

        const totalCycle = (greenDuration + yellowDuration) * 2;
        const t = this.cycleTime % totalCycle;

        let nsState = 'red';
        let ewState = 'red';

        if (t < greenDuration) {
            nsState = 'green';
        } else if (t < greenDuration + yellowDuration) {
            nsState = 'yellow';
        } else if (t < 2 * greenDuration + yellowDuration) {
            ewState = 'green';
        } else {
            ewState = 'yellow';
        }

        // Aplicamos estados: 0 y 2 controlan NS, 1 y 3 controlan EW
        this.trafficLights[0].setState(nsState); // top-left controls north approach
        this.trafficLights[2].setState(nsState); // bottom-right controls south approach

        this.trafficLights[1].setState(ewState); // top-right controls east approach
        this.trafficLights[3].setState(ewState); // bottom-left controls west approach
    }

    updateCars() {
        // Agrupa autos por carril para manejar seguimiento
        const carsByLane = {};
        this.cars.forEach(car => {
            if (!carsByLane[car.lane.id]) carsByLane[car.lane.id] = [];
            carsByLane[car.lane.id].push(car);
        });

        Object.values(carsByLane).forEach(laneCars => {
            // Ordena para que el índice 0 sea el auto más cercano a la intersección
            laneCars.sort((a, b) => {
                const lane = a.lane;
                const aPos = lane.axis === 'z' ? a.mesh.position.z : a.mesh.position.x;
                const bPos = lane.axis === 'z' ? b.mesh.position.z : b.mesh.position.x;
                const aKey = lane.dir === -1 ? -aPos : aPos;
                const bKey = lane.dir === -1 ? -bPos : bPos;
                return bKey - aKey; // descendente: mayor clave = más cerca
            });

            laneCars.forEach((car, idx) => {
                const lane = car.lane;
                // Si los giros están deshabilitados, limpia cualquier estado pendiente
                if (!this.allowTurns && car.turnData) {
                    car.turnData = null;
                    car.turningRight = false;
                }
                // Si está girando, solo avanza en la curva y omite chequeos de frenado
                if (car.turnData) {
                    this.progressTurn(car);
                    return;
                }

                let shouldStop = false;

                // Línea de detención cercana al semáforo
                const stopLine = lane.dir === -1 ? 7 : -7;

                // Posición actual y distancia a la línea de detención
                const pos = lane.axis === 'z' ? car.mesh.position.z : car.mesh.position.x;
                const distToStop = (stopLine - pos) * lane.dir; // Positiva si se acerca a la línea

                // Semáforo que controla este carril
                const lightIndex = this.laneLightMap[lane.id];
                const lightState = this.trafficLights[lightIndex].state;

                if (lightState !== 'green' && distToStop > 0 && distToStop < 12) {
                    shouldStop = true;
                }

                // Comprueba distancia con el auto delantero
                if (idx > 0) {
                    const ahead = laneCars[idx - 1];
                    const aheadPos = lane.axis === 'z' ? ahead.mesh.position.z : ahead.mesh.position.x;
                    const gap = (aheadPos - pos) * lane.dir; // positivo si el de adelante está realmente adelante
                    const minGap = 6;
                    if (gap < minGap) {
                        shouldStop = true;
                    }
                }

                const targetMax = car.turnData ? Math.min(car.maxSpeed, 0.08) : car.maxSpeed;

                if (shouldStop) {
                    car.speed *= 0.8;
                    if (car.speed < 0.001) car.speed = 0;
                } else {
                    if (car.speed < targetMax) car.speed += 0.0035;
                    if (car.speed > targetMax) car.speed *= 0.98;
                }

                // Gira a la derecha si está marcado y ya pasó la línea de detención
                if (this.allowTurns && car.turningRight && !car.hasTurned && distToStop < -3 && car.speed > 0.015) {
                    this.beginTurn(car, lane);
                }

                const activeLane = car.lane;

                // Movimiento
                if (activeLane.axis === 'z') {
                    car.mesh.position.z += car.speed * activeLane.dir;
                    // Reciclar posición al salir del rango
                    if ((activeLane.dir === -1 && car.mesh.position.z < -60) ||
                        (activeLane.dir === 1 && car.mesh.position.z > 60)) {
                        car.mesh.position.z = activeLane.start;
                        car.hasTurned = false;
                        car.turningRight = this.allowTurns && Math.random() < 0.2;
                        car.turnData = null;
                    }
                } else {
                    car.mesh.position.x += car.speed * activeLane.dir;
                    if ((activeLane.dir === -1 && car.mesh.position.x < -60) ||
                        (activeLane.dir === 1 && car.mesh.position.x > 60)) {
                        car.mesh.position.x = activeLane.start;
                        car.hasTurned = false;
                        car.turningRight = this.allowTurns && Math.random() < 0.2;
                        car.turnData = null;
                    }
                }
            });
        });
    }

    getLaneRotation(lane) {
        if (lane.axis === 'z') {
            return lane.dir === -1 ? Math.PI : 0;
        } else {
            return lane.dir === 1 ? Math.PI / 2 : -Math.PI / 2;
        }
    }

    beginTurn(car, lane) {
        const targetId = this.turnTarget[lane.id];
        const targetLane = this.lanes[targetId];
        const p0 = { x: car.mesh.position.x, z: car.mesh.position.z };
        const p1 = this.turnCtrl[lane.id];
        const p2 = this.turnExit[lane.id];
        car.turnData = {
            t: 0,
            duration: 55,
            p0,
            p1,
            p2,
            startRot: car.mesh.rotation.y,
            endRot: this.getLaneRotation(targetLane),
            targetLane
        };
    }

    progressTurn(car) {
        const td = car.turnData;
        if (!td) return;
        const step = 1 / td.duration;
        td.t = Math.min(1, td.t + step);

        // Bezier cuadrático para una curva suave
        const bezier = (p0, p1, p2, t) => {
            const u = 1 - t;
            return {
                x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
                z: u * u * p0.z + 2 * u * t * p1.z + t * t * p2.z
            };
        };

        const pos = bezier(td.p0, td.p1, td.p2, td.t);
        car.mesh.position.x = pos.x;
        car.mesh.position.z = pos.z;

        const delta = ((td.endRot - td.startRot + Math.PI) % (Math.PI * 2)) - Math.PI; // diferencia angular mínima
        const rot = td.startRot + delta * td.t;
        car.mesh.rotation.y = rot;

        if (td.t >= 1) {
            car.lane = td.targetLane;
            car.hasTurned = true;
            car.turningRight = false;
            car.turnData = null;
        }
    }
}
