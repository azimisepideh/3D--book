import Target from './Target';

export default class RectangleTarget extends Target {

  constructor(x, y, width, height) {
    super();
    this.p = {
      x,
      y,
      width,
      height
    };
  }

  testIntersection(e, data) {
    const {x, y} = data, p = this.p;
    return (x>=p.x && x<=p.x+p.width &&
           y>=p.y-p.height && y<=p.y)? {
             target: this,
             data
           }: undefined;
  }

}
