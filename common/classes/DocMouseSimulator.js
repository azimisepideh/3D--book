import {$} from '../libs'

export default class DocMouseSimulator {

  static HOVER = 'SIMULATED-HOVER';
  static ACTIVE = 'SIMULATED-ACTIVE';

  constructor(jFrame, element, bElement=document.body) {
    this.jFrame = jFrame;
    this.wnd = jFrame[0].contentWindow;
    this.doc = jFrame[0].contentDocument;
    this.element = element || doc.body;
    this.bElement = bElement;
    this.resendProperties = this.getDefaultResendProperties();
    this.undefinedProperties = this.getDefaultUndefinedProperties();
    this.cursors = [];
    this.onDocChangeClbs = [];
    const terms = [
                    {
                      find: ':hover',
                      replace: '.'+DocMouseSimulator.HOVER
                    },
                    {
                      find: ':active',
                      replace: '.'+DocMouseSimulator.ACTIVE
                    }
                  ];
    let style = ['<style type="text/css">'];
    for (let i = 0; i < this.doc.styleSheets.length; ++i) {
      let ss = this.doc.styleSheets[i];
      for (let j = 0; j < ss.cssRules.length; ++j) {
        let r = ss.cssRules[j], cssText;
        for(let term of terms) {
          if (~r.selectorText.indexOf(term.find)) {
            cssText = (cssText || r.cssText).replace(new RegExp(term.find, 'g'), term.replace);
          }
        }
        if(cssText) {
          style.push(cssText);
        }
      }
    }
    style.push('</style>');
    $(this.doc.head).append($(style.join('')));
  }

  convertCoords(x, y) {
    const jElement = $(this.element);
    const offset = jElement.offset();
    return {
      x: offset.left+jElement.width()*x,
      y: offset.top+jElement.height()*(1-y)
    };
  }

  triggerEvent(element, e, p, type, advancedProps) {
    const props = {};
    for(let n of this.resendProperties) {
      props[n] = e[n];
    }
    for(let n of this.undefinedProperties) {
      props[n] = undefined;
    }
    for(let n in advancedProps) {
      if(advancedProps.hasOwnProperty(n)) {
        props[n] = advancedProps[n];
      }
    }
    props.view = this.wnd;
    props.pageX = p.x;
    props.pageY = p.y;
    const jE = $.Event(type, props);
    jE.timeStamp = e.timeStamp;
    $(element).trigger(jE);
  }

  addClass(element, name) {
    $(element).addClass(name);
    const style = this.wnd.getComputedStyle(element);
    this.cursors.push($(this.bElement).css('cursor'));
    $(this.bElement).css('cursor', style.getPropertyValue('cursor'));
  }

  removeClass(element, name) {
    $(element).removeClass(name);
    $(this.bElement).css('cursor', this.cursors.pop());
  }

  enterElement(element) {
    this.addClass(element, DocMouseSimulator.HOVER);
  }

  leaveElement(element) {
    this.removeClass(element, DocMouseSimulator.HOVER);
  }

  activateElement(element) {
    this.addClass(element, DocMouseSimulator.ACTIVE);
  }

  deactivateElement(element) {
    this.removeClass(element, DocMouseSimulator.ACTIVE);
  }

  addDocChangeClb(clb) {
    this.onDocChangeClbs.push(clb);
  }

  notify() {
    for(let clb of this.onDocChangeClbs) {
      clb(this.wnd, this.doc);
    }
  }

  elementFromPoint(p) {
    let node = this.doc.body, next = true;
    while(next) {
      next = false;
      for(let i=0; i<node.childNodes.length; ++i) {
        const child = node.childNodes[i];
        if(child instanceof this.wnd.Element) {
          const jC = $(child), offset = jC.offset(), height = jC.height(), width = jC.width();
          if(p.x>offset.left && p.x<offset.left+width && p.y>offset.top && p.y<offset.top+height) {
            node = child;
            next = true;
            break;
          }
        }
      }
    }
    return node;
  }

  getElement(p) {
    const off0 = this.jFrame.offset();
    this.jFrame.offset({left: 0.5*window.innerWidth-p.x, top: 0.5*window.innerHeight-p.y});
    let element = this.doc.elementFromPoint(p.x, p.y);
    if(!element) { // it isn't a joke it's IE
      element = this.doc.elementFromPoint(p.x, p.y);
    }
    this.jFrame.offset(off0);
    return element? element: this.elementFromPoint(p);
  }

  simulate(e, doc, x, y) {
    const p = this.convertCoords(x, y),
          element = doc===this.doc? this.getElement(p): undefined;
    let trigger = element !== undefined, notify = false;

    switch(e.type) {
      case 'mousedown': {
        if(this.capElement) {
          this.deactivateElement(this.capElement);
          notify = true;
        }
        this.capElement = element;
        if(this.capElement) {
          this.activateElement(this.capElement);
          notify = true;
        }
        break;
      }
      case 'mouseup': {
        if(this.capElement) {
          this.deactivateElement(this.capElement);
          notify = true;
        }
        this.timeStamp = e.timeStamp;
        break;
      }
      case 'click': {
        trigger = element && this.capElement === element && e.timeStamp === this.timeStamp;
        this.capElement = undefined;
        break;
      }
      case 'mouseenter':
      case 'mouseover':
      case 'mousemove': {
        let leaved = null;
        if(this.hovElement !== element && this.hovElement) {
          this.triggerEvent(this.hovElement, e, p, 'mouseout', {relatedTarget: element? element: null});
          this.leaveElement(this.hovElement);
          leaved = this.hovElement;
          this.hovElement = undefined;
          notify = true;
        }
        if(!this.hovElement && element) {
          this.triggerEvent(element, e, p, 'mouseover', {relatedTarget: leaved});
          this.enterElement(element);
          this.hovElement = element;
          notify = true;
        }
        trigger = element && e.type === 'mousemove';
        break;
      }
      case 'mouseleave':
      case 'mouseout': {
        if(this.hovElement) {
          this.triggerEvent(this.hovElement, e, p, 'mouseout', {relatedTarget: e.relatedTarget});
          this.leaveElement(this.hovElement);
          this.hovElement = undefined;
          notify = true;
        }
        trigger = false;
        break;
      }
    }
    if(trigger) {
      this.triggerEvent(element, e, p, e.type);
    }
    if(notify) {
      this.notify();
    }
  }

  getDefaultUndefinedProperties() {
    return [
      'clientX',
      'clientY',
      'offsetX',
      'offsetY',
      'screenX',
      'screenY'
    ];
  }

  getDefaultResendProperties() {
    return [
      'altKey',
      'bubbles',
      'button',
      'buttons',
      'cancelable',
      'changedTouches',
      'char',
      'charCode',
      'ctrlKey',
      'data',
      'detail',
      'eventPhase',
      'isDefaultPrevented',
      'key',
      'keyCode',
      'metaKey',
      'pointerId',
      'pointerType',
      'shiftKey',
      'targetTouches',
      'touches',
      'which'
    ];
  }

}

/*
altKey,
bubbles,
button,
buttons,
cancelable,
changedTouches,
char,
charCode,
clientX,
clientY,
ctrlKey,
currentTarget,
data,
delegateTarget,
detail,
eventPhase,
handleObj,
isDefaultPrevented,
key,
keyCode,
metaKey,
offsetX,
offsetY,
originalEvent,
pageX,
pageY,
pointerId,
pointerType,
relatedTarget,
screenX,
screenY,
shiftKey,
target,
targetTouches,
timeStamp,
toElement,
touches,
type,
view,
which
*/
