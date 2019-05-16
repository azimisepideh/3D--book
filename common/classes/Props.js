import {React} from '../libs';
import Component from 'Component';
import PropFactory from 'PropFactory';
import Prop from 'Prop';

export default class Props extends Component {

  // virtual
  getDivClassName() {
    return 'props';
  }

  // virtual
  getFullName(name) {
    return '3dfb-post-props-'+name;
  }

  getFieldNames() {
    return Object.keys(this.props.defs);
  }

  // virtual
  setProperty(name, value) {

  }

  static setValue(value) {
    this.self.setProperty(this.name, value);
  }

  render() {
    const {props, defs, info, post} = this.props;
    return (
      <div class={this.getDivClassName()}>
        {this.getFieldNames().map((name, key)=> {
          let content;
          if(typeof props[name]==='object') {
            content = null;
          }
          else {
            content = PropFactory.createProp({
              ...info[name],
              post,
              name: this.getFullName(name),
              value: Prop.normalize(props[name]),
              defValue: defs[name],
              setValue: Props.setValue.bind({self: this, name}),
              label: name
            }, key);
          }
          return content;
        })}
      </div>
    );
  }
}
