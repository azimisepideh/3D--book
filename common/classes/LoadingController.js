import {$} from '../libs';

export default class LoadingController {

  constructor(view, showProgress=true, loadingMsg=undefined) {
    this.view = view;
    this.progress = 0;
    this.showProgress = showProgress;
    this.getLoadingMsg = loadingMsg || LoadingController.defaultLoadingMsg;
    this.updateView();
  }

  static defaultLoadingMsg(progress) {
    return ['Please wait... the Application is Loading: ', progress, '%'].join('');
  }

  dispose() {
    this.showProgress = false;
    this.updateView();
    delete this.view;
  }

  setProgress(v) {
    this.progress = v;
    this.updateView();
  }

  updateView() {
    if(this.view) {

      this.view.setState('widLoadingProgress', {
        enable: true,
        visible: this.showProgress,
        active: false
      });

      this.view.setState('txtLoadingProgress', {
        value: this.getLoadingMsg(this.progress),
        visible: true
      });

      for(let name of this.view.getLinks()) {
        this.view.setState(name, {
          enable: false,
          visible: true,
          active: false
        });
      }

      this.view.setState('inpPages', {
        visible: true,
        value: ''
      });

      this.view.setState('inpPage', {
        visible: true,
        enable: false,
        value: ''
      });

    }
  }

}
