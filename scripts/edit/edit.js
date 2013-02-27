/**
 * @file Add/Edit ITS data into the content.
 *
 * Depends on jQuery, ITS-parser plugin and jQuery UI (Dialog with it dependencies)
 */
$(function() {

  /**
   * Standard function after editing a element.
   *
   * Close modal and remove it. Update the highlight class and tooltip of the element.
   * Remove empty spans.
   *
   * @param modal
   * @param type
   * @param $element
   */
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

  /**
   * Get the input data from a open modal.
   *
   * @param modal
   *
   * @return {Object}
   *   key is the its attribute name and value the input data
   */
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

  /**
   * Depending on type open a modal to input the ITS data and set this data or set it directly (only translate).
   *
   * @param type string
   *   One of translate|locNote|stroageSize|allowedCharacters.
   *
   * @param $element
   *   jQuery element which is selected.
   */
  function defineITSData(type, $element) {
    var modal = false,
      edit = false,
      global = true,
      itsData = $element.getITSData();

    switch (type) {
      case 'translate':
      default:
        if (!itsData.translate) {
          // No global rules.
          if ($element.get(0).hasAttribute('translate')) {
            $element.removeAttr('translate');
          }
          // This is set by a global rule, so force to translate.
          else {
            $element.attr('translate', 'yes');
          }
        }
        else {
          // Its translate='yes', so it seems there is a global rule, for it, so only remove this attribute.
          if ($element.get(0).hasAttribute('translate') && ($element.attr('translate') === 'yes' || $element.attr('translate') === true)) {
            $element.removeAttr('translate');
          }
          // No global rules.
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

  /**
   * Getting the selected dom elements, when clicking on one of the links.
   */
  $('#its-setter').find('li a').click(function(event) {
    event.stopPropagation();
    event.preventDefault();

    var $this = $(this);

    var type = $this.attr('href').replace(/#/, '');
    console.log(type);
    // IE9+, anything else
    // Retrieving a dom element from a selection is a pain in the ass!
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
          var content,
            startNode = range.startContainer.childNodes[range.startOffset] || range.startContainer,
            endNode   = range.endContainer.childNodes[range.endOffset] || range.endContainer;
          console.log(startNode, range.startOffset);
          console.log(endNode, range.endOffset);

          console.log(startNode.nodeName, endNode.nodeName);
          // selection of a text
          if (startNode.nodeName === '#text' && endNode.nodeName === '#text') {
            // TODO: detect switching of nodes <p>|aaaa</p><p>bbbb|</p>

            // The selected text has the same length then the node which is selected.
            // Therefore we selected this node completely and don't add an additional span.
            // For Chrome (selection is inside of the node - <a>    |aaaa|</a> ).
            if (startNode.parentNode && range.startOffset == 0 && $.trim(range.toString()) === $.trim(startNode.parentNode.textContent)) {
              content = $(startNode.parentNode);
            }
            // For Firefox (selection is outside of the node - |<a>    aaaa</a>| ).
            else if (startNode.nextSibling && range.endOffset == 0 && $.trim(range.toString()) === $.trim(startNode.nextSibling.textContent)) {
              content = $(startNode.nextSibling);
            }
            // Not the complete text is selected, so add a span around the selected text now.
            else {
              content = $(document.createElement('span'));
              content.html(range.extractContents());
              range.insertNode(content.get(0));
            }
          }
          // Paragraph or similar selected.
          else {
            console.log('TODO', range.commonAncestorContainer);


          }

          if (typeof content !== 'undefined' ) {
            console.log(content);
            defineITSData(type, content);
          }
        }
      }
    }

  });
});

// $($('*[title]').get(0).attributes[1]).is(':translate(yes)')