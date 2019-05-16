import {$} from '../libs';
import ImageBase from './ImageBase';
import Pdf from './Pdf';
import BaseMathUtils from './BaseMathUtils';
import CustomEventConverter from './CustomEventConverter';
import PolyTarget from './targets/PolyTarget';

import Finder from './Finder';

export default class PdfImage extends ImageBase {

  constructor(context, width, height, color, pdf, n) {
    super(context, width, height, color);

    this.query = '';
    this.n = n;
    this.pdf = pdf;
    this.v = {x: 0, y: 0, z: 0, set: function(x,y,z) {
      this.x=x; this.y=y; this.z=z;
      return this;
    }, transform: function(m) {
      const x=m.m[0][0]*this.x+m.m[1][0]*this.y+m.m[2][0]*this.z,
            y=m.m[0][1]*this.x+m.m[1][1]*this.y+m.m[2][1]*this.z,
            z=m.m[0][2]*this.x+m.m[0][2]*this.y+m.m[2][0]*this.z;
      this.x=x;
      this.y=y;
      this.z=z;
      return this;
    }};
    this.m = {m: [[1,0,0],[0,1,0],[0,0,1]], set: function(m00,m01,m02,m10,m11,m12,m20,m21,m22) {
      this.m=[[m00,m01,m02],[m10,m11,m12],[m20,m21,m22]];
      return this;
    }};

    this.startRender = ()=> {
      this.pdf.getHandler(this.render.bind(this));
    };
    Promise.resolve().
      then(()=> this.pdf.getHandler(this.init.bind(this)));
  }

  setQuery(query) {
    this.query = query.trim();
    if(this.textContent) {
      this.setHits(this.textContent);
      this.finishLoad();
    }
  }

  rectSize(r) {
    return {
      width: r[2]-r[0],
      height: r[3]-r[1]
    };
  }

  createPoly(m, p, s) {
    const poly = [], v = this.v;
    v.set(p.x, p.y, 1).transform(m);
    poly.push({x: v.x, y: v.y});
    v.set(p.x, p.y+s.height, 1).transform(m);
    poly.push({x: v.x, y: v.y});
    v.set(p.x+s.width, p.y+s.height, 1).transform(m);
    poly.push({x: v.x, y: v.y});
    v.set(p.x+s.width, p.y, 1).transform(m);
    poly.push({x: v.x, y: v.y});
    return poly;
  }

  getSimulatedDoc() {
    return this.page;
  }

  simulate(e, doc, x, y) {
    if(this.eventConverter) {
      this.eventConverter.convert(e, {doc, x, y});
    }
  }

  setAnnotations(annos) {
    const t = this.viewport.transform,
      targets = [];
    this.m.set(
      t[0],t[1],0,
      t[2],t[3],0,
      t[4],t[5],1);

    for(let anno of annos) {
      if (anno.subtype==='Link') {
        const rect = anno.rect,
          aPos = {
            x: rect[0],
            y: rect[1]
          },
          aSz = this.rectSize(rect);
        const target = new PolyTarget(this.createPoly(this.m, aPos, aSz).map((p)=> ({x: p.x/this.viewport.width, y: 1-p.y/this.viewport.height})));
        target.anno = anno;
        target.callback = this.annoClb.bind(this);
        targets.push(target);
      }
    }
    if(targets.length) {
      this.eventConverter = new CustomEventConverter(this.wnd, this.doc, PolyTarget.test, this.page);
      for(let target of targets) {
        this.eventConverter.addCustom(target);
      }
    }
  }

  setHits(textContent) {
    this.textContent = textContent;
    if(this.query!=='') {
      this.finder = new Finder(textContent.items.map((item)=> item.str), this.query, {contexts: false});
    }
  }

  renderHits() {
    if(this.finder) {
      const view = this.page.view,
        testSz = $('<div style="position: absolute; visibility: hidden;"></div>').appendTo('body'), textDiv = testSz[0],
        baseOffset = testSz.offset().left;
      for(let hit of this.finder.getHits()) {
          const item = this.textContent.items[hit.index],
                t = PDFJS.Util.transform(this.viewport.transform, item.transform),
                style = this.textContent.styles[item.fontName],
                angle = Math.atan2(t[1], t[0])+(style.vertical? Math.PI / 2: 0),
                fontHeight = Math.sqrt((t[2] * t[2]) + (t[3] * t[3])),
                fontAscent = style.ascent?
                              style.ascent * fontHeight:
                              (style.descent? (1 + style.descent) * fontHeight: fontHeight);
          testSz.html(item.str.substr(0, hit.offset)+'<span>'+item.str.substr(hit.offset, hit.length)+'</span>'+item.str.substr(hit.offset+hit.length));

          textDiv.style.fontSize = fontHeight+'px';
          textDiv.style.fontFamily = style.fontFamily;

          const testSpan = testSz.find('span'),
              iwidth = style.vertical? item.height*this.viewport.scale: item.width*this.viewport.scale,
              width = testSz.width(),
              relativeOffset = (testSpan.offset().left-baseOffset)/width;
          this.m.set(
            1,0,0,
            0,1,0,
            t[4]+fontAscent*Math.sin(angle),t[5]-fontAscent*Math.cos(angle),1);
          let poly = this.createPoly(this.m, {x: relativeOffset*iwidth, y: 0}, {width: iwidth*testSpan.width()/width, height: testSpan.height()});
          poly = poly.map((p)=> ({x: p.x/this.viewport.width, y: 1-p.y/this.viewport.height}));
          this.renderHit(poly);
      }
      testSz.remove();
    }
  }

  annoClb(e, data) {
    if(this.context.dispatchEvent) {
      this.context.dispatchEvent({
        type: 'pdfAnnotation',
        event: e,
        annotation: data.target.anno
      });
    }
  }

  init(handler) {
    handler.getPage(this.n+1).
      then((page)=> {
        this.page = page;
        this.size = Pdf.getPageSize(page);
        page.getAnnotations().
          then(this.setAnnotations.bind(this));
        page.getTextContent().
          then(this.setHits.bind(this));
        const scale = BaseMathUtils.calcScale(this.size.width, this.size.height, this.resW, this.resH);
        this.viewport = page.getViewport(scale);
        this.resW = this.width = this.viewport.width;
        this.resH = this.height = this.viewport.height;
        this.finishLoad();
      }).
      catch((e)=> {
        console.error('Cannot load PDF page: '+(this.n+1));
        this.finishLoad();
      });
  }

  render(handler) {
    if(this.page) {
      this.page.render({
        canvasContext: this.pushCtx(),
        viewport: this.viewport
      }).
      then(()=> {
        this.renderHits();
        this.popCtx();
        this.finishRender();
      });
    }
    else {
      this.renderBlankPage();
      this.finishRender();
    }
  }

}
