import {PDFJS} from '../libs';
import Utils from './Utils';

PDFJS.workerSrc = (window.PDFJS_LOCALE? PDFJS_LOCALE: GLOBAL_PATHS).pdfJsWorker;

export default class Pdf {

  constructor(src, loadingProgress) {
    this.src = Utils.normalizeUrl(src);
    this.handlerQueue = [];
    this.progresData = {loaded: -1, total: 1};
    this.loadingProgress = loadingProgress;

    PDFJS.getDocument(this.src, null, null, (data)=> {
      if(this.loadingProgress) {
        let cur = Math.floor(100*data.loaded/data.total),
              old = Math.floor(100*this.progresData.loaded/this.progresData.total);
        if(cur!==old) {
          cur = isNaN(cur)? 0: cur;
          cur = cur>100? 100: cur;
          this.loadingProgress(cur);
        }
      }
      this.progresData = data;
    }).
      then((handler)=> {
        this.handler = handler;
        let done = Promise.resolve(handler);
        for(let clb of this.handlerQueue.reverse()) {
          done = done.then((handler)=> {
            clb(handler);
            return handler;
          });
        }
      });
  }

  dispose() {
    this.handlerQueue.splice(0, this.handlerQueue.length);
    delete this.handler;
  }

  setLoadingProgressClb(clb) {
    this.loadingProgress = clb;
  }

  getPagesNum() {
    return this.handler? this.handler.numPages: undefined;
  }

  static getPageSize(page) {
    return {
      width: page.view[2]-page.view[0],
      height: page.view[3]-page.view[1]
    };
  }

  getHandler(clb) {
    if(this.handler) {
      clb(this.handler);
    }
    else {
      this.handlerQueue.push(clb);
    }
  }

}
