import {$, THREE} from '../libs';
import Orbit from './Orbit';
import ThreeMouseEventConverter from './ThreeMouseEventConverter';
import ThreeTouchEventConverter from './ThreeTouchEventConverter';
import Drag from './Drag';
import CSS3DRenderer from './CSS3DRenderer';

export default class VisualWorld {

  constructor(wnd, doc, container, useHelpers=false) {
    this.wnd = wnd;
    this.doc = doc;
    this.jContainer = container;
    this.renderCallbacks = [];

    this.clock = new THREE.Clock();

    this.raycaster = new THREE.Raycaster();

    this.scene = new THREE.Scene();
    this.cssScene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(30, this.width()/this.height(), 0.2, 2000);
    const scale = 1;

    this.camera.position.x = 0;
    this.camera.position.y = 5.5*scale;
    this.camera.position.z = 0;

    this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(this.wnd.devicePixelRatio);
    this.renderer.setSize(this.width(), this.height());

    this.jContainer.append(this.renderer.domElement);

    this.cssRenderer	= new CSS3DRenderer();
    this.cssRenderer.setSize(this.width(), this.height());
    $(this.cssRenderer.domElement).css({
  		position: 'absolute',
  		top: 0,
  		margin: 0,
  		padding: 0
	  });
    this.jContainer.append(this.cssRenderer.domElement);

    this.element = this.cssRenderer.domElement;



    this.controls = new Orbit(this.camera, this.element);
    this.controls.target.y = 0.5;

    const cssScene = $(this.cssRenderer.domElement).find('div'), tmpVector = new THREE.Vector3();
    this.controls.addEventListener('change', ()=> {
      this.camera.getWorldDirection(tmpVector);
      cssScene.css('display', tmpVector.y-this.camera.position.y>0? 'none': 'block');
    });

    this.textureLoader = new THREE.TextureLoader();

    this.scene.add(new THREE.AmbientLight(0xD0D0D0));//0xC0C0C0

    this.light = new THREE.DirectionalLight(0x404040, 1);
    this.light.position.set(0, 6*scale, 0);
    this.light.castShadow = false;
    // const d = 20*scale;
    // this.light.shadow.camera.left = -d;
    // this.light.shadow.camera.right = d;
    // this.light.shadow.camera.top = d;
    // this.light.shadow.camera.bottom = -d;
    // this.light.shadow.camera.near = 1*scale;
    // this.light.shadow.camera.far = 25*scale;
    // this.light.shadow.mapSize.x = 1024;
    // this.light.shadow.mapSize.y = 1024;
    this.scene.add(this.light);

    if(useHelpers) {
      this.scene.add(new THREE.AxisHelper(5));
    }

    this.binds = {
      onWindowResize: this.onWindowResize.bind(this),
      animate: this.animate.bind(this)
    };

    $(this.wnd).on('resize', this.binds.onWindowResize);

    this.mouseEvents = new ThreeMouseEventConverter(this.wnd, this.doc, this);
    this.touchEvents = new ThreeTouchEventConverter(this.wnd, this.doc, this);
    const filterData = {type: 'mousemove'};
    this.mouseEvents.filter = (element, e)=> {
      const types = ['mouseenter', 'mouseover', 'mouseleave', 'mouseout'], contains = (p, c)=> p===c || $.contains(p, c);
      if(e.type==='mousemove') {
        filterData.pageX = e.pageX;
        filterData.pageY = e.pageY;
      }
      return e.relatedTarget && ~types.indexOf(e.type) && contains(element, e.target) && contains(element, e.relatedTarget)? {...e, ...filterData}: e;
    };
    this.drag = new Drag(this.wnd, this.doc, this);

    this.animate();
  }

  dispose() {
    delete this.binds.animate;
    $(this.wnd).off('resize', this.binds.onWindowResize);
    this.mouseEvents.dispose();
    this.touchEvents.dispose();
    this.drag.dispose();
    this.controls.dispose();
  }

  width() {
    return this.jContainer.width();
  }

  height() {
    return this.jContainer.height();
  }

  setExtraLighting(v) {
    this.light.intensity = v;
  }

  getOrbit() {
    return this.controls;
  }

  setControlsState(state) {
    this.controls.enabled = state;
  }

  getControlsState() {
    return this.controls.enabled;
  }

  onWindowResize() {
    const updateCamera = (camera)=> {
      camera.aspect = this.width()/this.height();
      camera.updateProjectionMatrix();
    },
    updateRenderer = (renderer)=> {
      renderer.setSize(this.width(), this.height());
    };

    updateCamera(this.camera);
    updateRenderer(this.renderer);
    updateRenderer(this.cssRenderer);
  }

  addObject(object) {
    this.scene.add(object);
  }

  addCssObject(object) {
    this.cssScene.add(object);
  }

  removeCssObject(object) {
    this.cssScene.remove(object);
  }

  removeObject(object) {
    this.scene.remove(object);
  }

  animate() {
    if(this.binds.animate) {
      requestAnimationFrame(this.binds.animate);
    }
    this.render();
  }

  addRenderCallback(clb) {
    this.renderCallbacks.push(clb);
  }

  removeRenderCallback(clb) {
    const i = this.renderCallbacks.indexOf(clb);
    if(~i) {
      this.renderCallbacks.splice(i, 1);
    }
  }

  render() {
    const deltaTime = this.clock.getDelta();
    this.controls.update(deltaTime);
    for(let clb of this.renderCallbacks) {
      clb(deltaTime);
    }
    this.cssRenderer.render(this.cssScene, this.camera);
    this.renderer.render(this.scene, this.camera);
  }

  processGeometry(bufGeometry, mesh) {
    mesh.geometry = bufGeometry;
    // Obtain a Geometry
    const geometry = new THREE.Geometry().fromBufferGeometry(bufGeometry);
    // Merge the vertices so the triangle soup is converted to indexed triangles
    geometry.mergeVertices();
    // Convert again to BufferGeometry, indexed
    const indexedBufferGeom = this.createIndexedBufferGeometryFromGeometry(geometry);
    // Create index arrays mapping the indexed vertices to bufGeometry vertices
    return this.mapIndices(bufGeometry, indexedBufferGeom);
  }

  createIndexedBufferGeometryFromGeometry(geometry) {
    const numVertices = geometry.vertices.length;
    const numFaces = geometry.faces.length;

    const bufferGeom = new THREE.BufferGeometry();
    const vertices = new Float32Array(numVertices * 3);
    const indices = new (numFaces * 3 > 65535 ? Uint32Array : Uint16Array)(numFaces * 3);

    for(let i = 0; i < numVertices; i++) {
      const p = geometry.vertices[i];
      const i3 = i * 3;
      vertices[i3] = p.x;
      vertices[i3 + 1] = p.y;
      vertices[i3 + 2] = p.z;
    }

    for(let i = 0; i < numFaces; i++) {
      const f = geometry.faces[i];
      const i3 = i * 3;
      indices[i3] = f.a;
      indices[i3 + 1] = f.b;
      indices[i3 + 2] = f.c;
    }

    bufferGeom.setIndex(new THREE.BufferAttribute(indices, 1));
    bufferGeom.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

    return bufferGeom;
  }

  isEqual(x1, y1, z1, x2, y2, z2) {
    const delta = 0.000001;
    return Math.abs(x2 - x1) < delta &&
    Math.abs(y2 - y1) < delta &&
    Math.abs(z2 - z1) < delta;
  }

  mapIndices(bufGeometry, indexedBufferGeom) {
    // Creates mappedVertices, mappedIndices and mappedAssociation in bufGeometry
    const vertices = bufGeometry.attributes.position.array;
    const idxVertices = indexedBufferGeom.attributes.position.array;
    const indices = indexedBufferGeom.index.array;

    const numIdxVertices = idxVertices.length / 3;
    const numVertices = vertices.length / 3;

    bufGeometry.mappedVertices = idxVertices;
    bufGeometry.mappedIndices = indices;
    bufGeometry.mappedAssociation = [];

    for(let i = 0; i < numIdxVertices; i++) {
      const association = [];
      bufGeometry.mappedAssociation.push(association);
      const i3 = i * 3;
      for(let j = 0; j < numVertices; j++) {
        const j3 = j * 3;
        if (this.isEqual(idxVertices[i3], idxVertices[i3 + 1], idxVertices[i3 + 2],
        vertices[j3], vertices[j3 + 1], vertices[j3 + 2])) {
          association.push(j3);
        }
      }
    }
    return {vertices: bufGeometry.mappedVertices, indices: bufGeometry.mappedIndices};
  }

  oneNodePositionCallback(p, q) {
    this.position.set(p.x, p.y, p.z);
    this.quaternion.set(q.x, q.y, q.z, q.w);
  }

  multyNodePositionCallback(node, p, n) {
    const geometry = this.geometry;
    const volumePositions = geometry.attributes.position.array;
    const volumeNormals = geometry.attributes.normal.array;
    const assocVertex = geometry.mappedAssociation[node];

    for(let k = 0; k < assocVertex.length; k++) {
        let indexVertex = assocVertex[k];
        volumePositions[indexVertex] = p.x;
        volumeNormals[indexVertex] = n.x;
        ++indexVertex;
        volumePositions[indexVertex] = p.y;
        volumeNormals[indexVertex] = n.y;
        ++indexVertex;
        volumePositions[indexVertex] = p.z;
        volumeNormals[indexVertex] = n.z;
    }
  }

  multyNodePositionPostCallback() {
    const geometry = this.geometry;
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.normal.needsUpdate = true;
  }

  pathPositionCallback(node, p) {
    const positions = this.geometry.attributes.position.array;
		let i = 3 * node;
		positions[i++] = p.x;
		positions[i++] = p.y;
		positions[i] = p.z;
  }

  pathPositionPostCallback() {
    const geometry = this.geometry;
    geometry.computeVertexNormals();
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.normal.needsUpdate = true;
  }

}
