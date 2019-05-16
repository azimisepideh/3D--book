import {$} from '../libs';
import ImageBase from './ImageBase';
import Utils from './Utils';

export default class StaticImage extends ImageBase {

  constructor(context, width, height, color, src) {
    super(context, width, height, color);

    this.binds = {}
    this.image = new Image();
    this.image.crossOrigin = 'Anonymous';
    this.binds.imageLoad = ()=> {
      this.width = this.image.width;
      this.height = this.image.height;
      this.startRender = ()=> {
        this.renderImage(this.image);
        this.finishRender();
      };
      this.finishLoad();
    };
    this.binds.imageError = ()=> {
      this.startRender = ()=> {
        this.renderNotFoundPage();
        this.finishRender();
      };
      this.finishLoad();
    };
    $(this.image).on('load', this.binds.imageLoad).on('error', this.binds.imageError);
    this.image.src = Utils.normalizeUrl(src);
  }

  dispose() {
    $(this.image).off('load', this.binds.imageLoad).off('error', this.binds.imageError);
    this.image.src = '';
    delete this.image;
    super.dispose();
  }

}
