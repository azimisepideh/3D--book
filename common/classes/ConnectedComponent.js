import {React, tr} from '../libs';
import Component from './Component';

export default class ConnectedComponent extends Component {

  static bindActionCreators(actions, dispatch) {
    const binds = {};
    for(let name of Object.keys(actions)) {
      binds[name] = (...args)=> {
        const action = actions[name](...args);
        action.payload.dispatch = dispatch;
        dispatch(action);
      };
    }
    return binds;
  }

  renderContent() {
    return null;
  }

  isReady(props=this.props) {
    return Object.values(props.code).findIndex((c)=> c===undefined || c>0)===-1;
  }

  render() {
    const {code} = this.props, codes = Object.values(code);
    let content = null;
    if(~codes.findIndex((c)=> c)) {
      content = (
        <div class="padding-top">
          <div class="alert alert-danger">
            <span class="fa fa-exclamation-circle"></span>
            {' '+tr('Sorry something went wrong with the server please try again')}
          </div>
        </div>
      );
    }
    else if(~codes.indexOf(undefined)) {
      content = (
        <div class="padding-top">
          <div class="alert alert-info">
            <span class="fa fa-info-circle"></span>
            {' '+tr('Loading')+'...'}
          </div>
        </div>
      );
    }
    else {
      content = this.renderContent();
    }
    return content;
  }

}
