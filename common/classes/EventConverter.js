import {$} from '../libs';

export default class EventConverter {

  // virtuals
  // getObject(e, data);
  // getCallback(object);
  // test(object1, object1);

  constructor(wnd, doc) {
    this.wnd = wnd;
    this.doc = doc;
    this.enabled = true;
  }

  setEnable(vl) {
    if(!vl) {
      if(this.mCapObject) {
        this.notify(this.mCapObject, $.Event('mouseup'), 'mouseup');
        this.mCapObject = undefined;
      }
      if(this.mHovObject) {
        this.notify(this.mHovObject, $.Event('mouseout'), 'mouseout');
        this.mHovObject = undefined;
      }
    }
    this.enabled = vl;
  }

  getCallback(object) {
    return undefined;
  }

  notify(object, e, type) {
    const callback = this.getCallback(object);
    if(callback) {
      const props = {
        ...e,
        type,
        view: this.wnd
      };
      const jE = $.Event(type, props);
      jE.timeStamp = e.timeStamp;
      callback(jE, object);
    }
  }

  convert(e, data) {
    if(!this.enabled) return;

    if(this.filter) {
      e = this.filter(this.element, e);
    }

    const object = this.getObject(e, data),
      notify = ~e.type.indexOf('touch')? this.convertTouch(e, data, object): this.convertMouse(e, data, object);
    if(notify && object) {
      this.notify(object, e, e.type);
    }
  }

  convertTouch(e, data, object) {
    let notify = true;
    switch(e.type) {
      case 'touchstart': {
        if(this.tCapObject) {
          this.notify(this.tCapObject, e, 'touchend');
        }
        this.tCapObject = object;
        break;
      }
      case 'touchend': {
        if(this.tCapObject && !this.test(this.tCapObject, object)) {
          this.notify(this.tCapObject, e, 'touchend');
          notify = false;
        }
        else if(object && this.test(this.tCapObject, object)) {
          this.notify(object, e, 'touchtap');
        }
        this.tCapObject = undefined;
        break;
      }
      case 'touchtap': {
        notify = false;
        break;
      }
    }
    return notify;
  }

  convertMouse(e, data, object) {
    let notify = true;
    switch(e.type) {
      case 'mousedown': {
        if(this.mCapObject) {
          this.notify(this.mCapObject, e, 'mouseup');
        }
        this.mCapObject = object;
        break;
      }
      case 'mouseup': {
        if(this.mCapObject && !this.test(this.mCapObject, object)) {
          this.notify(this.mCapObject, e, 'mouseup');
          notify = false;
        }
        this.timeStamp = e.timeStamp;
        break;
      }
      case 'click': {
        notify = this.test(this.mCapObject, object) && e.timeStamp === this.timeStamp;
        this.mCapObject = undefined;
        break;
      }
      case 'mouseenter':
      case 'mouseover':
      case 'mousemove': {
        if(!this.test(this.mHovObject, object) && this.mHovObject) {
          this.notify(this.mHovObject, e, 'mouseout');
          this.mHovObject = undefined;
        }
        if(!this.mHovObject && object) {
          this.notify(object, e, 'mouseover');
          this.mHovObject = object;
        }
        notify = e.type === 'mousemove';
        break;
      }
      case 'mouseleave':
      case 'mouseout': {
        if(this.mHovObject) {
          this.notify(this.mHovObject, e, 'mouseout');
          this.mHovObject = undefined;
        }
        notify = false;
        break;
      }
    }
    return notify;
  }

}
