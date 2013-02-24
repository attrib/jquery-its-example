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

      console.log(selection.rangeCount, selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset);
    }

  });
});
