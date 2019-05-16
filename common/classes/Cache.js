export default class Cache {

  constructor(maxSize=Infinity, sizeof=Cache.countSizeof) {
    this.os = new Map();
    this.sizeof = sizeof;
    this.maxSize = maxSize;
    this.size = 0;
  }

  forEach(clb) {
    this.os.forEach((v, k)=> clb([k,v]));
  }

  static countSizeof(value) {
    return 1;
  }

  remove(k) {
    let res = false;
    const v = this.os.get(k);
    if(!v.locked || !v.locked(k)) {
      this.size -= this.sizeof(v);
      if(v.dispose) {
        v.dispose();
      }
      this.os.delete(k);
      res = true;
    }
    return res;
  }

  freeSpace() {
    const arr = [];
    for(let p of this.os) {
      arr.push({timestamp: p[1].timestamp, key: p[0]});
    }
    arr.sort((a, b)=> a.timestamp-b.timestamp);
    for(let i=0; i<arr.length && this.size>3*this.maxSize/4; ++i) {
      this.remove(arr[i].key);
    }
  }

  dispose() {
    const arr = [];
    for(let p of this.os) {
      arr.push({v: p[1], k: p[0]});
    }
    for(let o of arr) {
      if(o.v.dispose) {
        o.v.dispose();
      }
      this.os.delete(o.k);
    }
  }

  static recursionSizeof(value) {
    let size = 0;
    if(value) {
      ++size;
      const len = value.length;
      if(len===undefined) {
        for (let p in value) {
          if(value.hasOwnProperty(p)) {
            size+=Cache.recursionSizeof(value[p]);
          }
        }
      }
      else {
        size+=len
      }
    }
    return size;
  }

  getTimestamp() {
    return Date.now();
  }


  get(key) {
    const value = this.os.get(key);
    if(value) {
      value.timestamp = this.getTimestamp();
    }
    return value;
  }

  put(key, value) {
    value.timestamp = this.getTimestamp();
    this.os.set(key, value);
    this.size+=this.sizeof(value);
    if(this.size>this.maxSize) {
      this.freeSpace();
    }
    return value;
  }
}
