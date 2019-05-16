import {$} from '../libs';
require('imports-loader?define=>false!jquery-mousewheel')($);

export default class EventsToActions {

  static modKeys = {
    Ctrl: 1,
    Shift: 2,
    Alt: 4
  };

  static mouseButtons = {
    Left: 0,
    Middle: 1,
    Right: 2
  };

  static getEventFlags(e) {
    return e.ctrlKey<<0 | e.shiftKey<<1 | e.altKey<<2;
  }

  static getPosition(touches) {
    let x, y;
    if(touches.length===2) {
      x = touches[1].pageX-touches[0].pageX;
      y = touches[1].pageY-touches[0].pageY;
      y = -Math.sqrt(x*x+y*y);
      x = 0;
    }
    else {
      x = touches[0].pageX;
      y = touches[0].pageY;
    }
    return {
      x,
      y
    };
  }

  constructor(element, actions) {
    this.actions = actions || {};
    this.element = element;
    this.doc = element[0].ownerDocument;
    this.wnd = this.doc.defaultView;
    this.enabled = true;

    this.binds = {
      contextMenu: this.contextMenu.bind(this),

      mouseDown: this.mouseDown.bind(this),
      mouseMove: this.mouseMove.bind(this),
      mouseUp: this.mouseUp.bind(this),
      mouseWheel: this.mouseWheel.bind(this),

      mouseMoveDoc: this.mouseMoveDoc.bind(this),
      mouseUpDoc: this.mouseUpDoc.bind(this),

      click: this.click.bind(this),
      dblclick: this.dblclick.bind(this),

      touchStart: this.touchStart.bind(this),
      touchMove: this.touchMove.bind(this),
      touchEnd: this.touchEnd.bind(this),

      keyDown: this.keyDown.bind(this),
      keyPress: this.keyPress.bind(this),
      keyUp: this.keyUp.bind(this)
    };

    this.element.on('contextmenu', this.binds.contextMenu);

    this.element.on('mousedown', this.binds.mouseDown);
    this.element.on('mousemove', this.binds.mouseMove);
    this.element.on('mouseup', this.binds.mouseUp);
    this.element.on('mousewheel', this.binds.mouseWheel);

    $(this.doc).on('mousemove', this.binds.mouseMoveDoc);
    $(this.doc).on('mouseup', this.binds.mouseUpDoc);

    this.element.on('click', this.binds.click);
    this.element.on('dblclick', this.binds.dblclick);

    this.element.on('touchstart', this.binds.touchStart);
    this.element.on('touchmove', this.binds.touchMove);
    this.element.on('touchend', this.binds.touchEnd);

    $(this.wnd).on('keydown', this.binds.keyDown);
    $(this.wnd).on('keypress', this.binds.keyPress);
    $(this.wnd).on('keyup', this.binds.keyUp);
  }

  addAction(action, type, code, flags) {
    type = type.toLowerCase();
    if(!this.actions[type]) {
      this.actions[type] = {};
    }
    if(!this.actions[type][code]) {
      this.actions[type][code] = {}
    }
    if(!this.actions[type][code][flags]) {
      this.actions[type][code][flags] = [];
    }
    this.actions[type][code][flags].push(action);
  }

  getActions(type, code, flags) {
    return ((this.actions[type] || {})[code] || {})[flags] || [];
  }

  fireActions(actions, e, data) {
    for(let action of actions) {
      action(e, data);
    }
  }

  contextMenu(e) {
    if(this.enabled) {
      const flags = EventsToActions.getEventFlags(e);
      this.fireActions(this.getActions('contextmenu', e.button, flags), e);
    }
  }

  mouseDown(e) {
    if(this.picked) {
      this.mouseUpDoc();
    }
    if(this.enabled) {
      const flags = EventsToActions.getEventFlags(e);
      this.fireActions(this.getActions('mousedown', e.button, flags), e);
      this.picked = {
        x: e.pageX,
        y: e.pageY,
        actions: this.getActions('mousedrag', e.button, flags)
      };
      this.fireActions(this.picked.actions, e, {
        state: 'start'
      });
    }
  }

  mouseMove(e) {
    if(this.enabled) {
      const flags = EventsToActions.getEventFlags(e);
      this.fireActions(this.getActions('mousemove', e.button, flags), e);
    }
  }

  mouseMoveDoc(e) {
    if(this.enabled && this.picked) {
      this.fireActions(this.picked.actions, e, {
        state: 'move',
        dx: e.pageX-this.picked.x,
        dy: e.pageY-this.picked.y
      });
      this.picked = {
        x: e.pageX,
        y: e.pageY,
        actions: this.picked.actions
      };
    }
  }

  mouseUp(e) {
    if(this.enabled) {
      const flags = EventsToActions.getEventFlags(e);
      this.fireActions(this.getActions('mouseup', e.button, flags), e);
    }
  }

  mouseUpDoc(e) {
    if(this.picked) {
      this.fireActions(this.picked.actions, e, {
        state: 'end'
      });
      delete this.picked;
    }
  }

  mouseWheel(e) {
    if(this.enabled) {
      const flags = EventsToActions.getEventFlags(e);
      this.fireActions(this.getActions('mousewheel', 0, flags), e);
    }
  }

  clicks(e, type) {
    if(this.enabled) {
      const flags = EventsToActions.getEventFlags(e);
      this.fireActions(this.getActions(type, e.button, flags), e);
    }
  }

  click(e) {
    this.clicks(e, 'click');
  }

  dblclick(e) {
    this.clicks(e, 'dblclick');
  }

  touchPick(e, flags, touches) {
    this.touchPicked = {
      ...EventsToActions.getPosition(touches),
      actions: this.getActions('touchdrag', touches.length, flags),
      code: touches.length,
      flags
    };
    this.fireActions(this.touchPicked.actions, e, {
      state: 'start'
    });
  }

  touchStart(e) {
    if(this.touchPicked) {
      this.touchEnd(e);
    }
    if(this.enabled) {
      const flags = EventsToActions.getEventFlags(e), touches = e.touches || e.originalEvent.touches;
      this.fireActions(this.getActions('touchstart', touches.length, flags), e);
      this.touchPick(e, flags, touches);
    }
  }

  touchMove(e) {
    if(this.enabled) {
      const flags = EventsToActions.getEventFlags(e), touches = e.touches || e.originalEvent.touches;
      this.fireActions(this.getActions('touchmove', touches.length, flags), e);
      if(this.touchPicked) {
        if(this.touchPicked.code===touches.length && this.touchPicked.flags===flags) {
          const pos = EventsToActions.getPosition(touches);
          this.fireActions(this.touchPicked.actions, e, {
            state: 'move',
            dx: pos.x-this.touchPicked.x,
            dy: pos.y-this.touchPicked.y
          });
          this.touchPicked = {
            ...this.touchPicked,
            ...pos
          };
        }
        else {
          this.touchEnd(e);
          this.touchPick(e, flags, touches);
        }
      }
    }
  }

  touchEnd(e) {
    if(this.touchPicked) {
      this.fireActions(this.touchPicked.actions, e, {
        state: 'end'
      });
      delete this.touchPicked;
    }
  }

  key(e, type) {
    if(this.enabled) {
      const flags = EventsToActions.getEventFlags(e);
      this.fireActions(this.getActions(type, e.keyCode, flags), e);
    }
  }

  keyDown(e) {
    this.key(e, 'keydown');
  }

  keyPress(e) {
    this.key(e, 'keypress');
  }

  keyUp(e) {
    this.key(e, 'keyup');
  }

  dispose() {
    this.element.off('contextmenu', this.binds.contextMenu);

    this.element.off('mousedown', this.binds.mouseDown);
    this.element.off('mousemove', this.binds.mouseMove);
    this.element.off('mouseup', this.binds.mouseUp);
    this.element.off('mousewheel', this.binds.mouseWheel);

    $(this.doc).off('mousemove', this.binds.mouseMoveDoc);
    $(this.doc).off('mouseup', this.binds.mouseUpDoc);

    this.element.off('click', this.binds.click);
    this.element.off('dblclick', this.binds.dblclick);

    this.element.off('touchstart', this.binds.touchStart);
    this.element.off('touchmove', this.binds.touchMove);
    this.element.off('touchend', this.binds.touchEnd);

    $(this.wnd).off('keydown', this.binds.keyDown);
    $(this.wnd).off('keypress', this.binds.keyPress);
    $(this.wnd).off('keyup', this.binds.keyUp);
  }

}
