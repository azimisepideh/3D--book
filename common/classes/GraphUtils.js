export default class GraphUtils {

  static extrapolateLinear(x,y,xi) {
    return y[0]+(y[1]-y[0])/(x[1]-x[0])*(xi-x[0]);
  }

  static interpolate01(y1,y2,t) {
    return GraphUtils.extrapolateLinear([0,1],[y1,y2],t);
  }

  static getColorBytes(color) {
    return [(color>>16)&0xFF, (color>>8)&0xFF, color&0xFF];
  }

  static inverseColor(color, t=1) {
    const bs=GraphUtils.getColorBytes(color),
          ibs=[0xFF-bs[0],0xFF-bs[1],0xFF-bs[2]],
          nbs=[Math.round(GraphUtils.interpolate01(bs[0],ibs[0],t)),Math.round(GraphUtils.interpolate01(bs[1],ibs[1],t)),Math.round(GraphUtils.interpolate01(bs[2],ibs[2],t))];
    return GraphUtils.bytes2Color(nbs);
  }

  static color2Rgba(color, a) {
    return GraphUtils.bytes2Rgba(GraphUtils.getColorBytes(color), a);
  }

  static bytes2Rgba(bs, a) {
    return 'rgba('+bs.join(',')+','+a+')';
  }

  static bytes2Color(bs) {
    return bs[2]|(bs[1]<<8)|(bs[0]<<16)
  }
}
