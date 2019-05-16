import {React, tr} from '../libs';
import Prop from './Prop';

export default class BoolProp extends Prop {

  setAuto(e) {
    const {setValue, defValue} = this.props;
    setValue(e.target.checked? 'auto': (defValue? '1': '0'));
  }

  setValue(e) {
    const {setValue} = this.props;
    setValue(e.target.checked? '1': '0');
  }

  renderContent() {
    const {name, value, setValue} = this.props;
    return (
      <div>
        <input type="hidden" name={name} value={value} />
        <div class="checkbox">
          <label>
            <input onChange={this.setAuto.bind(this)} checked={value==='auto'} type="checkbox" /> {tr('auto')}
          </label>
        </div>
        <div class="checkbox">
          <label class={value==='auto'? 'hidden': ''}>
            <input onChange={this.setValue.bind(this)} checked={value==='1'} type="checkbox" /> {tr('yes')}
          </label>
        </div>
      </div>
    );
  }
}
