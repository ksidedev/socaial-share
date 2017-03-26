$(function () {
  var knownButtons = ['google-plus', 'twitter', 'pinterest', 'facebook', 'stumbleupon', 'linkedin'];

  /**
   * jQuery plugin - create share buttons
   *
   * @param {Object} [options]
   * @param {string[]} [options.buttons] - list of share buttons to be shown
   * @param {string} [options.url] - shared URL (by default current)
   * @param {string} [options.media] - shared image (optionally used by Pinterest)
   * @param {string|boolean} [options.counter=none] - type of display for share counter (top|bottom|none)
   * @param {string} [options.className] - CSS class for the root DOM element
   */
  $.fn.sharify = function (options) {
    var settings = $.extend({
      buttons: knownButtons.slice(),
      url: document.location.origin + document.location.pathname,
      media: null,
      counter: false,
      className: ''
    }, options);

    settings.buttons.contains = function (item) {
      return this.indexOf(item) > -1;
    };

    if (settings.counter && settings.counter !== 'none' && settings.counter !== 'bottom') {
      settings.counter = 'top';
    }
    else if (!settings.counter) {
      settings.counter = 'none';
    }

    return this.each(function () {
      var $share = $('<div/>', {class: $.trim(['share', 'counter-' + settings.counter, settings.className].join(' '), settings.className)});
      $.each(settings.buttons, function (index, name) {
        if (knownButtons.indexOf(name) > -1) {
          $share.append(createButton(name, settings));
        }
      });

      enableShareClick($share, settings);
      if (settings.counter !== 'none') {
        setShareCount($share, settings);
      }
      $(this).append($share);
    });
  };

  function createButton(name, settings) {
    var $button = $('<div/>', {'class': ['button', name].join(' ')});
    switch (settings.counter) {
      case 'top':
        $button.append(
          $('<div/>', {'class': 'counter'})).append(
          $('<a/>', {'href': '#'}).append(
            $('<i/>', {class: 'fa fa-' + name}))
        );
        break;
      case 'bottom':
        $button.append(
          $('<a/>', {'href': '#'}).append(
            $('<i/>', {class: 'fa fa-' + name}))
        ).append(
          $('<div/>', {'class': 'counter'})
        );
        break;
      case 'none':
        $button.append(
          $('<a/>', {'href': '#'}).append(
            $('<i/>', {class: 'fa fa-' + name})));
        break;
    }
    return $button;
  }

  function enableShareClick($share, settings) {
    function openShareWindow(e) {
      window.open(e.href, 'mywin', 'left=20,top=20,width=500,height=400,toolbar=1,resizable=0');
      return false;
    }

    var buttons = settings.buttons;
    if (buttons.contains('twitter')) {
      $share.find(".twitter a")
        .attr("href", "//twitter.com/intent/tweet?text=" + document.title + "&url=" + settings.url)
        .on("click", function () {
          return openShareWindow(this)
        });
    }
    if (buttons.contains('facebook')) {
      $share.find(".facebook a")
        .attr("href", "//www.facebook.com/sharer/sharer.php?u=" + settings.url)
        .on("click", function () {
          return openShareWindow(this)
        });
    }
    if (buttons.contains('linkedin')) {
      $share.find(".linkedin a")
        .attr("href", "//www.linkedin.com/cws/share?url=" + settings.url)
        .on("click", function () {
          return openShareWindow(this)
        });
    }
    if (buttons.contains('pinterest')) {
      if (settings.media) {
        $share.find(".pinterest a")
          .attr("href", "//www.pinterest.com/pin/create/button/" + "?url=" + settings.url + "&media=" + settings.media)
          .on("click", function () {
            return openShareWindow(this)
          });
      }
      else { // let Pinterest resolve your Pin media
        $share.find(".pinterest a").on("click", function (ev) {
          ev.preventDefault();
          var e = document.createElement('script');
          e.setAttribute('type', 'text/javascript');
          e.setAttribute('charset', 'UTF-8');
          e.setAttribute('src', 'http://assets.pinterest.com/js/pinmarklet.js?r=' + Math.random() * 99999999);
          document.body.appendChild(e);
        });
      }
    }
    if (buttons.contains('google-plus')) {
      $share.find(".google-plus a")
        .attr("href", "//plus.google.com/share?url=" + settings.url)
        .on("click", function () {
          return openShareWindow(this)
        });
    }
    if (buttons.contains('stumbleupon')) {
      $share.find(".stumbleupon a")
        .attr("href", "//www.stumbleupon.com/badge/?url=" + settings.url)
        .on("click", function () {
          return openShareWindow(this)
        });
    }
  }

  function setShareCount($share, settings) {
    var buttons = settings.buttons;
    if (buttons.contains('twitter')) {
      $.getJSON("http://urls.api.twitter.com/1/urls/count.json?url=" + settings.url + "&callback=?",
        function (json) {
          $share.find(".twitter .counter").text(formatCount(json.count));
        });
    }
    if (buttons.contains('facebook')) {
      $.getJSON("http://graph.facebook.com/" + settings.url, function (json) {
        $(".facebook .counter").text(formatCount(json.shares));
      });
    }

    if (buttons.contains('pinterest')) {
      $.getJSON("http://api.pinterest.com/v1/urls/count.json?url=" + settings.url + "&callback=?", function (json) {
        $(".pinterest .counter").text(formatCount(json.count));
      });
    }

    if (buttons.contains('linkedin')) {
      $.getJSON("http://www.linkedin.com/countserv/count/share?url=" + settings.url + "&callback=?",
        function (json) {
          $(".linkedin .counter").text(formatCount(json.count));
        });
    }

    function formatCount(num) {
      num = num || 0;
      if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'G';
      }
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num;
    }
  };
});

// Usage example:
$(function(){
    var buttons = ['twitter', 'google-plus', 'facebook', 'pinterest', 'linkedin', 'stumbleupon']
    
    $('.example.hidden-counter').sharify({buttons: buttons});
    
    $('#AppendSocial').sharify({
        buttons: buttons, 
        className: 'image'
    });    
    
    // $('.example.counter-top').sharify({
    //     buttons: buttons, 
    //     url: 'http://jsfiddle.net', //custom url to show the counter
    //     counter: 'top'}); 
    
    // $('.example.counter-bottom').sharify({
    //     buttons: buttons, 
    //     url: 'http://jsfiddle.net', //custom url to show the counter
    //     counter: 'bottom'
    // });
});