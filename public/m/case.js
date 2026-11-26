// The e-mail case page: one report case on a Moment or a Moment comment.
//
// The link in the operator's e-mail is /m/case#t=<token>. The token stays in the
// fragment (never sent in a request line, never in a log) and goes to the
// moderation-case function in a POST body. Opening this page only READS the
// case; nothing is decided until a button is tapped and then confirmed.
//
// Every piece of user text is put on the page with textContent - never as HTML.
(function () {
  "use strict";

  var PROD_API = "https://gckhqhtkkedmfswjauvw.supabase.co/functions/v1/moderation-case";
  var params = new URLSearchParams(location.hash.replace(/^#/, ""));
  var token = params.get("t") || "";
  // A local test may point the page at a local function; never in production.
  var local = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  var API = local && params.get("api") ? params.get("api") : PROD_API;

  var title = document.getElementById("case-title");
  var meta = document.getElementById("case-meta");
  var body = document.getElementById("case-body");
  var current = null;
  var busy = false;

  var REASON = {
    harassment: "嫌がらせ", inappropriate_behavior: "不適切な行為", nudity: "性的な内容",
    violence: "暴力", underage: "未成年の疑い", spam: "スパム", scam: "詐欺", other: "その他",
    "text:contact_solicitation": "外部連絡先への誘導（自動ルール）",
    "screen:review": "AI判定（要確認）", "screen:block": "AI判定（違反の疑い）"
  };
  var TARGET = { moment: "Moment投稿", moment_comment: "Momentのコメント" };
  var RULE = {
    contact_handle: "外部アプリ名とIDらしき文字列",
    contact_request: "外部アプリでの連絡を求める文",
    phone_number: "電話番号らしき数字"
  };
  var HOLD = {
    text_contact_solicitation: "外部連絡先への誘導ルール",
    awaiting_image_screen: "画像のAI審査待ち",
    screen_review: "AI判定（要確認）",
    screen_blocked: "AI判定（違反の疑い）",
    rescreen: "AI再判定"
  };
  var SOURCE = { text_rule: "自動ルール", image_screen: "AI判定", rescreen: "AI再判定", operator: "運営" };
  var DECISION = {
    remove: { label: "削除する", cls: "danger",
              confirm: "この投稿を削除します。投稿者を含む全員から見えなくなります。", done: "削除しました" },
    dismiss: { label: "違反なしで閉じる", cls: "",
               confirm: "違反なしとして案件を閉じます。投稿の表示状態は変わりません。", done: "違反なしで閉じました" },
    restore: { label: "違反なし・公開に戻す", cls: "primary",
               confirm: "自動判定による非表示を解除し、全員に公開します。", done: "違反なしとして公開に戻しました" }
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = String(text);
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function jst(iso) {
    var t = Date.parse(iso);
    if (!isFinite(t)) return "";
    var d = new Date(t + 9 * 3600000);
    var p = function (x) { return (x < 10 ? "0" : "") + x; };
    return (d.getUTCMonth() + 1) + "/" + d.getUTCDate() + " " + p(d.getUTCHours()) + ":" + p(d.getUTCMinutes());
  }
  function member(a) {
    if (!a) return "不明なユーザー";
    var n = a.member_number ? "MATCHOS #" + String(a.member_number).padStart(6, "0") : "";
    return (a.username || "(名前なし)") + (n ? "（" + n + "）" : "");
  }
  function reason(r) { return REASON[r] || r || "不明"; }

  function call(payload) {
    payload.token = token;
    return fetch(API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer"
    }).then(function (r) {
      return r.json().catch(function () { return { status: "error" }; });
    });
  }

  // ------------------------------------------------------------------ states

  function message(head, text, extra) {
    title.textContent = head;
    meta.textContent = "";
    clear(body);
    var box = el("div", "case-result");
    box.appendChild(el("p", "case-note", text));
    if (extra) box.appendChild(extra);
    body.appendChild(box);
    removeActions();
  }

  function resendButton() {
    var wrap = el("div");
    var b = el("button", "case-btn primary", "新しいリンクをメールで受け取る");
    b.type = "button";
    var note = el("p", "case-note", "運営の固定アドレスに届きます。届いたら古いリンクは使えません。");
    b.addEventListener("click", function () {
      if (busy) return;
      busy = true;
      b.disabled = true;
      call({ action: "resend" }).then(function (r) {
        busy = false;
        if (r.status === "queued") note.textContent = "送信しました。数分以内にメールが届きます。";
        else if (r.status === "recently_sent") note.textContent = "少し前に送信済みです。10分ほど待ってからもう一度お試しください。";
        else if (r.status === "closed") { show(r); return; }
        else { note.textContent = "送信できませんでした。管理画面をご利用ください。"; b.disabled = false; }
      }, function () {
        busy = false;
        b.disabled = false;
        note.textContent = "通信できませんでした。もう一度お試しください。";
      });
    });
    wrap.appendChild(b);
    wrap.appendChild(note);
    return wrap;
  }

  function closedView(r) {
    var what = r.outcome === "actioned" ? "対応済み（削除）" : "対応済み（違反なし）";
    var note = (r.note || "").indexOf("restored") >= 0 ? "違反なしとして公開に戻しました。" : "";
    message(what, (r.resolved_at ? jst(r.resolved_at) + "（日本時間）に処理されました。" : "処理済みです。") + note +
      " この案件で同じ操作が繰り返されることはありません。");
  }

  function show(r) {
    switch (r && r.status) {
      case "open": return openView(r);
      case "closed": return closedView(r);
      case "expired": return message("リンクの期限が切れています", "このリンクは24時間で無効になります。", resendButton());
      case "superseded": return message("新しいリンクが発行されています",
        "この案件には新しいリンクがあります。最新のメールを開くか、もう一度リンクを受け取ってください。", resendButton());
      case "invalid": return message("このリンクは使えません", "メールのリンクをそのまま開いてください。");
      case "console_only": return message("管理画面で対応してください",
        "この案件は児童の性的画像の疑いがあるため、メールのリンクでは表示・操作できません。管理画面で対応してください。");
      default: return message("読み込めませんでした", "時間をおいてもう一度開いてください。");
    }
  }

  // ------------------------------------------------------------- open case

  // Why automatic screening held the item: the rule and the matched text, or
  // the classifier's top categories.
  function holdCard(r) {
    var h = r.hold || {};
    var card = el("section", "case-card case-hold");
    card.appendChild(el("h2", null, "自動で非表示になった理由"));
    card.appendChild(el("p", "case-author", HOLD[h.reason] || (SOURCE[h.source] || "自動判定")));
    if (h.text_rule) {
      card.appendChild(el("p", "case-note", "一致した条件: " + (RULE[h.text_rule.rule] || h.text_rule.rule)));
      if (h.text_rule.matched) card.appendChild(el("p", "case-match", h.text_rule.matched));
    }
    if (h.labels && h.labels.length) {
      card.appendChild(el("p", "case-note", "AIの判定: " + h.labels.map(function (x) {
        return x.category + " " + Math.round(Number(x.score) * 100) + "%";
      }).join("、")));
    }
    card.appendChild(el("p", "case-note", r.restorable
      ? "違反がなければ「違反なし・公開に戻す」で全員に公開されます。"
      : "法的保全中のため、この画面からは公開に戻せません。"));
    return card;
  }

  function mediaBlock(items) {
    var box = el("div", "case-media");
    (items || []).forEach(function (m) {
      if (!m.url) { box.appendChild(el("div", "case-missing", "画像を表示できません")); return; }
      if (m.kind === "video") {
        var v = el("video");
        v.controls = true;
        v.playsInline = true;
        v.preload = "metadata";
        if (m.poster) v.poster = m.poster;
        v.src = m.url;
        box.appendChild(v);
      } else {
        var img = el("img");
        img.alt = "投稿の画像";
        img.src = m.url;
        img.loading = "lazy";
        box.appendChild(img);
      }
    });
    return box;
  }

  function stateBadge(state) {
    if (!state) return null;
    var map = { pending_review: ["確認待ちで非表示", "warn"], hidden: ["非表示", "warn"],
                removed: ["削除済み", "bad"], visible: ["公開中", ""] };
    var s = map[state];
    return s ? el("span", "case-badge " + s[1], s[0]) : null;
  }

  function postCard(heading, item, cls) {
    var card = el("section", "case-card " + (cls || ""));
    card.appendChild(el("h2", null, heading));
    if (!item) {
      card.appendChild(el("p", "case-text case-empty", "投稿者が削除済みです"));
      return card;
    }
    var badge = stateBadge(item.state);
    if (badge) card.appendChild(badge);
    card.appendChild(el("p", "case-author", member(item.author)));
    if (item.created_at) card.appendChild(el("p", "case-time", jst(item.created_at) + "（日本時間）"));
    if (item.media && item.media.length) card.appendChild(mediaBlock(item.media));
    card.appendChild(item.body ? el("p", "case-text", item.body) : el("p", "case-text case-empty", "（本文なし）"));
    return card;
  }

  function commentRow(c, isTarget) {
    var row = el("div", "case-comment" + (isTarget ? " target" : ""));
    var head = el("p", "case-author", member(c.author) + (isTarget ? "　← 通報対象" : ""));
    row.appendChild(head);
    var badge = stateBadge(c.state);
    if (badge) row.appendChild(badge);
    row.appendChild(el("p", "case-text", c.body || ""));
    return row;
  }

  function openView(r) {
    current = r;
    var c = r.case || {};
    title.textContent = (TARGET[c.target_type] || "投稿") + "への通報";
    meta.textContent = "通報 " + (c.report_count || 0) + "件 ・ 期限 " + jst(c.due_at) +
      " ・ リンク有効 " + jst(r.expires_at) + " まで（日本時間）";
    clear(body);

    // What is already true about the item.
    var cs = r.content_state;
    if (!r.content_exists) {
      body.appendChild(el("p", "case-card case-note", "投稿者がすでに削除しています。案件を閉じるだけです。"));
    } else if (r.auto_held) {
      body.appendChild(holdCard(r));
    } else if (cs && cs.source === "operator" && cs.state !== "visible") {
      body.appendChild(el("p", "case-card case-note",
        "運営がすでに" + (cs.state === "removed" ? "削除" : "非表示に") + "しています。「違反なし」で閉じてもこの状態は変わりません。"));
    }

    // Reports.
    var rep = el("section", "case-card");
    rep.appendChild(el("h2", null, "通報（" + (r.reports || []).length + "件）"));
    (r.reports || []).forEach(function (x) {
      var row = el("div", "case-report");
      row.appendChild(el("strong", null, reason(x.reason) + "　" + jst(x.created_at)));
      if (x.note) row.appendChild(el("p", null, x.note));
      rep.appendChild(row);
    });
    if (!(r.reports || []).length) rep.appendChild(el("p", "case-note", "通報ではなく、自動判定で保留された案件です。"));

    body.appendChild(rep);
    if (c.target_type === "moment_comment") {
      var ctx = el("section", "case-card case-context");
      ctx.appendChild(el("h2", null, "コメント（前後3件）"));
      (r.context_before || []).forEach(function (x) { ctx.appendChild(commentRow(x, false)); });
      if (r.target) ctx.appendChild(commentRow(r.target, true));
      else ctx.appendChild(el("p", "case-text case-empty", "通報されたコメントは投稿者が削除済みです"));
      (r.context_after || []).forEach(function (x) { ctx.appendChild(commentRow(x, false)); });
      body.appendChild(ctx);
      body.appendChild(postCard("コメント先の投稿", r.parent, "case-parent"));
    } else {
      body.appendChild(postCard("通報された投稿", r.target));
    }
    body.appendChild(el("p", "case-note",
      "BAN・停止・通常の復元は管理画面で行ってください。このリンクは転送しないでください。"));
    actions(r.decisions || []);
  }

  // --------------------------------------------------------------- actions

  var bar = null;
  function removeActions() { if (bar) { bar.remove(); bar = null; } }

  function actions(decisions) {
    removeActions();
    bar = el("div", "case-actions");
    var inner = el("div", "case-actions-inner");
    bar.appendChild(inner);
    document.body.appendChild(bar);
    var row = el("div", "case-stack");
    decisions.forEach(function (d) {
      var spec = DECISION[d];
      if (!spec) return;
      var b = el("button", "case-btn " + spec.cls, spec.label);
      b.type = "button";
      b.addEventListener("click", function () { confirmStep(d); });
      row.appendChild(b);
    });
    inner.appendChild(row);
  }

  function confirmStep(decision) {
    if (busy) return;
    var spec = DECISION[decision];
    clear(bar.firstChild);
    var inner = bar.firstChild;
    inner.appendChild(el("p", null, spec.confirm));
    var row = el("div", "case-row");
    var cancel = el("button", "case-btn", "キャンセル");
    cancel.type = "button";
    var ok = el("button", "case-btn " + (spec.cls || "primary"), "確定");
    ok.type = "button";
    cancel.addEventListener("click", function () { actions(current.decisions || []); });
    ok.addEventListener("click", function () {
      if (busy) return;
      busy = true;
      ok.disabled = true;
      cancel.disabled = true;
      ok.textContent = "処理中…";
      call({ action: "decide", decision: decision, version: current.version }).then(function (r) {
        busy = false;
        if (r.status === "done") {
          message(spec.done, "記録しました。この案件は対応済みです。もう一度開いても同じ処理は行われません。");
        } else if (r.status === "stale") {
          message("内容が更新されました", "画面を開いた後に新しい通報や状態の変化がありました。最新の内容を確認してください。",
            reloadButton());
        } else if (r.status === "closed" || r.status === "expired" || r.status === "superseded" || r.status === "invalid") {
          show(r);
        } else {
          failed(decision);
        }
      }, function () {
        busy = false;
        failed(decision);
      });
    });
    row.appendChild(cancel);
    row.appendChild(ok);
    inner.appendChild(row);
  }

  function failed(decision) {
    clear(bar.firstChild);
    var inner = bar.firstChild;
    inner.appendChild(el("p", null, "完了できませんでした。案件は未処理のままです。"));
    var retry = el("button", "case-btn", "最新の内容を読み込み直す");
    retry.type = "button";
    retry.addEventListener("click", load);
    inner.appendChild(retry);
  }

  function reloadButton() {
    var b = el("button", "case-btn primary", "最新の内容を表示");
    b.type = "button";
    b.addEventListener("click", load);
    return b;
  }

  function load() {
    title.textContent = "読み込み中…";
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) { show({ status: "invalid" }); return; }
    call({ action: "view" }).then(show, function () { show({ status: "error" }); });
  }

  load();
})();
