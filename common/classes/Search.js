import {$} from '../libs';

export default class Search {

  constructor(container, pages) {
    this.container = container;
    this.pages = pages;
    this.prevResults = [];
    container.html(`
      <div class="search">
        <div class="query">
          <input class="inpQuery" type="text" maxlength="30" value="" />
        </div>
        <div class="results">
        </div>
        <div class="status">

        </div>
      </div>
    `);
    this.query = container.find('.query input');
    this.results = container.find('.results');
    this.status = container.find('.status');

    this.binds = {
      navigate: this.navigate.bind(this),
      doQuery: this.doQuery.bind(this)
    };

    this.query.on('keydown', this.binds.doQuery);
    this.results.on('click', this.binds.navigate);
  }

  dispose() {
    this.results.off('click', this.binds.navigate);
    this.query.off('keydown', this.binds.doQuery);
  }

  navigate(e) {
    e.preventDefault();
    if(this.onNavigate!==undefined) {
      let target = $(e.target);
      if(!target.hasClass('result')) {
        const t = target.find('.result');
        if(t.length) {
          target = t;
        }
        else {
          while(target.length && !target.hasClass('result')) {
            target = $(target[0].parentNode);
          }
        }
      }
      const page = target.attr('data');
      if(page!==undefined) {
        this.onNavigate(parseInt(page));
      }
    }
  }

  doQuery() {
    if(this.onQuery) {
      const queryStamp = this.queryStamp = Date.now();
      setTimeout(()=> {
        if(queryStamp === this.queryStamp) {
          this.onQuery(this.query[0].value.trim());
        }
      }, 1000);
    }
  }

  setResults(results, lastPage) {
    if(this.prevResults.length && results[0]!==this.prevResults[0]) {
      this.prevResults = [];
      this.results.html('');
    }
    const htmls = [];
    for(let i=this.prevResults.length; i<results.length; ++i) {
      const result = results[i];
      htmls.push('<div class="result" data="'+result.page+'">');
        htmls.push('<a href="#">');
          htmls.push('<div>'+result.contexts.join('</div><div>')+'</div>');
        htmls.push('</a>');
      htmls.push('</div>');
    }
    $(htmls.join('')).appendTo(this.results);
    this.prevResults = [...results];
    if(lastPage===undefined) {
      this.status.html('');
    }
    else {
      this.status.html(lastPage+' of '+this.pages);
    }
  }

}
