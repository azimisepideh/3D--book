import {React, $} from '../libs';

export default class Component extends React.Component {

  static spaceIfUndefined(value) {
    return value===undefined? '': value;
  }

  static preventDefault(e) {
    e.preventDefault();
  }

  tabClass(name, disabled=false) {
    const {activeTab} = this.props;
    return (activeTab===name? 'active ': '')+(disabled? 'disabled ': '');
  }

  switchTab(e) {
    e.preventDefault();
    let el = e.target;
    while(el && $(el).attr('data')===undefined) {
      el = el.parentNode;
    }
    if(el && !$(el.parentNode).hasClass('disabled')) {
      this.setActiveTab($(el).attr('data'));
    }
  }

}
