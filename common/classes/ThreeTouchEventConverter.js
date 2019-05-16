import {THREE, $} from '../libs';
import Utils from './Utils';
import TouchEventConverter from './TouchEventConverter';
import ThreeEventConverter from './ThreeEventConverter';


export default class ThreeTouchEventConverter extends TouchEventConverter {

  constructor(wnd, doc, visualWorld, test) {
    super(wnd, doc, visualWorld.element);
    Utils.extends(this, new ThreeEventConverter(visualWorld, test));
  }

  getCallback(object) {
    return object.object.userData.touchCallback;
  }

  setCoordsFromEvent(e) {
    const jElement = $(this.element), offset = jElement.offset(),
      touches = e.touches || e.originalEvent.touches, touch = touches.length? touches[0]: (this.lastTouches || [{pageX: 0, pageY: 0}])[0],
      pageX = touch.pageX, pageY = touch.pageY;
    this.lastTouches = touches.length? touches: this.lastTouches;
    this.coords.x = ((pageX-offset.left)/jElement.width())*2-1;
    this.coords.y = -((pageY-offset.top)/jElement.height())*2+1;
    return this.coords;
  }
}
