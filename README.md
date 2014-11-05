-*- coding: utf-8, tab-width: 2 -*-

Host Europe Bookmarklets
========================

KIS UI Enhancements
===================

`kis_ui.multi.user.js`
----------------------
[GreaseMonkey](http://wiki.greasespot.net/Main_Page) loader
for all the other KIS UI bookmarklets.
(Yeah, currently there's only one anway.)

Known Bugs:
* No auto-update yet, as I'm not sure where I want to host these bookmarklets.

`kis_ui.domain_gropups.js`
--------------------------
Domain Manager optimizations.

Known Bugs:
* Most parts only work with german language KIS. Patches welcome.

Features:
* Expand various drop-down lists to what seems large enough, so you can
  select items directly.
* Checkboxes to submit forms into new browser windows,
  useful for repeating actions.
* Domain list:
  * Button to detect and display domain groups.
    * Group names can have custom background colors, just add ` #` and 3 or 6
      hex digits after the original group name.
  * Action selection list: auto-submit when you select an action.
* Domain Whois Update:
  * Easier topic selection: smart checkboxing,
    wildcard checkbox for all "-C" contact roles
  * Prefill source selectors next to each other
  * Role contact import/export fields: Click the output field to generate a
    one-line text that you can easily copy and paste into another role
    contact's input field to set new field values. To overwrite only some
    of the fields, add a stopover in your text editor and remove the fields
    that should not be imported.





Appendix
--------
License: [GNU GPL v2](gnu-gpl-v2.txt)

I hope you enjoy!

Thank you HE support team, for your kind assistance whenever I needed some,
and even more important, for keeping those occasions rare.
