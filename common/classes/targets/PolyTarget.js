import Target from './Target';
import BaseMathUtils from '../BaseMathUtils';

export default class PolyTarget extends Target {

  constructor(poly) {
    super();
    this.poly = poly;
  }

  testIntersection(e, p) {
    return BaseMathUtils.isInsidePoly(this.poly, p)? {
      target: this,
      data: p
    }: undefined;
  }

}
