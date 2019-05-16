import {THREE} from '../libs';

export default class Orbit extends THREE.EventDispatcher {

  constructor(object, domElement) {
    super();
  	this.object = object;
  	this.domElement = domElement || document.body;

  	// Set to false to disable this control
  	this.enabled = true;

  	// "target" sets the location of focus, where the object orbits around
  	this.target = new THREE.Vector3();

  	// How far you can dolly in and out(PerspectiveCamera only)
  	this.minDistance = 0;
  	this.maxDistance = Infinity;

  	// How far you can zoom in and out(OrthographicCamera only)
  	this.minZoom = 0;
  	this.maxZoom = Infinity;

  	// How far you can orbit vertically, upper and lower limits.
  	// Range is 0 to Math.PI radians.
  	this.minPolarAngle = 0; // radians
  	this.maxPolarAngle = Math.PI; // radians

  	// How far you can orbit horizontally, upper and lower limits.
  	// If set, must be a sub-interval of the interval [-Math.PI, Math.PI ].
  	this.minAzimuthAngle = -Infinity; // radians
  	this.maxAzimuthAngle = Infinity; // radians

  	// Set to true to enable damping (inertia)
  	// If damping is enabled, you must call controls.update() in your animation loop
  	this.enableDamping = false;
  	this.dampingFactor = 0.25;

  	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
  	// Set to false to disable zooming
  	this.enableZoom = true;
  	this.zoomSpeed = 1.0;

  	// Set to false to disable rotating
  	this.enableRotate = true;
  	this.rotateSpeed = 1.0;

  	// Set to false to disable panning
  	this.enablePan = true;

  	// Set to true to automatically rotate around the target
  	// If auto-rotate is enabled, you must call controls.update() in your animation loop
  	this.autoRotate = false;
  	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

  	// for reset
  	this.target0 = this.target.clone();
  	this.position0 = this.object.position.clone();
  	this.zoom0 = this.object.zoom;

  	//
  	// public methods
  	//
  	this.getPolarAngle = function () {
  		return spherical.phi;
  	};

  	this.getAzimuthalAngle = function () {
  		return spherical.theta;
  	};

  	this.reset = function () {
  		scope.target.copy(scope.target0);
  		scope.object.position.copy(scope.position0);
  		scope.object.zoom = scope.zoom0;

  		scope.object.updateProjectionMatrix();
  		scope.dispatchEvent(changeEvent);

  		scope.update();
  	};

    this.zoomOut = function(speed=this.zoomSpeed) {
      const _speed = this.zoomSpeed;
      this.zoomSpeed = speed;
      dollyIn(getZoomScale());
      this.zoomSpeed = _speed;
    };

    this.zoomIn = function(speed=this.zoomSpeed) {
      const _speed = this.zoomSpeed;
      this.zoomSpeed = speed;
      dollyOut(getZoomScale());
      this.zoomSpeed = _speed;
    };

    this.getScale = function() {
      return scale;
    }

    this.setScale = function(newScale) {
      scale = newScale;
    }

  	// this method is exposed, but perhaps it would be better if we can make it private...
  	this.update = function() {
  		var offset = new THREE.Vector3();
  		// so camera.up is the orbit axis
  		var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
  		var quatInverse = quat.clone().inverse();
  		var lastPosition = new THREE.Vector3();
  		var lastQuaternion = new THREE.Quaternion();

  		return function update () {
  			var position = scope.object.position;
  			offset.copy(position).sub(scope.target);
  			// rotate offset to "y-axis-is-up" space
  			offset.applyQuaternion(quat);
  			// angle from z-axis around y-axis
  			spherical.setFromVector3(offset);
  			if(scope.autoRotate) {
  				rotateLeft(getAutoRotationAngle());
  			}
  			spherical.theta += sphericalDelta.theta;
  			spherical.phi += sphericalDelta.phi;
  			// restrict theta to be between desired limits
  			spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta));
  			// restrict phi to be between desired limits
  			spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));
  			spherical.makeSafe();
  			spherical.radius *= scale;
  			// restrict radius to be between desired limits
  			spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));
  			// move target to panned location
  			scope.target.add(panOffset);
  			offset.setFromSpherical(spherical);
  			// rotate offset back to "camera-up-vector-is-up" space
  			offset.applyQuaternion(quatInverse);
  			position.copy(scope.target).add(offset);
  			scope.object.lookAt(scope.target);

  			if(scope.enableDamping===true) {
  				sphericalDelta.theta *=(1-scope.dampingFactor);
  				sphericalDelta.phi *=(1-scope.dampingFactor);
  			} else {
  				sphericalDelta.set(0, 0, 0);
  			}

  			scale = 1;
  			panOffset.set(0, 0, 0);

  			// update condition is:
  			// min(camera displacement, camera rotation in radians)^2 > EPS
  			// using small-angle approximation cos(x/2) = 1-x^2 / 8

  			if(zoomChanged ||
  				lastPosition.distanceToSquared(scope.object.position) > EPS ||
  				8 *(1-lastQuaternion.dot(scope.object.quaternion)) > EPS) {

  				scope.dispatchEvent(changeEvent);

  				lastPosition.copy(scope.object.position);
  				lastQuaternion.copy(scope.object.quaternion);
  				zoomChanged = false;

  				return true;
  			}
  			return false;
  		};
  	}();

    this.dispose = function() {

    };

  	//
  	// internals
  	//
  	var scope = this;
  	var changeEvent = { type: 'change' };
  	var EPS = 1e-6;
  	// current position in spherical coordinates
  	var spherical = new THREE.Spherical();
  	var sphericalDelta = new THREE.Spherical();

  	var scale = 1;
  	var panOffset = new THREE.Vector3();
  	var zoomChanged = false;

  	function getAutoRotationAngle() {
  		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
  	}

  	function getZoomScale() {
  		return Math.pow(0.95, scope.zoomSpeed);
  	}

  	function rotateLeft(angle) {
  		sphericalDelta.theta -= angle;
  	}

  	function rotateUp(angle) {
  		sphericalDelta.phi -= angle;
  	}

  	var panLeft = function() {
  		var v = new THREE.Vector3();
  		return function panLeft(distance, objectMatrix) {
  			v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
  			v.multiplyScalar(- distance);
  			panOffset.add(v);
  		};
  	}();

  	var panUp = function() {
  		var v = new THREE.Vector3();
  		return function panUp(distance, objectMatrix) {
  			v.setFromMatrixColumn(objectMatrix, 1); // get Y column of objectMatrix
  			v.multiplyScalar(distance);
  			panOffset.add(v);
  		};
  	}();

  	// deltaX and deltaY are in pixels; right and down are positive
  	scope.pan = function() {
  		var offset = new THREE.Vector3();
  		return function pan(deltaX, deltaY) {
  			var element = scope.domElement;
  			if(scope.object instanceof THREE.PerspectiveCamera) {
  				// perspective
  				var position = scope.object.position;
  				offset.copy(position).sub(scope.target);
  				var targetDistance = offset.length();
  				// half of the fov is center to top of screen
  				targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);
  				// we actually don't use screenWidth, since perspective camera is fixed to screen height
  				panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
  				panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
  			} else if(scope.object instanceof THREE.OrthographicCamera) {
  				// orthographic
  				panLeft(deltaX *(scope.object.right-scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
  				panUp(deltaY *(scope.object.top-scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);
  			} else {
  				// camera neither orthographic nor perspective
  				console.warn('WARNING: OrbitControls.js encountered an unknown camera type-pan disabled.');
  				scope.enablePan = false;
  			}
  		};
  	}();

  	function dollyIn(dollyScale) {
      if(scope.object instanceof THREE.PerspectiveCamera) {
  			scale /= dollyScale;
  		} else if(scope.object instanceof THREE.OrthographicCamera) {
  			scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
  			scope.object.updateProjectionMatrix();
  			zoomChanged = true;
  		} else {
  			console.warn('WARNING: OrbitControls.js encountered an unknown camera type-dolly/zoom disabled.');
  			scope.enableZoom = false;
  		}
  	}

  	function dollyOut(dollyScale) {
      if(scope.object instanceof THREE.PerspectiveCamera) {
  			scale *= dollyScale;
  		} else if(scope.object instanceof THREE.OrthographicCamera) {
  			scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
  			scope.object.updateProjectionMatrix();
  			zoomChanged = true;
  		} else {
  			console.warn('WARNING: OrbitControls.js encountered an unknown camera type-dolly/zoom disabled.');
  			scope.enableZoom = false;
  		}
  	}

    /* Actions */

    function rotate(event, data) {
      if(scope.enabled && scope.enableRotate && data.state==='move') {
        var element = scope.domElement;
        // rotating across whole screen goes 360 degrees around
        rotateLeft(2 * Math.PI * data.dx / element.clientWidth * scope.rotateSpeed);
        // rotating up and down along whole screen attempts to go 360, but limited to 180
        rotateUp(2 * Math.PI * data.dy / element.clientHeight * scope.rotateSpeed);
        scope.update();
      }
    }

    function pan(event, data) {
      if(scope.enabled && scope.enablePan && data.state==='move') {
        scope.pan(data.dx, data.dy);
        scope.update();
      }
    }

    function offsetDolly(event, data) {
      if(scope.enabled && scope.enableZoom && data.state==='move') {
        if(data.dy>0) {
          dollyIn(getZoomScale());
        } else if(data.dy<0) {
          dollyOut(getZoomScale());
        }
        scope.update();
      }
    }

    function wheelDolly(event) {
      if(scope.enabled && scope.enableZoom) {
        if(event.deltaY>0) {
          dollyOut(getZoomScale());
        } else if(event.deltaY<0) {
          dollyIn(getZoomScale());
        }
        scope.update();
      }
    }

    this.actions = {
      rotate,
      pan,
      offsetDolly,
      wheelDolly
    }

  	// force an update at start
  	this.update();
  }

}
