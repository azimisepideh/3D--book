import {React, tr} from '../libs';
import Prop from './Prop';

export default class SelectProp extends Prop {

  renderContent() {
    const {name, defValue, setValue, options} = this.props, value = this.props.value || 'auto';
    return (
      <div class="input-group">
        <div class="input-group-addon">{options[defValue]}</div>
        <select class="form-control" onChange={(e)=> setValue(e.target.value)} name={name} id={name} value={value} >
          <option value={'auto'}>{tr('auto')}</option>
          {Object.keys(options).map((name)=> (<option value={name}>{options[name]}</option>))}
        </select>
        <span class="input-group-btn">
          <a href="#" onClick={(e)=> [e.preventDefault(), setValue('auto')]} class={'btn btn-default'+(value==='auto'?' disabled': '')}>{tr('auto')}</a>
        </span>
      </div>
    );
  }
}
