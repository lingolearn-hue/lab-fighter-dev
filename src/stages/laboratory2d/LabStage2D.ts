import * as THREE from "three";

export interface StageSpawns {
  a: { x: number; y: number };
  b: { x: number; y: number };
}

export function buildLabStage2D(scene: THREE.Scene): StageSpawns {
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x3a3f4b });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(24, 1, 6), floorMat);
  floor.position.set(0, -0.5, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a2d3a });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(24, 6, 1), wallMat);
  wall.position.set(0, 3, -3.5);
  scene.add(wall);

  const benchMat = new THREE.MeshStandardMaterial({ color: 0x6fd3ff });
  const benchGeo = new THREE.BoxGeometry(1.5, 1.0, 0.8);
  const benchLeft = new THREE.Mesh(benchGeo, benchMat);
  benchLeft.position.set(-8, 0.5, 0);
  scene.add(benchLeft);
  const benchRight = new THREE.Mesh(benchGeo, benchMat);
  benchRight.position.set(8, 0.5, 0);
  scene.add(benchRight);

  const light = new THREE.DirectionalLight(0xffffff, 2.2);
  light.position.set(5, 8, 6);
  light.castShadow = true;
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x8899aa, 0.8));

  return { a: { x: -3, y: 0 }, b: { x: 3, y: 0 } };
}
