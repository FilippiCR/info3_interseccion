import * as THREE from 'https://unpkg.com/three@0.182.0/build/three.module.js';
import { Intersection } from '../entities/Intersection.js';
import { TrafficLight } from '../entities/TrafficLight.js';
import { Car } from '../entities/Car.js';
import { TrafficSystem } from '../logic/TrafficSystem.js';

export class SceneManager {
    constructor(scene) {
        this.scene = scene;
        this.init();
    }

    init() {
        console.log("Initializing Scene...");

        // 1. Intersección
        const intersection = new Intersection();
        this.scene.add(intersection.mesh);

        // 2. Semáforos
        this.trafficLights = [];
        // Esquinas: 0 TL, 1 TR, 2 BR, 3 BL
        // Orientaciones: TR→este, BR→sur, BL→oeste, TL→norte
        const configs = [
            { x: -6, z: -6, rot: Math.PI },           // esquina superior izq. mirando al norte (-Z)
            { x: 6, z: -6, rot: Math.PI / 2 },        // esquina superior der. mirando al este (+X)
            { x: 6, z: 6, rot: 0 },                   // esquina inferior der. mirando al sur (+Z)
            { x: -6, z: 6, rot: -Math.PI / 2 }        // esquina inferior izq. mirando al oeste (-X)
        ];

        configs.forEach(conf => {
            const tl = new TrafficLight();
            tl.mesh.position.set(conf.x, 0, conf.z);
            tl.mesh.rotation.y = conf.rot;
            this.scene.add(tl.mesh);
            this.trafficLights.push(tl);
        });

        // 3. Sistema de lógica
        this.trafficSystem = new TrafficSystem(this.scene, this.trafficLights);

        // 4. Autos iniciales
        this.cars = [];
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
        for (let i = 0; i < 4; i++) {
            const car = new Car();
            car.setColor(colors[i]);
            try {
                this.trafficSystem.addCar(car);
                this.cars.push(car);
            } catch (e) {
                console.error("Error adding car:", e);
            }
        }
    }

    update() {
        if (this.trafficSystem) this.trafficSystem.update();
    }
}
