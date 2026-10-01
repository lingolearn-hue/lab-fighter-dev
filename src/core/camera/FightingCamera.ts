import * as THREE from "three";
import type { Character } from "../character/Character";

export class FightingCamera {
  readonly camera: THREE.OrthographicCamera;
  private readonly baseHeight = 6; // world units visible vertically at min zoom
  minZoomDistance = 6;
  maxZoomDistance = 10;
  followSmoothing = 8;

  constructor(aspect: number) {
    const halfHeight = this.baseHeight / 2;
    this.camera = new THREE.OrthographicCamera(-halfHeight * aspect, halfHeight * aspect, halfHeight, -halfHeight, 0.1, 100);
    this.camera.position.set(0, 2, 10);
    this.camera.lookAt(0, 1, 0);
  }

  setAspect(aspect: number): void {
    const halfHeight = this.baseHeight / 2;
    this.camera.left = -halfHeight * aspect;
    this.camera.right = halfHeight * aspect;
    this.camera.top = halfHeight;
    this.camera.bottom = -halfHeight;
    this.camera.updateProjectionMatrix();
  }

  update(dt: number, a: Character, b: Character): void {
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2 + 1.0;
    const target = new THREE.Vector3(midX, midY, this.camera.position.z);
    this.camera.position.lerp(target, Math.min(1, dt * this.followSmoothing));
    this.camera.lookAt(midX, midY, 0);
  }
}
