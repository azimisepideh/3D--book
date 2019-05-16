import {React, tr} from '../libs';
import Prop from './Prop';

export default class IntProp extends Prop {

  filterCharacters(s) {
    const n = [];
    for(let c of s) {
      if(c.match(/^\d$/)) {
        n.push(c);
      }
    }
    return n.join('');
  }

  renderContent() {
    const {name, value, defValue, setValue} = this.props;
    return (
      <div class="input-group">
        <div class="input-group-addon">{Math.round(defValue)}</div>
        <input type="text" class="form-control" onChange={(e)=> setValue(this.filterCharacters(e.target.value))} id={name} name={name} value={value} />
        <span class="input-group-btn">
          <a href="#" onClick={(e)=> [e.preventDefault(), setValue('auto')]} class={'btn btn-default'+(value==='auto'?' disabled': '')}>{tr('auto')}</a>
        </span>
      </div>
    );
  }
}
