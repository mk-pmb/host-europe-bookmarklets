/* -*- coding: UTF-8, tab-width: 2 -*- */
/*jslint indent: 2, maxlen: 80, browser: true */

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

//javascript:
(function () {
  'use strict';
  var EX = {}, jq = window.jQuery, ignoreFuncArgs = Array;
  EX.mkArr = Function.call.bind(Array.prototype.slice);
  EX.toUpper = function (text) { return String(text).toUpperCase(); };

  EX.main = function () {
    var crumbs;
    crumbs = jq('#breadcrumb').text().replace(/\b[a-z]/g, EX.toUpper
      ).replace(/\s+|\.+$/g, ''
      ).replace(/\b(Admin)istration\b/g, '$1'
      ).replace(/\b(Domains)ervices\b/g, '$1'
      ).replace(/\b(\w+)verwaltung\b/g, '$1'
      ).replace(/:\w+\s*\.+/g, '');
    console.log('crumbs:', crumbs);

    EX.enlargeSelectLists();
    EX.addHashHeadline();

    switch (crumbs) {
    case 'Admin>Domains>Admin>DomainManager:B':
      EX.domainMassUpdate_offerLookupGroups();
      EX.domainMassUpdate_easeTopicSelection();  // einzelne Domain updaten
      break;
    case 'Admin>Domains>Admin>UpdateAufEineD':  // …omaingruppe ausführen
      EX.domainMassUpdate_easeTopicSelection();
      EX.domainWhoisImExport_install();
      break;
    }
  };


  EX.kisMainContentArea = jq('#headnav_wrapper br+div:first');
  EX.enlargeSelectLists = function () {
    EX.kisMainContentArea.find('select').each(function () {
      var sel = this, optCnt = sel.options.length;
      if (optCnt > 1) { sel.size = optCnt + 2; }
    });
  };
  EX.addHashHeadline = function () {
    var hash = String(location.hash).replace(/^#/, ''), hl;
    if (!hash) { return; }
    hl = EX.kisMainContentArea.find('h3.hash').first();
    if (hl.length !== 1) {
      hl = jq('<h3 class="hash">').prependTo(EX.kisMainContentArea);
    }
    hl.text(hash.replace(/,\s*/g, ', '));
  };


  EX.domainMassUpdate_offerLookupGroups = function () {
    var lug = jq('select[name=submode]>option[value=domainupdate]');
    if (lug.length !== 1) { return; }
    lug = { subModeSel: lug.parent() };
    lug.dmnLstTbl = lug.subModeSel.parents('table').first();
    if (lug.dmnLstTbl.length !== 1) { return; }
    lug.dmnLstTbl[0].id = 'domainMassActionsTable';
    lug.subModeSel.on('change', function autoSubmit() {
      if (lug.subModeSel[0].selectedIndex < 1) { return; }
      jq(lug.dmnLstForm.submitButton).click();
    });
    lug.button = jq('<input>').attr({
      type: 'button',
      role: 'lookup-groups',
      value: 'Groups?'
    }).css({
      marginLeft: '1ex',
    }).appendTo(lug.dmnLstTbl.find('td>b, tr>b').first());
    jq('<style type="text/css">').appendTo('head:first').text([
      'a.update-domain-group {',
      '  display: inline;',
      '  margin-right: 0.5em;',
      '  padding: 0px 2px;',
      '}',
      'a.update-domain-group:first-of-type { margin-left: 1ex; }',
      'label.newwin { display: block; margin-bottom: 1em; }',
    ].join('\n'));
    lug.updateDomainsHash = function () {
      var dmnHash = '', tgt = String(lug.dmnLstForm.action).split(/\#/)[0];
      lug.dmnLstTbl.find('tr').each(function (dmnName, tr) {
        dmnName = jq(tr).data('domain-name');
        if (dmnName && tr.selCkb.checked) { dmnHash += ',' + dmnName; }
      });
      dmnHash = dmnHash.replace(/^,/, '#');
      lug.dmnLstForm.action = tgt + dmnHash;
      // console.log(lug.dmnLstForm);
    };
    lug.dmnLstTbl.find('td>input[type=checkbox]').each(function (idx, ckb) {
      var dmnId = ckb.value, row = jq(ckb).parents('tr').first();
      ignoreFuncArgs(idx);
      if (ckb.name !== 'domain[]') { return; }
      if (!lug.dmnLstForm) {
        lug.dmnLstForm = ckb.form;
        lug.dmnLstForm.id = 'domainMassActionsForm';
      }
      jq(ckb).on('click', lug.updateDomainsHash);
      row[0].selCkb = ckb;
      row.attr({
        'data-domain-id': dmnId,
        'data-domain-name': row.find('td:nth(1) a:first').text(),
        'data-domain-groups': ',',
      });
      row.find('td:first').attr({ align: null });
    });
    EX.addNewWinCkb(lug.dmnLstForm);
    lug.baseUrl = '/administration/domainservices/index.php';
    lug.grpAdminBaseUrl = lug.baseUrl + '?menu=2';
    lug.grpUpdateBaseUrl = lug.baseUrl + '?mode=domainupdate&menu=1&groupid=';
    lug.tryDetect = function () {
      lug.button.attr('disabled', true);
      jq.get(lug.grpAdminBaseUrl, null, lug.recvDetect.bind(null));
      lug.dmnLstForm.newWinCkb.onclick(true);
    };
    lug.dmnGrpDB = {
      byGroupId: Object.create(null),
      byGroupName: Object.create(null),
      byDomainId: Object.create(null),
      byDomainName: Object.create(null),
      grpReqsWaiting: 0
    };
    lug.recvDetect = function (rsp) {
      var refGrp = this;
      // console.log('lug.recvDetect', refGrp, String(rsp || '').length);
      rsp = String(rsp.split(/id="headnav"/)[1] || '');
      rsp = String(rsp).replace(/[\s\n]+/g, ' ');
      rsp = String(rsp.split(/<b>Vorhandene Gruppen<\/b>/)[1] || '');
      if (refGrp) { rsp = String(rsp.split(/<b>Gruppe /)[1] || ''); }
      rsp = String(rsp.split(/<\/table/)[0] || '').split(/<\/?tr\b/);
      if (refGrp) {
        lug.parseDomainsInGroup(refGrp, rsp);
      } else {
        lug.parseGroupsList(rsp);
      }
    };
    lug.parseGroupsList = function (rspTblRows) {
      var grps = [], tmp;
      rspTblRows.forEach(function parseGroupRow(tr) {
        var grp = {};
        grp.name = EX.matchTag(tr, 'input', 'name="groupname"', 'value');
        if (!grp.name) { return; }
        grp.id = EX.matchTag(tr, 'input', 'name="groupid"', 'value');
        grp.id = EX.integerOrEmpty(grp.id);
        if (!grp.id) { return; }
        tmp = grp.name.match(/^([\S\s]*\S) *(#[A-Fa-f0-9]{3,6})$/);
        if (tmp) {
          grp.name = tmp[1];
          grp.bgColor = tmp[2];
        }
        lug.dmnGrpDB.byGroupId[grp.id] = grp;
        lug.dmnGrpDB.byGroupName[grp.name] = grp;
        grps[grps.length] = grp;
      });
      lug.dmnGrpDB.grpReqsWaiting += grps.length;
      grps.forEach(function requestGroupDomainList(grp) {
        jq.get(lug.grpAdminBaseUrl + '&mode=groupadmin&groupid=' + grp.id,
          null, lug.recvDetect.bind(grp));
      });
    };
    lug.parseDomainsInGroup = function (refGrp, rspTblRows) {
      refGrp.domains = Object.create(null);
      rspTblRows.forEach(lug.parseGroupDomainRow.bind(null, refGrp));
      lug.dmnGrpDB.grpReqsWaiting -= 1;
      if (lug.dmnGrpDB.grpReqsWaiting === 0) { lug.whenHasDomainGroupDB(); }
    };
    lug.whenHasDomainGroupDB = function () {
      window.domainGroupsDB = lug.dmnGrpDB;
      console.log('finished domain group detection.',
        'window.domainGroupsDB =', lug.dmnGrpDB);
      EX.sorted(lug.dmnGrpDB.byDomainName).forEach(function (domain) {
        var grpNameLinksDest, groupNames;
        domain = lug.dmnGrpDB.byDomainName[domain];
        grpNameLinksDest = domain.row.find('td:first');
        groupNames = EX.sorted(domain.groups);
        domain.row.attr('data-domain-groups', String(',' + groupNames.join(',')
          ).replace(/,*$/, ','));
        groupNames.forEach(function (grp) {
          var lnk;
          grp = lug.dmnGrpDB.byGroupName[grp];
          lnk = jq('<a>').addClass('update-domain-group').text(grp.name).attr({
            href: lug.grpUpdateBaseUrl + grp.id,
            title: [grp.name, 'gid=' + grp.id,
              'bgc=' + String(grp.bgColor || '').replace(/^#/, '')
              ].join(' '),
          });
          if (grp.bgColor) { lnk.css('background-color', grp.bgColor); }
          grpNameLinksDest.append(lnk);
        });
      });
    };
    lug.parseGroupDomainRow = function (refGrp, tr) {
      var dmnName, dmnId, domain;
      dmnId = EX.matchTag(tr, 'input', 'name="domains\\[\\]"', 'value');
      dmnId = EX.integerOrEmpty(dmnId);
      if (!dmnId) { return; }
      dmnName = EX.matchOrEmpty(tr, />([a-z0-9\.\-]+\.[a-z]+)<\/td>\s*$/, 1);
      if (!dmnName) { return; }
      domain = lug.dmnGrpDB.byDomainName[dmnName];
      if (!domain) {
        domain = { id: dmnId, name: dmnName, groups: Object.create(null) };
        domain.row = lug.dmnLstTbl.find('tr[data-domain-id=' + dmnId + ']'
          ).first();
        lug.dmnGrpDB.byDomainId[dmnId] = domain;
        lug.dmnGrpDB.byDomainName[dmnName] = domain;
      }
      refGrp.domains[dmnName] = dmnId;
      domain.groups[refGrp.name] = refGrp.id;
      // console.log(dmnName, domain, refGrp);
    };
    lug.button.on('click', lug.tryDetect);
    return lug.tryDetect;
  };


  EX.addNewWinCkb = function (formElem) {
    var ckb, submitWrapper;
    if (!formElem.submitButton) {
      formElem.submitButton = jq(formElem.elements
        ).filter('input[type=submit]').last()[0];
    }
    submitWrapper = formElem.submitButton.parentNode;
    jq(submitWrapper).addClass('submit-wrapper');
    ckb = jq('<input type="checkbox">')[0];
    jq('<label class="newwin"> new window</label> ').prepend(ckb
      ).prependTo(submitWrapper);
    ckb.onclick = function (state) {
      if ('boolean' === typeof state) {
        ckb.checked = state;
      } else {
        state = ckb.checked;
      }
      formElem.target = (state ? '_blank' : '');
    };
    formElem.newWinCkb = ckb;
    return ckb;
  };


  EX.rgxAnyTagAttrs = '[\\s!-;=\\?-~]*';
  EX.matchOrEmpty = function (text, rgx, flags, grp) {
    if ('number' === typeof flags) {
      grp = flags;
      flags = '';
    }
    if ('string' === typeof rgx) { rgx = new RegExp(rgx, (flags || '')); }
    return ((String(text).match(rgx) || 0)[grp || 0] || '');
  };
  EX.integerOrEmpty = function (text) {
    return ((String(text).match(/^\-?[0-9]+$/) || 0)[0] || '');
  };
  EX.matchTag = function (html, tag, hasAttr, getAttr) {
    var match;
    match = EX.matchOrEmpty(html, '<' + tag + '\\b' + EX.rgxAnyTagAttrs +
      '\\b' + hasAttr + EX.rgxAnyTagAttrs + '>');
    if (getAttr) {
      match = (match.split(new RegExp('[\\s\\n]' + getAttr + '="'))[1] || '');
      match = (match.split(/"/)[0] || '');
    }
    return match;
  };


  EX.jqIter = function jQueryEasyIter(func, elem) {
    if (!elem) { return jQueryEasyIter.bind(func); }
    elem = jq(elem);
    func = String(this);
    if (func !== '') { elem = elem[func](); }
    return elem;
  };
  EX.sorted = function (arrOrObj, cmpFunc) {
    var result = ((arrOrObj instanceof Array)
      ? arrOrObj.slice(0) : Object.keys(arrOrObj));
    result.sort(cmpFunc);
    return result;
  };


  EX.domainMassUpdate_easeTopicSelection = function () {
    var replyToSel = jq('table select[name=replyto]').first(), topicsTable,
      massUpdateForm, domainNames;
    if (replyToSel.length !== 1) { return; }
    massUpdateForm = jq(replyToSel[0].form);
    topicsTable = replyToSel.parents('table').first();
    domainNames = topicsTable.find('select[name=ownerid]:first'
      ).find('option:not(:first)').map(EX.jqIter('text')).toArray();
    massUpdateForm[0].action += '#' + domainNames.join(',');
    EX.addNewWinCkb(massUpdateForm[0]);
    EX.addHashHeadline('Updating ' + domainNames.join(', '));
    replyToSel.parents('tr').first().addClass('mailaddr');
    topicsTable[0].id = 'domain-update-topics';
    topicsTable.find('input[type=checkbox]').each(function (tr, ckb) {
      var comboTd, whoisRoleName, prefillSel, roleLabel;
      ckb = jq(ckb);
      tr = ckb.parents('tr').first();
      prefillSel = tr.next('tr').hide().find('select');
      if (prefillSel.length !== 1) { return; }
      tr.addClass('domain-whois-role');
      ckb.detach();
      comboTd = tr.find('td:last');
      whoisRoleName = comboTd.text();
      roleLabel = comboTd.html('<label>').find('label');
      roleLabel.text(' ' + whoisRoleName).prepend(ckb);
      roleLabel.attr({ 'data-role': whoisRoleName });
      if (whoisRoleName.match(/\-C$/)) { roleLabel.addClass('any-c'); }
      prefillSel.detach().appendTo(comboTd);
      prefillSel.on('change', function () {
        ckb[0].checked = (prefillSel[0].selectedIndex > 0);
      });
    });
    topicsTable.before(massUpdateForm.detach());
    massUpdateForm.append(topicsTable.detach());
    (function toggleAnyC() {
      var anyC = jq('<input type="checkbox" id="domain-role-any-c">');
      jq('<label> *-C</label>').prependTo(topicsTable.find('td:last')
        ).prepend(anyC);
      anyC.toggle = function () {
        topicsTable.find('.any-c input').attr('checked', anyC[0].checked);
      };
      anyC.on('click', anyC.toggle);
    }());
    jq('<style type="text/css">').appendTo('head:first').text([
      '#domain-update-topics tr {',
      '  display: bloack;',
      '  float: left;',
      '  margin: 1em;',
      '  margin-bottom: 2em;',
      '}',
      '#domain-update-topics tr.mailaddr { clear: both; }',
      '#domain-update-topics tr:first-child { display: none; }',
      'tr.domain-whois-role .tdhead { display: none; }',
      'tr.domain-whois-role label { display: block; }',
      '.submit-wrapper label { margin-right: 1em; }',
    ].join('\n'));
  };


  EX.domainWhoisImExport_fieldNameRgx = /^(var[0-9]+)\[([a-z]+)\]$/;
  EX.domainWhoisImExport_install = function () {
    var whoisRoleSelects = 'table:first .tdrechts table .tdlinks select';
    whoisRoleSelects = EX.kisMainContentArea.find(whoisRoleSelects);
    whoisRoleSelects.each(function (selName, selElem) {
      var addonsDest;
      selName = String(selElem.name || '');
      selElem.size = Math.max(selElem.options.length, 1) + 1;
      if (!selName.match(EX.domainWhoisImExport_fieldNameRgx)) { return; }
      selName = selName.split(/\[/)[0];
      addonsDest = jq(selElem).parents('table').first().find('td:last')[0];
      if (!addonsDest.id) {
        addonsDest.id = 'imexport-' + selName;
        addonsDest.innerHTML = ('<"im"> &rarr; ' + selName + ' &rarr; <"ex">'
          ).replace(/<"/g, '<input type="text" name="" size="5" class="');
        jq(addonsDest).find('input').on('focus enter change keyup mouseup',
          null, { fnp: selName }, EX.domainWhoisImExport_doit);
      }
    });
  };

  EX.domainWhoisImExport_doit = function (evt) {
    var tgt = evt.target, cls = tgt.className, fieldNamePrefix = evt.data.fnp,
      fieldData = [], fieldsByKey = {};
    jq('input[type=text], select').each(function (fldV, elem) {
      var fldN = EX.domainWhoisImExport_fieldNameRgx.exec(String(elem.name));
      if (!fldN) { return; }
      if (fldN[1] !== fieldNamePrefix) { return; }
      fieldsByKey[fldN[2]] = elem;
      if (cls !== 'ex') { return; }
      fldV = elem.value;
      if (elem.options) { fldV = elem.options[elem.selectedIndex].value; }
      fieldData.push(fldN[2] + ':' + String(fldV || ''));
    });
    if (cls === 'ex') {
      fieldData.sort();
      tgt.value = fieldData.join('|');
      tgt.select();
    }
    if (cls === 'im') {
      jq.each(String(tgt.value || '').split(/\|/), function (elem, fieldInfo) {
        fieldInfo = fieldInfo.match(/^([a-z0-9]+):([\s\S]*)$/);
        if (!fieldInfo) { return; }
        elem = fieldsByKey[fieldInfo[1]];
        if (!elem) { return; }
        if (elem.options) {
          jq.each(elem.options, function (idx, opt) {
            if (opt.value === fieldInfo[2]) { elem.selectedIndex = idx; }
          });
        } else {
          elem.value = fieldInfo[2];
        }
      });
      tgt.value = '';
    }
    return false;
  };




























  jq(document).ready(EX.main);
}());