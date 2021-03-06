window.common = (function(global) {
  const {
    Rx: { BehaviorSubject, Observable },
    common = { init: [] }
  } = global;

  var libraryIncludes = `
<link
  rel='stylesheet'
  href='//cdnjs.cloudflare.com/ajax/libs/animate.css/3.2.0/animate.min.css'
  />
<link
  rel='stylesheet'
  href='//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css'
  />

<link
  rel='stylesheet'
  href='//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css'
  />
<script src='https://cdn.jsdelivr.net/jquery/1.9.0/jquery.js'></script>
<style>
  body { padding: 0px 3px 0px 3px; }
</style>
  `;

  const iFrameScript$ =
    common.getScriptContent$('/js/iFrameScripts.js').shareReplay();

  // behavior subject allways remembers the last value
  // we use this to determine if runPreviewTest$ is defined
  // and prime it with false
  common.previewReady$ = new BehaviorSubject(false);

  // runPreviewTests$ should be set up in the preview window
  common.runPreviewTests$ =
    () => Observable.throw({ err: new Error('run preview not enabled') });

  common.updatePreview$ = function updatePreview$(code = '') {
    const previewFrame = document.getElementById('preview');
    const preview = previewFrame.contentDocument ||
      previewFrame.contentWindow.document;
    if (!preview) {
      return Observable.just(code);
    }

    return iFrameScript$
      .map(script => `<script>${script}</script>`)
      .flatMap(script => {
        // we make sure to override the last value in the
        // subject to false here.
        common.previewReady$.onNext(false);
        preview.open();
        preview.write(libraryIncludes + code + '<!-- -->' + script);
        preview.close();
        // now we filter false values and wait for the first true
        return common.previewReady$
          .filter(ready => ready)
          .first();
      })
      .map(() => code);
  };

  return common;
}(window));
