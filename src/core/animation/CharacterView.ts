import * as THREE from "three";
import type { Character } from "../character/Character";

/** Visual representation of a Character — placeholder capsule, no external assets. */
export class CharacterView {
  readonly group: THREE.Group;
  private readonly mesh: THREE.Mesh;
  private animTime = 0;
  private animName = "idle";
  private animLoop = true;

  constructor(color: number) {
    this.group = new THREE.Group();
    const geometry = new THREE.CapsuleGeometry(0.4, 1.0, 4, 8);
    const material = new THREE.MeshStandardMaterial({ color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.y = 0.9;
    this.mesh.castShadow = true;
    this.group.add(this.mesh);
  }

  playAnimation(name: string, loop: boolean): void {
    this.animName = name;
    this.animLoop = loop;
    this.animTime = 0;
  }

  update(dt: number, character: Character): void {
    this.animTime += dt;
    this.group.position.set(character.x, 0, 0);
    this.group.scale.x = character.facingRight ? 1 : -1;

    // Simple procedural placeholder motion by animation name.
    this.mesh.rotation.set(0, 0, 0);
    this.mesh.scale.set(1, 1, 1);
    this.mesh.position.set(0, 0.9, 0);

    switch (this.animName) {
      case "walk": {
        const t = (this.animTime * 4) % 1;
        this.mesh.position.y = 0.9 + Math.sin(t * Math.PI * 2) * 0.05;
        this.mesh.rotation.z = Math.sin(t * Math.PI * 2) * 0.07;
        break;
      }
      case "attack_light":
      case "attack_heavy": {
        const punch = Math.sin(Math.min(this.animTime * 10, Math.PI));
        this.mesh.rotation.y = -0.3 * punch;
        this.mesh.scale.set(1 + 0.1 * punch, 1 - 0.1 * punch, 1 + 0.15 * punch);
        break;
      }
      case "hit": {
        this.mesh.rotation.z = -0.2 * Math.max(0, 1 - this.animTime * 5);
        break;
      }
      case "knockdown": {
        const t = Math.min(this.animTime / 0.5, 1);
        this.mesh.rotation.z = t * (Math.PI / 2 - 0.1);
        this.mesh.position.y = 0.9 - t * 0.5;
        break;
      }
      default: {
        const t = (this.animTime * 1.2) % 1;
        this.mesh.scale.y = 1 + Math.sin(t * Math.PI * 2) * 0.02;
        break;
      }
    }
    if (!this.animLoop && this.animTime > 1.2) {
      // fall back to idle once a one-shot animation has clearly finished
      this.animName = "idle";
    }
  }
}
