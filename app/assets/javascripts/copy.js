var copyTextareaBtn = document.querySelector('js-textareacopybtn');

copyTextareaBtn.addEventListener('click', function(event){
  var copyTextarea = document.querySelector('js-copytextarea');
  copyTextarea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'exitoso' : 'no exitoso';
    console.log('Copiado ' + msg );
  } catch (err) {
    console.log('Error, no se puede copiar');
  }
});