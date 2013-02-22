function addClass(element, type, checked) {
  var className = 'its-'+type;
  if (checked)
    $(element).addClass(className);
  else
    $(element).removeClass(className);
}

function addClassAndTip(element, type, checked) {
  addClass(element, type, checked);
  var $element = $(element);
  var itsData = $element.getITSData();
  if (itsData.translate)
    delete itsData.translate;
  var toolTip = '';
  $.each(itsData, function(key, value) {
    toolTip += key + '=' + value + '<br>';
  });
  $element.simpletip({content: toolTip, fixed: false});
}

$(function() {
  $.parseITS(function() {
    $('#its-highlighter').find('input[type=checkbox]').click(function() {
      var $this = $(this);
      var data = $this.data();
      var id = this.id;
      if (data.selector && data.callbackName)
        $(data.selector).each(function() {
          if(typeof window[data.callbackName] == 'function') window[data.callbackName](this, id, $this.is(':checked'));
        });
    });

    $(':translate(no)').each(function() {
      $(this).simpletip({
        content: 'This part will not be translated',
        fixed: false,
      });
    });
  });

});