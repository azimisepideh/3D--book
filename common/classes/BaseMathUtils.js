export default class BaseMathUtils {
  static sum = [BaseMathUtils.sum1, BaseMathUtils.sum2, BaseMathUtils.sum3, BaseMathUtils.sum4];
  static eps = 1e-4;

  static sum1(ka,a,kb,b) {
    return [
      ka*a[0]+kb*b[0]
    ];
  }

  static sum2(ka,a,kb,b) {
    return [
      ka*a[0]+kb*b[0],
      ka*a[1]+kb*b[1]
    ];
  }

  static sum3(ka,a,kb,b) {
    return [
      ka*a[0]+kb*b[0],
      ka*a[1]+kb*b[1],
      ka*a[2]+kb*b[2]
    ];
  }

  static sum4(ka,a,kb,b) {
    return [
      ka*a[0]+kb*b[0],
      ka*a[1]+kb*b[1],
      ka*a[2]+kb*b[2],
      ka*a[3]+kb*b[3]
    ];
  }

  static rk4(dy, t, dt, y, sum=BaseMathUtils.sum[y.length-1]) {
    const k1=dy(t,y),
          k2=dy(t+dt/2,sum(1,y,dt/2,k1)),
          k3=dy(t+dt/2,sum(1,y,dt/2,k2)),
          k4=dy(t+dt,sum(1,y,dt,k3));
    return sum(1,y,dt/6,sum(1,sum(1,k1,2,k2),1,sum(2,k3,1,k4)));
  }

  static extrapolateLinear(x,y,xi) {
    return y[0]+(y[1]-y[0])/(x[1]-x[0])*(xi-x[0]);
  }

  static interpolateLinear(x,y,xi) {
    let yi;
    if(x[0]>x[1]) {
      x=x.reverse();
      y=y.reverse();
    }
    if(xi<x[0]) {
      yi=y[0];
    }
    else if(xi>x[1]) {
      yi=y[1];
    }
    else {
      yi=BaseMathUtils.extrapolateLinear(x,y,xi);
    }
    return yi;
  }

  static calcScale(srcW, srcH, dstW, dstH) {
    return Math.min(dstW/srcW, dstH/srcH);
  }

  static mulM(a, b) {
    const r=[];
    for(let i=0;i<a.length;++i) {
      r.push([]);
      for(let j=0;j<b[0].length;++j) {
        r[i][j] = 0;
        for(let k=0;k<b.length;++k) {
          r[i][j]+=a[i][k]*b[k][j];
        }
      }
    }
    return r;
  }

  static transM(m) {
    const r=[];
    for(let i=0;i<m.length;++i) {
      for(let j=0;j<m[0].length;++j) {
        if(!r[j]) {
          r[j]=[];
        }
        r[j][i]=m[i][j];
      }
    }
    return r;
  }

  static mat(data) {
    let s=0;
    for(let x of data) {
      s+=x;
    }
    return s/data.length;
  }

  static disp(data) {
    const M=BaseMathUtils.mat(data);
    let s=0;
    for(let x of data) {
      s+=(x-M)*(x-M);
    }
    return s/data.length;
  }

  static predict(data, num) {
    const r=[], l=data.length, D=BaseMathUtils.disp(data);
    if(D<l && l>1) {
      const am=[], bm=[];
      for(let i=0;i<l;++i) {
        am.push([i,1]);
        bm.push([data[i]]);
      }
      const ta=BaseMathUtils.transM(am), a=BaseMathUtils.mulM(ta,am), b=BaseMathUtils.mulM(ta,bm),
      d=(a[0][0]*a[1][1]-a[1][0]*a[0][1]),
      p=[
        -(a[0][1]*b[1][0]-b[0][0]*a[1][1])/d,
        (a[0][0]*b[1][0]-a[1][0]*b[0][0])/d
      ];
      for(let i=0;i<num;++i) {
        const v = Math.round(p[0]*(i+l)+p[1]);
        if(r.indexOf(v)===-1) {
          r.push(v);
        }
      }
    }
    return r;
  }

  static getUnique() {
    return Math.ceil(1e9*Math.random());
  }

  static setSplinePoints(spline, ps) {
    if(spline.points.length!==ps.x.length) {
      console.warn('setSplinePoints: bad points');
    }
    for(let i=0; i<spline.points.length; ++i) {
      spline.points[i].set(ps.x[i], ps.y[i], ps.z? ps.z[i]: 0);
    }
  }

  static mapl2L(ls, len, n, f) {
    const dL = len/(n-1);
    let L=0;
    for(let i=0, d=ls[0]; i<ls.length-1 && L<len+0.1*dL; ++i, d+=ls[i]) {
      if(Math.abs(L-d)<Math.abs(L-d-ls[i+1])) {
        f(i, L);
        L+=dL;
      }
    }
    if(L<len+0.1*dL) {
      console.warn('mapl2L: ls is not enought');
    }
  }

  static det2(a,b,c,d) {
    return a*d-b*c;
  }

  static solve2Lin(a1,b1,a2,b2) {
    let res;
    const d=BaseMathUtils.det2(a1[0],a1[1],a2[0],a2[1]);
    if(Math.abs(d)>BaseMathUtils.eps) {
      const dx=BaseMathUtils.det2(b1,a1[1],b2,a2[1]), dy=BaseMathUtils.det2(a1[0],b1,a2[0],b2);
      res = {
        x: dx/d,
        y: dy/d
      };
    }
    return res;
  }

  static isInsidePoly(ps, p) {
    let done = false, ct;
    for(let i=0; i<ps.length; ++i) {
      if(BaseMathUtils.v2dist(p, ps[i])<BaseMathUtils.eps) {
        ct=1;
        done = true;
        break;
      }
    }
    while(!done) {
      done = true;
      ct = 0;
      let np = {x: p.x+Math.random()-0.5, y: p.y+Math.random()-0.5}, rn = {x: np.x-p.x, y: np.y-p.y}, a1=[rn.y, -rn.x], b1=p.x*rn.y-p.y*rn.x;
      for(let i=0; i<ps.length; ++i) {
        const p0=ps[i], p1=ps[(i+1)%ps.length], n = {x: p1.x-p0.x, y: p1.y-p0.y}, a2=[n.y, -n.x], b2=p0.x*n.y-p0.y*n.x,
          ip = BaseMathUtils.solve2Lin(a1,b1,a2,b2);
        if(ip) {
          if(BaseMathUtils.v2dist(ip, p0)<BaseMathUtils.eps || BaseMathUtils.v2dist(ip, p1)<BaseMathUtils.eps) {
            done = false;
            break;
          }
          else if(ip.x>Math.min(p0.x,p1.x)-BaseMathUtils.eps&&ip.x<Math.max(p0.x,p1.x)+BaseMathUtils.eps &&
                  ip.y>Math.min(p0.y,p1.y)-BaseMathUtils.eps&&ip.y<Math.max(p0.y,p1.y)+BaseMathUtils.eps) {
            if(BaseMathUtils.v2dist(ip, p)<BaseMathUtils.eps) {
              ct=1;
              break;
            }
            else {
              const tn={x: ip.x-p.x, y: ip.y-p.y};
              ct += tn.x*rn.x+tn.y*rn.y>0;
            }
          }
        }
      }
    }
    return ct%2;
  }

  static isInsideConvPoly(ps, p) {
    let sg = [0, 0];
    for(let i=0; i<ps.length; ++i) {
      const p0=ps[i], p1=ps[(i+1)%ps.length], a={x: p0.x-p.x, y: p0.y-p.y}, b={x: p1.x-p.x, y: p1.y-p.y};
      ++sg[(a.x*b.y-a.y*b.x<0)+0];
    }
    return ~sg.indexOf(ps.length);
  }

  static v2len(v2) {
    return Math.sqrt(v2.x*v2.x+v2.y*v2.y);
  }

  static v2dist(v21, v22) {
    return BaseMathUtils.v2len({
      x: v22.x-v21.x,
      y: v22.y-v21.y
    });
  }

  static computeSquare(ps) {
    const a = [];
    let p = 0;
    for(let i=0; i<ps.length; ++i) {
      a.push(BaseMathUtils.v2dist(ps[i], ps[(i+1)%ps.length]));
      p += 0.5*a[i];
    }
    return Math.sqrt(p*(p-a[0])*(p-a[1])*(p-a[2]));
  }

  static computeInterpCoefs(tri, p) {
    const s = BaseMathUtils.computeSquare(tri), coefs=[], l = tri.length;
    for(let i=0; i<l; ++i) {
      coefs[i] = BaseMathUtils.computeSquare([p, tri[(i+1)%l], tri[(i+2)%l]])/s;
    }
    return coefs;
  }

}
