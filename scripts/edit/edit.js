/**
 * @file Add/Edit ITS data into the content.
 *
 * Depends on jQuery, ITS-parser plugin.
 */
$(function() {
  function replaceSelectedText(replacementText) {
    var sel, range;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(replacementText));
      }
    } else if (document.selection && document.selection.createRange) {
      range = document.selection.createRange();
      range.text = replacementText;
    }
  }

  function finishEditing(modal, type, $element, callback) {
    if (modal)
      $(modal).dialog('close').remove();

    if (callback && typeof callback === 'function')
      callback($element);

    // Refresh the highlight of this element, if the checkbox is checked
    if ($('#' + type).is(':checked')) {
      addClassAndTip($element, type, true);
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

  function defineITSData(type, $element, callback) {
    var modal = false,
      edit = false,
      itsData = $element.getITSData();

    switch (type) {
      case 'translate':
      default:
        if (!itsData.translate) {
          $element.removeAttr('translate');
        }
        else {
          $element.attr('translate', 'no');
        }
        finishEditing(false, type, $element, callback);
        break;

      case 'locNote':
        modal = $('<div id="edit-form" title="Localization Note">' +
          '<label for="edit-form-locNoteType">Type</label><select id="edit-form-locNoteType" class="value"><option value="description">description</option><option value="alert">alert</option></select><br>' +
          '<label for="edit-form-locNote">List</label><textarea id="edit-form-locNote" class="value"></textarea>' +
          '</div>');
        if (itsData.locNote) {
          edit = true;
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
        }
        break;

      case 'allowedCharacters':
        modal = $('<div id="edit-form" title="Allowed Characters">' +
          '<label for="edit-form-allowedCharacters">Allowed Characters</label><input id="edit-form-allowedCharacters" class="value" type="value" /><br>' +
          'Regular Expression' +
          '</div>');
        if (itsData.allowedCharacters) {
          edit = true;
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
          // TODO edit global?
          $.each(getDataFromModal(modal), function(attrName, value) {
            $element.attr(attrName, value);
          });
          finishEditing(this, type, $element, callback);
        };
        buttons.remove = function () {
          // TODO remove global?
          $.each(getDataFromModal(modal), function(attrName, value) {
            $element.removeAttr(attrName);
          });
          finishEditing(this, type, $element, callback);
        }
      }
      else {
        buttons.add = function () {
          $.each(getDataFromModal(modal), function(attrName, value) {
            $element.attr(attrName, value);
          });
          finishEditing(this, type, $element, callback);
        };
      }
      buttons.close = function () {
        finishEditing(this, type, $element, callback);
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
            defineITSData(type, $(document.createElement('span')), function($element) {
              $element.html(currentNode);
              currentNode = $element.get(0);
              range.insertNode(currentNode);
            });
          }
          else {
            defineITSData(type, $(currentNode));
          }
        }
        else {
          // TODO selection
        }
      }
    }

  });
});

// $($('*[title]').get(0).attributes[1]).is(':translate(yes)')