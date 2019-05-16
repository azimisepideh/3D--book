import {React, $, tr} from '../libs';
import Prop from './Prop';

export default class ColorProp extends Prop {

  componentDidUpdate() {
    if(!this.container) {
      const {container} = this.refs, {setValue} = this.props;
      this.container = $(container);
      this.container.ColorPicker({
      	flat: true,
      	color: this.color2RGB(this.getColor()),
      	onSubmit: ()=> this.container.css('display', 'none'),
      	onChange: (hsb, hex, rgb)=> setValue((rgb.r<<16)|(rgb.g<<8)|rgb.b)
      });
      $(container.ownerDocument).click((e)=> {
				let c = container, el = e.target;
				while(el && el!=c) {
					el = el.parentNode;
				}
				if(!el) {
					this.container.ColorPickerSetColor(this.color2RGB(this.getColor()));
					this.container.css('display', 'none');
				}
			});
    }
  }

  getColor() {
    return this.props.value==='auto'? this.props.defValue: this.props.value;
  }

  color2RGB(c) {
    return {
      r: (c>>16)&0xff,
      g: (c>>8)&0xff,
      b: c&0xff
    };
  }

  showColorPicker(e) {
    e.stopPropagation();
    this.container.css('display', 'block');
  }

  renderContent() {
    const {name, defValue, setValue} = this.props, value = this.props.value===undefined? 'auto': this.props.value, rgb = this.color2RGB(this.getColor()), defRgb = this.color2RGB(defValue);
    const defStyle = {
      backgroundColor: ['rgb(',defRgb.r, ',', defRgb.g, ',', defRgb.b,')'].join(''),
    },
    style = {
      backgroundColor: ['rgb(', rgb.r, ',', rgb.g, ',', rgb.b, ')'].join('')
    };
    return (
      <div class="color-prop">
        <div class="input-group">
          <div class="input-group-addon" style={defStyle}></div>
          <input type="hidden" name={name} value={value} />
          <input type="text" onClick={this.showColorPicker.bind(this)} class="form-control" id={name} style={style} value={style.backgroundColor} />
          <span class="input-group-btn">
            <a href="#" onClick={(e)=> [e.preventDefault(), setValue('auto')]} class={'btn btn-default'+(value==='auto'?' disabled': '')}>{tr('auto')}</a>
          </span>
        </div>
        <div ref="container" class="color-container"></div>
      </div>
    );
  }
}
