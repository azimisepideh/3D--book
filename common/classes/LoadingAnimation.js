import {$} from '../libs';
import GraphUtils from './GraphUtils';
import MathUtils from './MathUtils';

export default class LoadingAnimation {

  dy(t,y) {
    const w=y[0], a=y[1];
    return [
      -this.g*Math.cos(a),
      w
    ];
  }

  integrate(T) {
    let t=0, dt=this.p.dt, os = this.os;
    while(t<T) {
      if(t+dt>T) {
        dt=T-t;
      }
      os=MathUtils.rk4(this.dy.bind({g: this.p.g}), 0, dt, os);
      t+=dt;
    }
    return os;
  }

  calcTimeTo(target) {
    let t=0, dt=this.p.dt, os = this.os;
    while(Math.abs(os[1]-target)>1e-4) {
      const nos=MathUtils.rk4(this.dy.bind({g: this.p.g}), 0, dt, os);
      if(nos[0]<0 && nos[1]<target || nos[0]>0 && nos[1]>target) {
        dt/=2;
      }
      else {
        os = nos;
        t+=dt;
      }
    }
    return t;
  }

  update(T) {
    this.os = this.integrate(T);

    this.t+=T
    if(this.t>=this.p.updateInterval) {
      this.t = 0;
      const r = 0.1*Math.min(this.c.width, this.c.height),
            a = this.os[1],
            x0 = 0.5*this.c.width,
            y0 = 0.5*this.c.height,
            ctx = this.ctx;

      ctx.clearRect(0, 0, this.c.width, this.c.height);
      ctx.beginPath();
      ctx.fillStyle = GraphUtils.color2Rgba(this.p.color,1);
      ctx.rect(0, 0, this.c.width, this.c.height);
      ctx.fill();

      ctx.beginPath();
      ctx.shadowBlur = 50;
      ctx.fillStyle = GraphUtils.color2Rgba(GraphUtils.inverseColor(this.p.color,0.9),Math.abs(this.os[0]/6.36));
      ctx.shadowColor = GraphUtils.color2Rgba(GraphUtils.inverseColor(this.p.color,1),0.9);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.font='bold '+Math.round(0.25*r)+'px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("Loading...",x0,y0);

      const ps = 10, da=2*Math.PI/ps;//2.5*_r/r
      ctx.shadowColor = GraphUtils.color2Rgba(GraphUtils.inverseColor(this.p.color,1),0.7);
      for(let i=0, _a=a, _r=0.2*r; i<ps; ++i, _r*=0.9, _a+=da) {
        ctx.beginPath();
        ctx.fillStyle = GraphUtils.color2Rgba(GraphUtils.inverseColor(this.p.color,(ps-i)/ps),0.7*(ps-i)/ps);
        const cx=x0+r*Math.cos(_a), cy=y0-r*Math.sin(_a), nx=x0+r*Math.cos(_a+da), ny=y0-r*Math.sin(_a+da);
        ctx.shadowOffsetX = 0.2*(nx-cx);
        ctx.shadowOffsetY = 0.2*(ny-cy);
        ctx.arc(cx, cy, _r, 0, Math.PI*2, 1);
        ctx.fill();
      }
      if(this.onChange) {
        this.onChange(this.c, this.p.color);
      }
    }
  }

  getImage() {
    return this.c;
  }

  dispose() {
    this.c.width = 0;
    this.c.height = 0;
    delete this.ctx;
    delete this.c;
  }

  createSprite(n) {
    const c = $('<canvas width="'+this.c.width*n+'" height="'+this.c.height+'"></canvas>')[0], ctx = c.getContext('2d'),
    t = this.calcTimeTo(this.os[1]+Math.sign(this.os[0])*2*Math.PI), dt=t/(n+1);
    const {updateInterval} = this.p;
    this.p.updateInterval = 0;
    for(let i=0; i<n; ++i) {
      this.update(dt);
      ctx.drawImage(this.c, i*this.c.width, 0);
    }
    this.p.updateInterval = updateInterval;
    return c;
  }

  constructor(width, height, color) {
    const jC = $('<canvas width="'+width+'" height="'+height+'"></canvas>');
    this.c = jC[0];
    this.p = {
      g: 9.8,
      dt: 1/60,
      color,
      updateInterval: 0.25
    };
    this.ctx = this.c.getContext('2d');
    this.os = [-2, Math.PI/2];
    this.t = this.p.updateInterval;
  }

}
