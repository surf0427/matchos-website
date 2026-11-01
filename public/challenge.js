// A Challenge Letter's link, opened in a browser: an in-app browser that does not
// hand Universal Links to the app, or a phone without the app. The path is checked
// and re-spelled before it goes anywhere; the app refuses anything it does not offer.
(function () {
  var match = /^\/u\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.exec(location.pathname);
  var open = document.getElementById("challenge-open");
  if (match) {
    open.href = "matcho://u/" + match[1];
  } else {
    // Not a profile link: nothing to open.
    open.hidden = true;
    document.getElementById("challenge-title").textContent = "This link can't be opened";
    document.getElementById("challenge-line").textContent = "Ask the person who sent it for a new one.";
    return;
  }
  if ((navigator.language || "").toLowerCase().indexOf("ja") === 0) {
    document.documentElement.lang = "ja";
    document.getElementById("challenge-title").textContent = "挑戦状が届いています";
    document.getElementById("challenge-line").textContent = "このリンクをMATCHOSアプリで開くと、挑戦者のプロフィールを確認できます。";
    open.textContent = "MATCHOSで開く";
    document.getElementById("challenge-get").textContent = "アプリをお持ちでない方へ";
    document.getElementById("challenge-soon").textContent = "MATCHOSは公開準備中です。ストアで公開され次第、ホームページにダウンロードリンクを掲載します。";
  }
})();
