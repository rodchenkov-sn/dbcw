function loadPageWithIframe(url) {
  var hiddenPage = document.createElement("iframe");
  hiddenPage.setAttribute("src", url);
  hiddenPage.style.display = 'none';
  document.body.appendChild(hiddenPage);
  hiddenPage.onload = function () {
    var frameDocument = hiddenPage.document;
    if (hiddenPage.contentDocument) {
      frameDocument = hiddenPage.contentDocument;
    } else if (hiddenPage.contentWindow) {
      frameDocument = hiddenPage.contentWindow.document;
    }
    document.open();
    document.write(frameDocument.documentElement.innerHTML);
    document.close();
    window.history.pushState("", document.title, url.replace('https://' + window.location.hostname, ''));
  }
}
