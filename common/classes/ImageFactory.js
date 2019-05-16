import Cache from './Cache';
import BlankImage from './BlankImage';
import StaticImage from './StaticImage';
import PdfImage from './PdfImage';
import InteractiveImage from './InteractiveImage';

export default class ImageFactory {

  constructor(context, cache) {
    this.context = context;
    this.cache = cache || new Cache();
  }

  build(info, n=0, widthTexels=210, heightTexels=297, color=0xFFFFFF, injector=undefined) {
    let image;
    switch(info.type) {
      case 'html': {
        image = new InteractiveImage(this.context, widthTexels, heightTexels, color, info.src, this.cache, injector);
        break;
      }
      case 'image': {
        image = new StaticImage(this.context, widthTexels, heightTexels, color, info.src);
        break;
      }
      case 'pdf': {
        image = new PdfImage(this.context, widthTexels, heightTexels, color, info.src, n);
        break;
      }
      case 'blank':
      default: {
        image = new BlankImage(this.context, widthTexels, heightTexels, color);
        break;
      }
    }
    return image;
  }
}
