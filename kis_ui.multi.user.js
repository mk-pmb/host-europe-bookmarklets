/* -*- coding: UTF-8, tab-width: 2 -*- */
/*jslint indent: 2, maxlen: 80, browser: true */
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
// @resource    introspect  introspect.txt
//              ^-- use a symlink to this, b/c GM can't download the
//                  main script as an "additional" file (infin. loop?)
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
var EX = {}, GM = {};
/*global GM_info: true, GM_getResourceText: true, GM_addStyle: true, */
GM.GM_info            = GM_info;
GM.GM_getResourceText = GM_getResourceText;
GM.GM_addStyle        = GM_addStyle;
(function detectMeta(meta) {
  meta = String(GM.GM_getResourceText('introspect') || '');
  if (!meta) { return console.log('bkml introspect fail: empty'); }
  meta = meta.replace(/\r/g, '').split(/\n\/{2} ==\/?UserScript==\n/)[1];
  if (!meta) { return console.log('bkml introspect fail: split'); }
  meta = ('\n' + meta + '\n').replace(/\n\/{2} */g, '\n');
  GM.metaBlock = meta;
  GM.resNames = {};
  meta.replace(/\n@resource +(\S+) +(\S+)/g,
    function (match, name, file) { GM.resNames[name] = file || match; });
  delete console.dir;
  console.dir(Object.create(null, {
    script: { value: GM.GM_info.script },
    metaBlock: { value: GM.metaBlock.split('\n') },
    resNames: { value: GM.resNames },
  }));
}());


EX.body = document.getElementsByTagName('body')[0];
EX.removeElementById = function removeElementById(id) {
  var el = document.getElementById(id);
  if (el) { el.parentNode.removeChild(el); }
};


EX.mkScriptTag = function mkScriptTag(tagId, jsCode) {
  var el = document.createElement('script');
  if ('function' === typeof jsCode) { jsCode = '(' + String(jsCode) + '());'; }
  el.type = 'text/javascript';
  if (tagId) { el.id = tagId; }
  el.innerHTML = jsCode + '\n';
  return el;
};


EX.enqueueScriptTagOutsideSandbox = function nqScriptTag(jsfunc) {
  var rmv = 'document.removeElementById', tagId, el;
  el = document.createElement('span');
  if (!nqScriptTag.tagNum) {
    nqScriptTag.tagNum = 0;
    el.appendChild(EX.mkScriptTag(null, rmv + ' = ' +
      String(EX.removeElementById) + ';'));
  }
  while (true) {
    nqScriptTag.tagNum += 1;
    tagId = 'enhance-multi-nq-' + nqScriptTag.tagNum;
    if (!document.getElementById(tagId)) { break; }
  }
  el.id = tagId;
  el.appendChild(EX.mkScriptTag(null, jsfunc));
  el.appendChild(EX.mkScriptTag(null, rmv + '("' + tagId + '");'));
  EX.body.appendChild(el);
};

EX.enqueueBookmarkletOutsideSandbox = function (jsfunc) {
  /* Push a bookmarklet to avoid having to use unsafeWindow.
   * see http://wiki.greasespot.net/Location_hack */
  /*jslint evil:true*/
  var evilPseudoProtocol = '!ja!va!sc!ri!pt!:';
  evilPseudoProtocol = evilPseudoProtocol.replace(/!/g, '');
  if ('function' === typeof jsfunc) { jsfunc = '(' + String(jsfunc) + '());'; }
  jsfunc = String(jsfunc);
  jsfunc = jsfunc.replace(/^([\n\s]*|\/\*[ -\uFFFF]+\*\/\n)+/, '');
  /* ^-- ATT: This rgx won't remove _all_ comments, just _our_ syntax. */
  // jsfunc = jsfunc.replace(/\s*\n[\n\s]*/g, ' ');
  jsfunc = evilPseudoProtocol + encodeURIComponent(jsfunc);
  // jsfunc = 'data:text/plain,' + jsfunc;
  location.replace(jsfunc);
  // ^-- 2015-08-10: no longer works, Exception w/o message.
};

EX.enqueueResJsOutsideSandbox = function (resId) {
  var jsCode = GM.GM_getResourceText(resId), logObj = Object.create(null);
  logObj.nqResJS = resId + ' = ' + String(GM.resNames[resId] || '?');
  try {
    // EX.enqueueBookmarkletOutsideSandbox(jsCode);
    EX.enqueueScriptTagOutsideSandbox(jsCode);
  } catch (err) {
    logObj.errMsg = (String(err.message || '') || null);
    if ('string' === typeof err.stack) { err.stack = err.stack.split(/\n/); }
    logObj.errDetails = err;
  }
  logObj.jsCode = jsCode.split(/\n/);
  // console.dir(logObj);
};

EX.loadResources = function () {
  var res = GM.GM_info.script.resources, resIds = Object.keys(res);
  EX.res = res;
  resIds.sort();
  resIds.forEach(function scheduleBkmlRes(resId) {
    var delay;
    if (/^css:/.exec(resId)) {
      return GM.GM_addStyle(GM.GM_getResourceText(resId));
    }
    if (/^prep:/.exec(resId)) {
      return EX.enqueueResJsOutsideSandbox(resId);
    }
    delay = /^bkml:([0-9]+\.?[0-9]*)$/.exec(resId);
    if (delay) {
      delay = Number(delay[1].replace(/^0+/, '')) * 1000;
      setTimeout(EX.enqueueResJsOutsideSandbox.bind(null, resId), delay);
      return;
    }
  });
};


EX.loadResources();











/*np2*/
