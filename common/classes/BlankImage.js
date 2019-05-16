import {$} from '../libs';
import ImageBase from './ImageBase';

export default class BlankImage extends ImageBase {

  constructor(context, width, height, color) {
    super(context, width, height, color);

    Promise.resolve().
      then(()=> {
        this.startRender = ()=> {
          this.renderBlankPage();
          this.finishRender();
        };
        this.finishLoad();
      });
  }
}
