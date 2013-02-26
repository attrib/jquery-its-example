/**
 * @file Add/Edit ITS data into the content.
 *
 * Depends on jQuery, ITS-parser plugin and jQuery UI (Dialog with it dependencies)
 */
$(function() {

  function finishEditing(modal, type, $element) {
    if (modal)
      $(modal).dialog('close').remove();

    // Refresh the highlight of this element, if the checkbox is checked
    var checkbox = $('#' + type);
    if (checkbox.is(':checked')) {
      addClassAndTip($element, type, false);
      var data = checkbox.data();
      if (data.selector && $element.is(data.selector)) {
        addClassAndTip($element, type, true);
      }
    }

    // Remove empty spans
    if ($element.prop('nodeName').toLowerCase() == 'span' && $element.prop('attributes').length == 0) {
      $element.replaceWith($element.html());
    }

  }

  function getDataFromModal(modal) {
    var data = {};
    $('.value', modal).each(function() {
      var $this = $(this),
        value = $this.val(),
        id = $this.attr('id');
      id = id.replace(/edit-form-/, '');
      id = 'its-' + id.replace(/([A-Z])/g, '-$1').toLowerCase();
      data[id] = value;
    });
    return data;
  }

  function defineITSData(type, $element) {
    var modal = false,
      edit = false,
      global = true,
      itsData = $element.getITSData();

    switch (type) {
      case 'translate':
      default:
        if (!itsData.translate) {
          // no global rule
          if ($element.get(0).hasAttribute('translate')) {
            $element.removeAttr('translate');
          }
          // this is set by a global rule, so force to translate
          else {
            $element.attr('translate', 'yes');
          }
        }
        else {
          // its translate='yes', so it seems there is a global rule, for it, so only remove this attribute
          if ($element.get(0).hasAttribute('translate') && ($element.attr('translate') === 'yes' || $element.attr('translate') === true)) {
            $element.removeAttr('translate');
          }
          // no global rule
          else {
            $element.attr('translate', 'no');
          }
        }
        finishEditing(false, type, $element);
        break;

      case 'locNote':
        modal = $('<div id="edit-form" title="Localization Note">' +
          '<label for="edit-form-locNoteType">Type</label><select id="edit-form-locNoteType" class="value"><option value="description">description</option><option value="alert">alert</option></select><br>' +
          '<label for="edit-form-locNote">List</label><textarea id="edit-form-locNote" class="value"></textarea>' +
          '</div>');
        if (itsData.locNote) {
          edit = true;
          if ($element.attr('its-loc-note')) {
            global = false;
          }
        }
        break;

      case 'storageSize':
        modal = $('<div id="edit-form" title="Storage Size">' +
          '<label for="edit-form-storageSize">Size</label><input id="edit-form-storageSize" class="value" type="value" /><br>' +
          '<label for="edit-form-storageEncoding">Encoding</label><input id="edit-form-storageEncoding" class="value" type="value" /><br>' +
          '<label for="edit-form-lineBreakType">LineBreakType</label><select id="edit-form-lineBreakType" class="value"><option value="cr">CARRIAGE RETURN</option><option value="lf">LINE FEED</option><option value="crlf">CARRIAGE RETURN + LINE FEED</option><option value="nel">NEXT LINE</option></select>' +
          '</div>');
        if (itsData.storageSize) {
          edit = true;
          if ($element.attr('its-storage-size')) {
            global = false;
          }
        }
        break;

      case 'allowedCharacters':
        modal = $('<div id="edit-form" title="Allowed Characters">' +
          '<label for="edit-form-allowedCharacters">Allowed Characters</label><input id="edit-form-allowedCharacters" class="value" type="value" /><br>' +
          'Regular Expression' +
          '</div>');
        if (itsData.allowedCharacters) {
          edit = true;
          if ($element.attr('its-allowed-characters')) {
            global = false;
          }
        }
        break;

    }

    if (modal) {

      modal.hide();
      $('body').append(modal);
      modal.dialog({
        autoOpen:false,
        modal:true
      });

      $('.value', modal).each(function() {
        $(this).val('');
      });
      $.each(itsData, function(key, value) {
        var inputField = $('#edit-form-' + key, modal);
        if (inputField.length != 0) {
          inputField.val(value);
        }
      });

      var buttons = {};
      if (edit) {
        buttons.edit = function () {
          $.each(getDataFromModal(modal), function(attrName, value) {
            $element.attr(attrName, value);
          });
          finishEditing(this, type, $element);
        };
        if (!global) {
          buttons.remove = function () {
            $.each(getDataFromModal(modal), function(attrName, value) {
              $element.removeAttr(attrName);
            });
            finishEditing(this, type, $element);
          }
        }
      }
      else {
        buttons.add = function () {
          $.each(getDataFromModal(modal), function(attrName, value) {
            $element.attr(attrName, value);
          });
          finishEditing(this, type, $element);
        };
      }
      buttons.close = function () {
        finishEditing(this, type, $element);
      };

      modal.dialog('option', 'buttons', buttons);
      modal.dialog('open');

    }
  }

  $('#its-setter').find('li a').click(function(event) {
    event.stopPropagation();
    event.preventDefault();

    var $this = $(this);

    var type = $this.attr('href').replace(/#/, '');
    console.log(type);
    // IE9+, anything else
    if (window.getSelection) {
      var selection = window.getSelection();

      if (selection.rangeCount) {
        var range = selection.getRangeAt(0);
        if (range.collapsed) {
          var currentNode = range.startContainer;
          while (currentNode.nodeName === '#text' && currentNode.parentNode) {
            currentNode = currentNode.parentNode;
          }
          if (currentNode.nodeName === '#text') {
            var outerSpan = $(document.createElement('span'));
            outerSpan.html(currentNode);
            currentNode = outerSpan.get(0);
            range.insertNode(currentNode);
            defineITSData(type, outerSpan);
          }
          else {
            defineITSData(type, $(currentNode));
          }
        }
        else {
          var content, newElement = false;
          console.log(range.startContainer, range.startOffset);
          console.log(range.endContainer, range.endOffset);

          console.log(range.startContainer.nodeName, range.endContainer.nodeName);
          // selection of a text
          if (range.startContainer.nodeName === '#text' && range.endContainer.nodeName === '#text') {
            // the selected text has the same length then the node which is selected
            // therefore we selected this node completely and don't add an additional span
            // chrome (selection is inside of the node - <a>    |aaaa|</a> )
            if (range.startContainer.parentNode && range.startOffset == 0 && $.trim(range.toString()) === $.trim(range.startContainer.parentNode.textContent)) {
              content = $(range.startContainer.parentNode);
            }
            // firefox (selection is outside of the node - |<a>    aaaa</a>| )
            else if (range.startContainer.nextSibling && range.endOffset == 0 && $.trim(range.toString()) === $.trim(range.startContainer.nextSibling.textContent)) {
              content = $(range.startContainer.nextSibling);
            }
            // otherwise take the selected text and replace it
            else {
              content = $(document.createElement('span'));
              content.html(range.extractContents());
              range.insertNode(content.get(0));
            }
          }
          else {
            console.log('TODO');
          }

          if (typeof content !== 'undefined' ) {
            console.log(newElement, content);
            defineITSData(type, content);
          }
        }
      }
    }

  });
});

// $($('*[title]').get(0).attributes[1]).is(':translate(yes)')