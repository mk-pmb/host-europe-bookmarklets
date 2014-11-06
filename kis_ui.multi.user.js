/* -*- coding: UTF-8, tab-width: 2 -*- */
/*jslint indent: 2, maxlen: 80, continue: true, unparam: true, browser: true */
// ==UserScript==
// @name        HostEurope KIS: UI utils
// @namespace   greasemonkey.web-enhance.pimpmybyte.de
// @description
// @include     https://kis.hosteurope.de/*
// @version     1
// @grant       GM_addStyle
// @grant       GM_info
// @grant       GM_getResourceText
// @resource    bkml:00.002 kis_ui.domain_gropups.js
// ==/UserScript==

/***** LICENSE: GNU GPL v2 *****\
KIS UI utils: Make Host Europe's KIS more comfortable
Copyright (C) 2014  M. Krause <http://pimpmybyte.de/>

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
\***** ***** ***** ***** ***** *****/

'use strict';
var GM = this;

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
