import {$, THREE} from '../libs';

export default class Drag {

  constructor(wnd, doc, visualWorld) {
    this.wnd = wnd;
    this.doc = doc;
    this.visual = visualWorld;
    this.coords = new THREE.Vector2();
    this.intersection = new THREE.Vector3();
    this.raycaster = this.visual.raycaster;
    this.camera = this.visual.camera;
    this.plane = new THREE.Plane();
    this.threes = [];
    this.selected = null;
    this.enabled = true;
    this.controlsState = this.visual.getControlsState();

    this.element = this.visual.element;
    this.binds = {
      onMouseMove: this.onMouseMove.bind(this),
      onMouseDown: this.onMouseDown.bind(this),
      onMouseUp: this.onMouseUp.bind(this)
    };
    $(this.element).on('mousemove', this.binds.onMouseMove);
    $(this.element).on('mousedown', this.binds.onMouseDown);
    $(this.doc).on('mouseup', this.binds.onMouseUp);
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

  onPickCallback() {
    return true;
  }

  onDragCallback() {
    return true;
  }

  onReleaseCallback() {

  }

  dispose() {
    $(this.element).off('mousemove', this.binds.onMouseMove);
    $(this.element).off('mousedown', this.binds.onMouseDown);
    $(this.doc).off('mouseup', this.binds.onMouseUp);
  }

  setCoordsFromEvent(e) {
    const jElement = $(this.element);
    const offset = jElement.offset();
    this.coords.x = ((e.pageX-offset.left)/jElement.width())*2-1;
    this.coords.y = -((e.pageY-offset.top)/jElement.height())*2+1;
    return this.coords;
  }

  onMouseDown(e) {
    if(!this.enabled) return;

    if(this.selected) this.onMouseUp(e);

    this.setCoordsFromEvent(e);
  	this.raycaster.setFromCamera(this.coords, this.camera);

  	const intersects = this.raycaster.intersectObjects(this.threes);
  	if(intersects.length > 0) {
      const selected = intersects[0].object;
      if(!this.onPickCallback(intersects[0])) return;
      const v = intersects[0].point.clone();
      this.distance = v.sub(this.raycaster.ray.origin).length();;
      this.controlsState = this.visual.getControlsState();
      this.visual.setControlsState(false);
      this.plane.setFromNormalAndCoplanarPoint(this.visual.camera.getWorldDirection(this.plane.normal), intersects[0].point);
      //this.plane.setFromNormalAndCoplanarPoint(this.plane.normal.set(0,0,1), new THREE.Vector3(0,0,0));
      this.selected = selected;
  	}

  }

  onMouseMove(e) {
    if(!this.enabled) return;
  	e.preventDefault();

  	if(this.selected) {
      this.setCoordsFromEvent(e);
    	this.raycaster.setFromCamera(this.coords, this.camera);
	    if(this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
        if(!this.onDragCallback(this.intersection)) this.onMouseUp(e);
      }/**/
      //this.intersection.copy(this.raycaster.ray.direction).normalize().multiplyScalar(this.distance).add(this.raycaster.ray.origin);/**/
      //if(!this.onDragCallback(this.selected, this.intersection)) this.onMouseUp(e);
  	}
  }

  onMouseUp(e) {
    if(this.selected) {
      this.onReleaseCallback();
  		this.selected = null;
      this.visual.setControlsState(this.controlsState);
  	}
    if(!this.enabled) return;
  	e.preventDefault();
  }

}
