import {
  BackSide,
  BoxGeometry,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  Scene
} from "./chunk-6LTRFBSJ.js";
import "./chunk-DC5AMYBS.js";

// node_modules/three/examples/jsm/environments/RoomEnvironment.js
var RoomEnvironment = class extends Scene {
  constructor() {
    super();
    const geometry = new BoxGeometry();
    geometry.deleteAttribute("uv");
    const roomMaterial = new MeshStandardMaterial({ side: BackSide });
    const boxMaterial = new MeshStandardMaterial();
    const mainLight = new PointLight(16777215, 900, 28, 2);
    mainLight.position.set(0.418, 16.199, 0.3);
    this.add(mainLight);
    const room = new Mesh(geometry, roomMaterial);
    room.position.set(-0.757, 13.219, 0.717);
    room.scale.set(31.713, 28.305, 28.591);
    this.add(room);
    const boxes = new InstancedMesh(geometry, boxMaterial, 6);
    const transform = new Object3D();
    transform.position.set(-10.906, 2.009, 1.846);
    transform.rotation.set(0, -0.195, 0);
    transform.scale.set(2.328, 7.905, 4.651);
    transform.updateMatrix();
    boxes.setMatrixAt(0, transform.matrix);
    transform.position.set(-5.607, -0.754, -0.758);
    transform.rotation.set(0, 0.994, 0);
    transform.scale.set(1.97, 1.534, 3.955);
    transform.updateMatrix();
    boxes.setMatrixAt(1, transform.matrix);
    transform.position.set(6.167, 0.857, 7.803);
    transform.rotation.set(0, 0.561, 0);
    transform.scale.set(3.927, 6.285, 3.687);
    transform.updateMatrix();
    boxes.setMatrixAt(2, transform.matrix);
    transform.position.set(-2.017, 0.018, 6.124);
    transform.rotation.set(0, 0.333, 0);
    transform.scale.set(2.002, 4.566, 2.064);
    transform.updateMatrix();
    boxes.setMatrixAt(3, transform.matrix);
    transform.position.set(2.291, -0.756, -2.621);
    transform.rotation.set(0, -0.286, 0);
    transform.scale.set(1.546, 1.552, 1.496);
    transform.updateMatrix();
    boxes.setMatrixAt(4, transform.matrix);
    transform.position.set(-2.193, -0.369, -5.547);
    transform.rotation.set(0, 0.516, 0);
    transform.scale.set(3.875, 3.487, 2.986);
    transform.updateMatrix();
    boxes.setMatrixAt(5, transform.matrix);
    this.add(boxes);
    const light1 = new Mesh(geometry, createAreaLightMaterial(50));
    light1.position.set(-16.116, 14.37, 8.208);
    light1.scale.set(0.1, 2.428, 2.739);
    this.add(light1);
    const light2 = new Mesh(geometry, createAreaLightMaterial(50));
    light2.position.set(-16.109, 18.021, -8.207);
    light2.scale.set(0.1, 2.425, 2.751);
    this.add(light2);
    const light3 = new Mesh(geometry, createAreaLightMaterial(17));
    light3.position.set(14.904, 12.198, -1.832);
    light3.scale.set(0.15, 4.265, 6.331);
    this.add(light3);
    const light4 = new Mesh(geometry, createAreaLightMaterial(43));
    light4.position.set(-0.462, 8.89, 14.52);
    light4.scale.set(4.38, 5.441, 0.088);
    this.add(light4);
    const light5 = new Mesh(geometry, createAreaLightMaterial(20));
    light5.position.set(3.235, 11.486, -12.541);
    light5.scale.set(2.5, 2, 0.1);
    this.add(light5);
    const light6 = new Mesh(geometry, createAreaLightMaterial(100));
    light6.position.set(0, 20, 0);
    light6.scale.set(1, 0.1, 1);
    this.add(light6);
  }
  /**
   * Frees internal resources. This method should be called
   * when the environment is no longer required.
   */
  dispose() {
    const resources = /* @__PURE__ */ new Set();
    this.traverse((object) => {
      if (object.isMesh) {
        resources.add(object.geometry);
        resources.add(object.material);
      }
    });
    for (const resource of resources) {
      resource.dispose();
    }
  }
};
function createAreaLightMaterial(intensity) {
  const material = new MeshBasicMaterial();
  material.color.setScalar(intensity);
  return material;
}
export {
  RoomEnvironment
};
//# sourceMappingURL=three_examples_jsm_environments_RoomEnvironment__js.js.map
