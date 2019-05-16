import {$} from '../libs';

export default class Bookmarks {

  constructor(container, items, getTitle=(i)=> i.title, getItems=(i)=>i.items) {
    this.container = container;
    this.map = [];
    this.getTitle = getTitle;
    this.getItems = getItems;
    this.nodes = this.mapNodes(items, this.map);

    this.binds = {
      togle: (e)=> {
        e.preventDefault();
        let li = $(e.target);
        while(li[0] && li[0]!==container[0] && !li.hasClass('item')) {
          li = $(li[0].parentNode);
        }
        if(li.hasClass('item')) {
          let cmd = $(e.target);
          while(cmd[0] && cmd[0]!==li[0] && !cmd.hasClass('cmd')) {
            cmd = $(cmd[0].parentNode);
          }
          if(cmd.hasClass('cmd')) {
            const node = this.map[li.attr('data-id')];
            if(cmd.hasClass('togle')) {
              node.minimized = !node.minimized;
              if(node.minimized) {
                li.find('ul').remove();
                li.find('.togle').addClass('minimized');
              }
              else {
                li.find('.togle').removeClass('minimized');
                li.append((this.renderNode(node).match(/<ul.*<\/ul>/) || [''])[0]);
              }
            }
            else {
              if(this.onNavigate) {
                this.onNavigate(node.item);
              }
            }
          }
        }
      }
    }

    container.on('click', this.binds.togle);
    this.update();
  }

  getSize() {
    return this.map.length;
  }

  dispose() {
    this.container.off('click', this.binds.togle);
    this.container.html('');
  }

  update() {
    this.container.html(this.renderNodes(this.nodes));
  }

  forEach(f, nodes=this.nodes) {
    for(let node of (nodes || [])) {
      f(node);
      this.forEach(f, node.children);
    }
  }

  expand() {
    this.forEach((n)=> n.minimized = false);
    this.update();
  }

  minimize() {
    this.forEach((n)=> n.minimized = true);
    this.update();
  }

  renderNode(node) {
    return ['<div class="area">',
      node.children? '<a href="#" class="cmd togle' + (node.minimized? ' minimized': '') + '"><i class="fa fa-angle-right"></i></a> ': '<i class="white-space"></i> ',
      '<a class="cmd" title="', node.title,'" href="#">', node.title, '</a></div>',
      node.minimized? '': this.renderNodes(node.children)
    ].join('');
  }

  renderNodes(nodes) {
    let res = ['<div class="bookmarks">'];
    if(nodes && nodes.length) {
      res.push('<ul class="level-', nodes[0].level, '">');
      for(let node of nodes) {
        res.push([
          '<li class="item" data-id="', node.id,'">',
            this.renderNode(node),
          '</li>'].join(''));
      }
      res.push('</ul>');
    }
    res.push('</div>');
    return res.join('');
  }

  mapNodes(items, map=[], level=0) {
    let nodes = null;
    if(items && items.length) {
      nodes=[];
      for(let item of items) {
        const id = map.length;
        map.push(undefined);
        const node = {
          id,
          title: this.getTitle(item),
          level,
          item,
          minimized: true,
          children: this.mapNodes(this.getItems(item), map, level+1)
        };
        nodes.push(node);
        map[id] = node;
      }
    }
    return nodes;
  }

}
