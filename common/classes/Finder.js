import Utils from './Utils';

export default class Finder {

  static DELIMITER = ' ';

  static isDelimetr(s) {
    return s===Finder.DELIMITER;
  }

  merge() {
    const as = [], map = [], strs = this.strs;
    let p = 0;
    for(let i=0; i<strs.length; ++i) {
      if(strs[i].length) {
        map.push({
          base: i,
          offset: p
        });
        as.push(strs[i]);
        p += strs[i].length;
        if(i<strs.length-1 && !Finder.isDelimetr(strs[i].charAt(strs[i].length-1)) && !Finder.isDelimetr(strs[i+1].charAt(0))) {
          as.push(Finder.DELIMITER);
          ++p;
        }
      }
    }
    this.map = map;
    this.str = as.join('');
  }

  addHits(p) {
    const info = this.map[Utils.lowerBound(this.map, {offset: p}, (a, b)=> a.offset-b.offset)];
    let chars = this.pattern.length, i = info.base;
    p -= info.offset;
    while(chars) {
      if(this.strs[i].length) {
        const delimeter = i<this.strs.length-1 && !Finder.isDelimetr(this.strs[i].charAt(this.strs[i].length-1)) && !Finder.isDelimetr(this.strs[i+1].charAt(0)),
              length = Math.min(this.strs[i].length+(delimeter? 1: 0)-p, chars);
        if(p<this.strs[i].length) {
          this.hits.push({
            index: i,
            offset: p,
            length: Math.min(length, this.strs[i].length-p),
          });
        }
        chars -= length;
        ++i;
        p = 0;
      }
    }
  }

  addContext(p) {
    let f = p, l = p+this.pattern.length-1, dels = this.props.contextLength, prevDels = dels+1;
    while(dels && prevDels-dels) {
      prevDels = dels;
      if(dels%2) {
        for(let i=f-2; i>=0; --i) {
          if(Finder.isDelimetr(this.str[i]) || i===0) {
            f = i===0? 0: i+1;
            --dels;
            break;
          }
        }
      }
      else {
        for(let i=l+2; i<this.str.length; ++i) {
          if(Finder.isDelimetr(this.str[i]) || i===this.str.length-1) {
            l = i===this.str.length-1? i===this.str.length-1: i-1;
            --dels;
            break;
          }
        }
      }
    }
    this.contexts.push(this.str.substr(f, l-f+1));
  }

  getHits() {
    return this.hits;
  }

  getContexts() {
    return this.contexts;
  }

  static defaults = {
    contextLength: 7,
    hits: true,
    contexts: true
  };

  constructor(strs, pattern, props) {
    this.props = {
      ...Finder.defaults,
      ...props
    };
    this.strs = strs;
    const data = this.merge(strs);
    this.hits = [];
    this.contexts = [];
    this.pattern = pattern.toLowerCase();
    this.lstr = this.str.toLowerCase();
    let p = 0;
    while(true) {
      p = this.lstr.indexOf(this.pattern, p);
      if(p===-1) {
        break;
      }
      else {
        this.addHits(p);
        this.addContext(p);
        p += this.pattern.length;
      }
    }
  }
}
