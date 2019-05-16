import {THREE} from '../libs';

export default class Controller extends THREE.EventDispatcher {

  handleDefault(id, e, data) {
    //console.log(id+'-'+e.type+'-'+data);
  }

  dispatchAsync(e) {
    Promise.resolve().then(()=> this.dispatchEvent(e));
  }

  dispose() {

  }

}
