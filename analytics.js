// GA4 カスタムイベント計測
//   shop_click  : BASE / メルカリへの外部リンククリック(主KPI: base の遷移率)
//   story_click : about.html / history.html へのリンククリック(補助KPI)
//   story_read  : [data-read-goal] 要素(ストーリーページの締め)到達で1回だけ送信
(function () {
  function send(name, params) {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", name, params);
  }

  function storyTarget(href) {
    if (href.indexOf("about.html") !== -1) return "about";
    if (href.indexOf("history.html") !== -1) return "history";
    return null;
  }

  function shopTarget(href) {
    if (href.indexOf("toraleather.handcrafted.jp") !== -1) return "base";
    if (href.indexOf("jp.mercari.com") !== -1) return "mercari";
    return null;
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest("a[href]");
    if (!link) return;
    var href = link.getAttribute("href") || "";
    var loc = link.dataset.loc || "unknown";

    var shop = shopTarget(href);
    if (shop) {
      var params = {
        link_target: shop,
        link_location: loc,
        page_path: window.location.pathname,
      };
      if (link.dataset.item) params.item_name = link.dataset.item;
      send("shop_click", params);
      return;
    }

    var story = storyTarget(href);
    if (story) {
      send("story_click", {
        link_target: story,
        link_location: loc,
        page_path: window.location.pathname,
      });
    }
  });

  var readGoal = document.querySelector("[data-read-goal]");
  if (readGoal && "IntersectionObserver" in window) {
    var sent = false;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || sent) return;
          sent = true;
          observer.disconnect();
          send("story_read", {
            story_page: readGoal.dataset.readGoal,
            page_path: window.location.pathname,
          });
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(readGoal);
  }
})();
