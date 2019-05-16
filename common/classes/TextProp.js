import {React, tr} from '../libs';
import Prop from './Prop';

export default class TextProp extends Prop {

  renderContent() {
    const {name, defValue, setValue} = this.props, value = this.props.value || 'auto';
    return (
      <div class="input-group">
        <div class="input-group-addon">{defValue}</div>
        <input type="text" class="form-control" onChange={(e)=> setValue(e.target.value)} id={name} name={name} value={value} />
        <span class="input-group-btn">
          <a href="#" onClick={(e)=> [e.preventDefault(), setValue('auto')]} class={'btn btn-default'+(value==='auto'?' disabled': '')}>{tr('auto')}</a>
        </span>
      </div>
    );
  }
}
