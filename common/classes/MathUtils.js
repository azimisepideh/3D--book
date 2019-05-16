import {THREE} from '../libs';
import BaseMathUtils from './BaseMathUtils';

export default class MathUtils extends BaseMathUtils {
  static v1 = new THREE.Vector3();

  static splitSpline(spline, N) {
    const o = {len: 0, ls: [0]}, dl=1/N;
    for(let i=0; i<=N; ++i) {
      const p = spline.getPoint(i*dl);
      if(i) {
        const d = MathUtils.v1.distanceTo(p);
        o.len += d;
        o.ls.push(d);
      }
      MathUtils.v1.copy(p);
    }
    return o;
  }

  static getLinearIndeces(spline, n) {
    const del = 5000, dDel = 1/del;
    const ls=[0];
    let l = 0;
    for(let i=0; i<=del; ++i) {
      const p = spline.getPoint(i*dDel);
      if(i) {
        const d=MathUtils.v1.distanceTo(p);
        l += d;
        ls.push(d);
      }
      MathUtils.v1.copy(p);
    }
    ls.push(1e7);

    const res = [], dl = l/(n-1);
    for(let i=0, L=0, d=ls[0]; i<ls.length-1; ++i, d+=ls[i]) {
      if(Math.abs(L-d)<Math.abs(L-d-ls[i+1])) {
        res.push(i*dDel);
        L+=dl;
      }
    }

    return res;
  }

  static refinePoly(poly, maxDl) {
    const res = [];
    for(let i=0; i<poly.length; ++i) {
      const p0 = poly[i], p1 = poly[(i+1)%poly.length], l = BaseMathUtils.v2dist(p0, p1), n = Math.ceil(l/maxDl), dl = l/n;
      res.push(p0);
      for(let j=1; j<n; ++j) {
        res.push(new THREE.Vector2(
          p0.x+j*dl*(p1.x-p0.x)/l,
          p0.y+j*dl*(p1.y-p0.y)/l
        ));
      }
    }
    return res;
  }

}
