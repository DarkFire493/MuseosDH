var copyTextareaBtn=document.querySelector("js-textareacopybtn");copyTextareaBtn.addEventListener("click",function(){document.querySelector("js-copytextarea").select();try{var e=document.execCommand("copy"),o=e?"exitoso":"no exitoso";console.log("Copiado "+o)}catch(e){console.log("Error, no se puede copiar")}});