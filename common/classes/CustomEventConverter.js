import EventConverter from './EventConverter';

export default class CustomEventConverter extends EventConverter {

  // custom
  // testIntersection(e, data);
  // custom.object
  // test(object);

  constructor(wnd, doc, customTest=()=> false, eDoc) {
    super(wnd, doc);

    this.eDoc = eDoc;
    this.customTest = customTest;
    this.customs = [];
  }

  test(object1, object2) {
    return object1 && object2? this.customTest(object1, object2): false;
  }

  getCallback(object) {
    return object.target.callback;
  }

  addCustom(custom) {
    this.customs.push(custom);
  }

  getObject(e, data) {
    let object;
    if(data.doc===this.eDoc) {
      for(let custom of this.customs) {
        object = custom.testIntersection(e, data);
        if(object) {
          break;
        }
      }
    }
    return object;
  }

}
