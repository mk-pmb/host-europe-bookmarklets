/* -*- coding: UTF-8, tab-width: 2 -*- */
/*jslint indent: 2, maxlen: 80, continue: true, unparam: true, browser: true */
// ==UserScript==
// @name        HostEurope KIS: UI utils
// @namespace   greasemonkey.web-enhance.pimpmybyte.de
// @include     https://kis.hosteurope.de/*
// @version     1
// @grant       GM_addStyle
// @grant       GM_info
// @grant       GM_getResourceText
// @resource    bkml:00.002 kis_ui.domain_gropups.js
// ==/UserScript==

'use strict';
var GM = this, noop = function () { return; };

GM.enqueueBookmarkletOutsideSandbox = function (jsfunc) {
  /* Push a bookmarklet to avoid having to use unsafeWindow.
   * see http://wiki.greasespot.net/Location_hack */
  /*jslint evil:true*/
  var evilPseudoProtocol = '!ja!va!sc!ri!pt!:';
  evilPseudoProtocol = evilPseudoProtocol.replace(/!/g, '');
  if ('function' === typeof jsfunc) {
    jsfunc = '(' + String(jsfunc) + '());';
  }
  jsfunc = String(jsfunc);
  jsfunc = jsfunc.replace(/^([\n\s]*|\/\*[ -\uFFFF]+\*\/\n)+/, '');
  /* ^-- ATT: This rgx won't remove_all_ comments, just _our_ syntax. */
  // jsfunc = jsfunc.replace(/\s*\n[\n\s]*/g, ' ');
  jsfunc = evilPseudoProtocol + encodeURIComponent(jsfunc);
  // jsfunc = 'data:text/plain,' + jsfunc;
  location.replace(jsfunc);
};

GM.enqueueResJsOutsideSandbox = function (resId) {
  var jsCode = GM.GM_getResourceText(resId);
  GM.enqueueBookmarkletOutsideSandbox(jsCode);
};

(function loadResources() {
  var res = GM.GM_info.script.resources, resIds = Object.keys(res);
  GM.res = res;
  resIds.sort();
  resIds.forEach(function scheduleBkmlRes(resId) {
    var delay;
    if (/^css:/.exec(resId)) {
      GM.GM_addStyle(GM.GM_getResourceText(resId));
      return;
    }
    delay = /^bkml:([0-9]+\.?[0-9]*)$/.exec(resId);
    if (delay) {
      delay = Number(delay[1].replace(/^0+/, '')) * 1000;
      setTimeout(GM.enqueueResJsOutsideSandbox.bind(null, resId), delay);
      return;
    }
  });
}());














/*np2*/
