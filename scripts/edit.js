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
            // TODO use the correct attr here! (and be aware of unselect)
            var $span = $(document.createElement('span')).attr('translate', 'no');
            $span.html(currentNode);
            currentNode = $span.get(0);
            range.insertNode(currentNode);
          }
          else {
            // TODO use the correct attr here! (and be aware of unselect)
            $(currentNode).attr('translate', 'no');
          }
          // Refresh the highlight of this element, if the checkbox is checked
          if ($('#' + type).is(':checked')) {
            addClassAndTip(currentNode, type, true);
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