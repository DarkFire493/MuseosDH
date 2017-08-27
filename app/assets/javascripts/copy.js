$('.js-textareacopybtn').on('click', function(event) {
  var copyTextarea = $(this).data('id');
  $('#' + copyTextarea)[0].select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
  } catch (err) {
    console.log('Oops, unable to copy');
  }
});