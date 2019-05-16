import {THREE, $} from '../libs';
import {CSS3DObject} from './CSS3DRenderer';

export default class CSSLayer extends CSS3DObject {

  static delay;
  static style;
  static init(doc, delay=150) {
    CSSLayer.delay = delay;
    CSSLayer.style = $(`<style type=text/css>
      .css-layer {
    		opacity: 1;
    		transition: opacity ${delay}ms ease-out;
        visibility: visible;
        overflow: hidden;
    	}
    	.css-layer.hidden {
    		transition: opacity ${delay}ms ease-in, visibility ${delay}ms step-end;
    		opacity: 0;
        visibility: hidden;
      }
    </style>`).appendTo(doc.head);
  }
  static dispose() {
    CSSLayer.style.remove();
  }

  constructor(width, height, widthPxs=1024) {
    super();

    this.jContainer = $('<div class="hidden css-layer"></div>');
  	const heightPxs = height/width*widthPxs;
    this.jContainer.width(widthPxs).height(heightPxs);
  	this.scale.x /= widthPxs/width;
  	this.scale.y /= widthPxs/width;

    this.setData();
    this.set(this.jContainer[0]);
  }

  callInternal(name) {
    if(this.object && this.object[name]) {
      try {
        this.object[name]();
      }
      catch(e) {
        console.error(e);
      }
    }
  }

  dispose() {
    this.clearInternals();
  }

  clearInternals() {
    this.callInternal('dispose');
    !this.css || this.css.remove();
    !this.html || this.html.remove();
  }

  setData(css='', html='', js='') {
    this.clearInternals();

    this.css = $(`<style type="text/css">${css}</style>`).appendTo(this.jContainer);
    this.html = $(html).appendTo(this.jContainer);
    const init = eval(js);
    if(init) {
      this.object = init(this.jContainer) || {};
    }
  }

  pendedCall(clb) {
    const timestamp = this.timestamp = Date.now();
    setTimeout(()=> {
      if(timestamp===this.timestamp) {
        clb();
      }
    }, CSSLayer.delay);
  }

  isHidden() {
    return this.jContainer.hasClass('hidden');
  }

  hide() {
    let res;
    if(!this.isHidden()) {
      this.jContainer.addClass('hidden');
      this.callInternal('hide');
      res = new Promise((resolve)=> {
        this.pendedCall(()=> {
          this.callInternal('hidden');
          resolve();
        });
      });
    }
    else {
      res = Promise.resolve();
    }
    return res;
  }

  show() {
    let res;
    if(this.isHidden()) {
      this.jContainer.removeClass('hidden');
      this.callInternal('show');
      res = new Promise((resolve)=> {
        this.pendedCall(()=> {
          this.callInternal('shown');
          resolve();
        });
      });
    }
    else {
      res = Promise.resolve();
    }
    return res;
  }

}
