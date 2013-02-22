$(function() {
  function addClassAndTip(element, type, checked) {
    var $element = $(element);
    var itsData = $element.getITSData();
    var className = 'its-'+type;
    if (itsData.translate)
      delete itsData.translate;
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
    if (checked)
      $element.addClass(className);
    else
      $element.removeClass(className);
  }

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