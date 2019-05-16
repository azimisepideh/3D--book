import {THREE, $} from '../libs';
import Utils from './Utils';
import MouseEventConverter from './MouseEventConverter';
import ThreeEventConverter from './ThreeEventConverter';


export default class ThreeMouseEventConverter extends MouseEventConverter {

  constructor(wnd, doc, visualWorld, test) {
    super(wnd, doc, visualWorld.element);
    Utils.extends(this, new ThreeEventConverter(visualWorld, test));
  }

  getCallback(object) {
    return object.object.userData.mouseCallback;
  }

  setCoordsFromEvent(e) {
    const jElement = $(this.element);
    const offset = jElement.offset();
    this.coords.x = ((e.pageX-offset.left)/jElement.width())*2-1;
    this.coords.y = -((e.pageY-offset.top)/jElement.height())*2+1;
    return this.coords;
  }
}
