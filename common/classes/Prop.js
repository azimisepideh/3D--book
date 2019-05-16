import {React} from '../libs';
import Component from './Component';

export default class Prop extends Component {

  // virtual
  renderContent() {
    return null;
  }

  static normalize(value) {
    return value===undefined || value==='auto'? 'auto': value;
  }

  render() {
    const {name, label, description} = this.props;
    return (
      <div class="form-group">
        <div class="prop-caption">
          <label for={name}>{label}</label>
          {description? <div class="popup alert alert-info">{description}</div>: ''}
        </div>
        {this.renderContent()}
      </div>
    );
  }
}
