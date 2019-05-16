import {React} from '../libs';

import TextProp from './TextProp';
import IntProp from './IntProp';
import BoolProp from './BoolProp';
import FloatProp from './FloatProp';
import FileProp from './FileProp';
import ColorProp from './ColorProp';
import SelectProp from './SelectProp';

export default class PropFactory {

  static Props = {
    text: TextProp,
    file: FileProp,
    int: IntProp,
    bool: BoolProp,
    float: FloatProp,
    color: ColorProp,
    select: SelectProp
  };

  static createProp(props, key=null) {
    const Class = PropFactory.Props[props.type];
    return Class? <Class key={key} {...props} />: null;
  }

}
