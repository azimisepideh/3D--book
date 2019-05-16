import {$} from '../libs';
import EventConverter from './EventConverter';

export default class MouseEventConverter extends EventConverter {

  constructor(wnd, doc, element) {
    super(wnd, doc);

    this.element = element;
    this.binds = {
      convert: this.convert.bind(this)
    };
    $(this.element).on('mousemove mousedown mouseover mouseout click', this.binds.convert);
    $(this.doc).on('mouseup', this.binds.convert);
  }

  dispose() {
    $(this.element).off('mousemove mousedown mouseover mouseout click', this.binds.convert);
    $(this.doc).off('mouseup', this.binds.convert);
  }
}
