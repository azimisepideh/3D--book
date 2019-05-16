import {$} from '../libs';
import ImageFactory from './ImageFactory';

export default class Thumbnails {

  constructor(context, container, thumbnailsClb, size, props={kWtoH: 210/297}) {
    this.container = container;
    this.p = props;
    this.thumbnailsClb = thumbnailsClb;
    this.size = size;
    this.canvas = $('<canvas>')[0];
    this.imageFactory = new ImageFactory({
      ...context,
      renderCanvas: this.canvas,
      renderCanvasCtx: this.canvas.getContext('2d')
    });
    this.thumbnails = [];
    for(let i=0; i<size; ++i) {
      const info = this.thumbnailsClb(i);
      this.thumbnails.push({
        ...info,
        index: i,
        loaded: info.type==='thumbnail-image',
        heading: null,
        thumbnail: null,
        title: info.title || i
      });
    }

    this.binds = {
      update: this.update.bind(this),
      navigate: (e)=> {
        e.preventDefault();
        if(this.onNavigate) {
          let node = e.target;
          while(node && !node.dataThumbnail) {
            node = node.parentNode;
          }
          this.onNavigate(node.dataThumbnail.index);
        }
      }
    };
    this.container.on('scroll', this.binds.update);
  }

  getSize() {
    return this.size;
  }

  setEnable(enable) {
    this.enable = enable;
    this.update();
  }

  dispose() {
    this.container.find('a').off('click', this.binds.navigate);
    this.container.off('scroll', this.binds.update);
    this.container.html('');
    this.canvas.height = this.canvas.width = 0;
    delete this.canvas;
  }

  load(thumbnail) {
    this.loading = true;
    const wrapper = this.imageFactory.build(thumbnail, thumbnail.number===undefined? thumbnail.index: thumbnail.number, this.p.kWtoH*300, 300);
    wrapper.onChange = (canvas)=> {
      this.setImage(thumbnail, canvas.toDataURL('image/png'));
      thumbnail.loaded = true;
      wrapper.dispose();
      this.loading = false;
      Promise.resolve().then(()=> this.update());
    };
  }

  getActive() {
    const first = this.container.scrollTop(), last = first + this.container.height(), res = [];
    for(let thumbnail of this.thumbnails) {
      if(Math.max(thumbnail.first, first)<Math.min(thumbnail.last, last)) {
        res.push(thumbnail);
      }
    }
    return res;
  }

  update() {
    if(!this.loading && this.canvas && this.enable) {
      if(!this.built) {
        this.render();
      }
      const active = this.getActive();
      for(let thumbnail of active) {
        if(!thumbnail.loaded) {
          this.load(thumbnail);
          break;
        }
      }
    }
  }

  setImage(thumbnail, img) {
    thumbnail.img = img;
    thumbnail.thumbnail.css('background-image', ['url(\'', img,'\')'].join(''));
    thumbnail.thumbnail.removeClass('loading');
  }

  render() {
    const elements = ['<div class="thumbnails">']
    for(let i=0; i<this.size; ++i) {
      elements.push(['<div class="item"><a href="#"><div class="thumbnail loading"></div></a><div class="heading"><a href="#" title="', i+1,'">', i+1, '</a></div></div>'].join(''));
    }
    elements.push('</div>');
    this.container.append(elements.join(''));
    const items = this.container.find('.item'), base = this.container.find('.thumbnails').offset().top;
    for(let i=0; i<items.length; ++i) {
      const item = $(items[i]);
      this.thumbnails[i].heading = item.find('.heading');
      this.thumbnails[i].thumbnail = item.find('.thumbnail');
      this.thumbnails[i].first = item.offset().top-base;
      this.thumbnails[i].last = this.thumbnails[i].first+item.height();
      if(this.thumbnails[i].loaded) {
        this.setImage(this.thumbnails[i], this.thumbnails[i].src);
      }
      for(let a of item.find('a')) {
        a.dataThumbnail = this.thumbnails[i];
      }
    }
    this.container.find('a').on('click', this.binds.navigate);
    this.built = true;
  }

}
