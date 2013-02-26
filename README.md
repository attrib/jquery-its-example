jQuery ITS2.0 Example
=====================

This is a example to show how you could use the JQuery selector plugin for the
[International Tag Standard 2.0 (ITS2.0)](http://www.w3.org/TR/its20/).

It gives the possibility to highlight ITS data categories in a content and to edit/add ITS data.
Because it is a example for the JQuery Plugin only, it don't have any server side to save new ITS data.

You can find the packed jQuery Plugin at https://github.com/attrib/jquery-its2

The original source code is written in coffeescript and can be found at https://github.com/attrib/jquery-its2-src

Currently supported data categories from ITS 2.0:
* Translate
* Localization Note
* Storage Size
* Allowed Characters

Highlight ITS Data
------------------

On the right side you can find checkboxes. When clicking a checkbox the corresponding ITS data will be highlighted.
We are using here the data attribute to define the selector, each checkbox has to use to highlight the correct content.

The code can be found under scripts/highlight.js and it depends on (JQuery)[http://www.jquery.com] and a minimal patched
the version of (Simpletip)[http://craigsworks.com/projects/simpletip/] JQuery Plugin to do the nice tooltip.

Edit ITS Data
-------------

You can select content and then click on the corresponding ITS data category name under "Set new ITS Data".

This will add the data category. Depending on the data category a overlay will show to set more data.
If the data category is already added you can edit or remove the category within the overlay.

The code can be found under scripts/edit.js and it depends on (JQuery)[http://www.jquery.com] and
(JQuery UI)[http://www.jqueryui.com] (Dialog and dependencies).
