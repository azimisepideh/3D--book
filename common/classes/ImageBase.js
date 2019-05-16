import {$} from '../libs';
import GraphUtils from './GraphUtils';

export default class ImageBase {

  static renderCanvas =  $('<canvas>')[0];
  static renderCanvasCtx = ImageBase.renderCanvas.getContext('2d');

  constructor(context, width, height, color) {
    this.context = context;
    this.wnd = context.wnd;
    this.doc = context.doc;
    this.element = context.element || context.doc.body;
    this.c = context.renderCanvas || ImageBase.renderCanvas;
    this.ctx = context.renderCanvasCtx || ImageBase.renderCanvasCtx;
    this.resW = this.width = width;
    this.resH = this.height = height;
    this.color = color;
  }

  dispose() {

  }

  renderBlankPage() {
    this.ctx.beginPath();
    this.ctx.fillStyle = GraphUtils.color2Rgba(this.color, 1);
    this.ctx.rect(0, 0, this.c.width, this.c.height);
    this.ctx.fill();
  }

  renderImage(image) {
    this.pushCtx();
    this.ctx.drawImage(image, 0, 0);
    this.popCtx();
  }

  normToConv(p) {
    return {
      x: p.x*this.c.width,
      y: (1-p.y)*this.c.height
    };
  }

  renderHit(poly) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255,255,0,0.4)';
    ctx.beginPath();
    let p = this.normToConv(poly[0]);
    ctx.moveTo(p.x, p.y);
    for(let i=1; i<poly.length; ++i) {
      p = this.normToConv(poly[i]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fill();
  }

  pushCtx() {
    if(this.resW!=this.c.width) {
      this.c.width = this.resW;
    }
    if(this.resH!=this.c.height) {
      this.c.height = this.resH;
    }
    this.ctx.save();
    this.ctx.scale(this.c.width/this.width, this.c.height/this.height);
    return this.ctx;
  }

  popCtx() {
    this.ctx.restore();
  }

  renderNotFoundPage() {
    this.renderBlankPage();
  }

  finishRender() {
    if(this.onChange) {
      this.onChange(this.c);
    }
  }

  finishLoad() {
    if(this.onLoad) {
      this.onLoad();
    }
    else {
      this.startRender();
    }
  }

  getSimulatedDoc() {
    return undefined;
  }

}
