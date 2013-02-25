/**
 * @file Highlight ITS data categories on click of the corresponding checkbox.
 *
 * Depends on jQuery, ITS-parser plugin and simpletip.
 */

$(function() {
  /**
   * Add Class and a JS Tooltip to the element with the type
   * @param element HTMLNode a node which has this data category
   * @param type string with the type of the data category
   * @param checked boolean true if the checkbox is now selected
   */
  function addClassAndTip(element, type, checked) {
    var $element = $(element);
    var itsData = $element.getITSData();
    var className = 'its-'+type;
    if (itsData.translate && type !== 'translate')
      delete itsData.translate;
    if (checked) {
      var toolTip = '';
      if (type === 'translate') {
        toolTip = 'This part will not be translated';
      }
      else {
        $.each(itsData, function(key, value) {
          toolTip += key + '=' + value + '<br>';
        });
      }
      $element.simpletip({content: toolTip, fixed: false});
      $element.addClass(className);
    }
    else {
      $element.removeClass(className);
      $('> .tooltip', $element).remove();
      $element.removeData('simpletip');
    }
  }

  /**
   * Parse all ITS data, including global rules.
   * When finished add a on click handler on the checkboxes,
   * which shows or hides meta data categories.
   */
  $.parseITS(function() {
    $('#its-highlighter').find('input[type=checkbox]').click(function() {
      var $this = $(this);
      var data = $this.data();
      var id = this.id;
      if (data.selector)
        $(data.selector).each(function() {
          addClassAndTip(this, id, $this.is(':checked'));
        });
    });



  });

});
