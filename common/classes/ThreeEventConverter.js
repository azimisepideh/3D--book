import {THREE, $} from '../libs';

export default class ThreeEventConverterFs {

  static objectsTest(object1, object2) {
    return object1 && object2? object1.object===object2.object: false;
  }

  static objectsAndFacesTest(object1, object2) {
    return object1 && object2? object1.object===object2.object && object1.face.materialIndex===object2.face.materialIndex: false;
  }

  constructor(visualWorld, test=ThreeEventConverterFs.objectsAndFacesTest) {
    this.visual = visualWorld;
    this.coords = new THREE.Vector2();
    this.raycaster = this.visual.raycaster;
    this.camera = this.visual.camera;
    this.threes = [];
    this.test = test;
  }

  addThree(three) {
    this.threes.push(three);
  }

  removeThree(three) {
    const i = this.threes.indexOf(three);
    if(~i) {
      this.threes.splice(i, 1);
    }
  }

  getObject(e) {
    this.setCoordsFromEvent(e);
    this.raycaster.setFromCamera(this.coords, this.camera);
    const intersects = this.raycaster.intersectObjects(this.threes);
    return intersects[0];
  }

}
