import Target from './Target';

export default class CircleTarget extends Target {

  constructor(x, y, r) {
    super();
    this.p = {
      x,
      y,
      r
    };
  }

  testIntersection(e, data) {
    let res;
    const {x, y} = data, p = this.p;
    if((x-p.x)*(x-p.x)+(y-p.y)*(y-p.y)<=p.r*p.r) {
      res = {
        target: this,
        data
      };
    }
    return res;
  }

}
