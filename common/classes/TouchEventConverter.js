import {$} from '../libs';
import EventConverter from './EventConverter';

export default class TouchConverter extends EventConverter {

  constructor(wnd, doc, element) {
    super(wnd, doc);

    this.element = element;
    this.binds = {
      convert: this.convert.bind(this)
    };
    $(this.element).on('touchstart touchmove', this.binds.convert);
    $(this.doc).on('touchend', this.binds.convert);
  }

  dispose() {
    $(this.element).off('touchstart touchmove', this.binds.convert);
    $(this.doc).off('touchend', this.binds.convert);
  }
}
