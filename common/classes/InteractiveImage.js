import {$, html2canvas} from '../libs';
import ImageBase from './ImageBase';
import BaseMathUtils from './BaseMathUtils';
import Dom2Image from './Dom2Image';
import DocMouseSimulator from './DocMouseSimulator';

export default class InteractiveImage extends ImageBase {

  constructor(context, width, height, color, src, cache, injector) {
    super(context, width, height, color);

    this.iId = 'i'+BaseMathUtils.getUnique();
    const jFrame = $('<iframe id="'+this.iId+'" src="' + src + '" style="position: fixed; left: -1000px;"></iframe>');
    $(this.doc.body).append(jFrame);
    this.frame = jFrame[0];

    this.binds = {};

    if(injector) {
      injector(this.frame.contentWindow);
    }

    if(this.doc.implementation.hasFeature('www.http://w3.org/TR/SVG11/feature#Extensibility', '1.1')) { // svg foreignObject renderer
      this.image = new Image();
      this.binds.imageLoad = ()=> {
        this.renderImage(this.image);
        this.finishRender();
      };
      $(this.image).on('load', this.binds.imageLoad);
      this.svgRender = new Dom2Image(this.frame.contentWindow, this.frame.contentDocument, cache);
    } // otherwise - html2canvas

    this.binds.frameLoad = ()=> {
      if(~this.frame.contentDocument.title.indexOf('404')) {
        this.startRender = ()=> {
          this.renderNotFoundPage();
          this.finishRender();
        };
        this.finishLoad();
      }
      else {
        setTimeout(()=> {
          if(this.frame) {
            this.width = $(this.frame.contentDocument.body).width();
            this.height = $(this.frame.contentDocument.body).height();
            jFrame.css('width', this.width+'px').css('height', this.height+'px');
            jFrame.offset({left: -this.width-100, top: 0});
            if(this.svgRender) {
              this.simulator = new DocMouseSimulator(jFrame, this.frame.contentDocument.body, this.element);
              this.simulator.addDocChangeClb(this.finishLoad.bind(this));
            }
            this.startRender = ()=> {
              this.render();
            };
            this.finishLoad();
          }
        }, 500);
      }
    };
    $(this.frame.contentWindow).on('load', this.binds.frameLoad);
  }

  getSimulatedDoc() {
    return this.frame.contentDocument;
  }

  render() {
    if(this.svgRender) {
      this.svgRender.toSvg(this.simulator.element, {height: this.height+'px', width: this.width+'px'})
        .then((dataUrl)=> {
          this.image.src = dataUrl;
        })
        .catch((error)=> {
          console.error('Dom2Image: ', error);
          this.renderBlankPage();
          this.finishRender();
        });
    }
    else {
      html2canvas(this.frame.contentDocument.body, {timeout: 30000}).
        then((canvas)=> {
          this.renderImage(canvas);
          this.finishRender();
        });
    }
  }

  dispose() {
    $(this.image).off('load', this.binds.imageLoad);
    $(this.frame.contentWindow).off('load', this.binds.frameLoad);
    $(this.doc.body).find('#'+this.iId).remove();
    if(this.image) {
      this.image.src = '';
      delete this.image;
    }
    this.frame.src = '';
    delete this.frame;
    super.dispose();
  }

  simulate(e, doc, x, y) {
    if(this.simulator) {
      this.simulator.simulate(e, doc, x, y);
    }
  }

}
