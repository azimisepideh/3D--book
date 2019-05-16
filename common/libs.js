const _$ = GLOBAL_LIBS.jQuery? window.jQuery: require('jquery'),
      _html2canvas = GLOBAL_LIBS.html2canvas? window.html2canvas: require('html2canvas'),
      _THREE = GLOBAL_LIBS.THREE? window.THREE: require('three'),
      _React = GLOBAL_LIBS.React? window.React: require('react'),
      _ReactDOM = GLOBAL_LIBS.React? window.ReactDOM: require('react-dom'),
      _PDFJS = GLOBAL_LIBS.PDFJS? window.PDFJS: require('pdfjs'),
      _tr = (s)=> (window.iberezansky || {}).tr && window.iberezansky.tr(s) || s;

export {
  _$ as $,
  _html2canvas as html2canvas,
  _THREE as THREE,
  _React as React,
  _ReactDOM as ReactDOM,
  _PDFJS as PDFJS,
  _tr as tr
};
