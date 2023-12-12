"use strict";
(function () {
    document.addEventListener('DOMContentLoaded', function () {            
        // Google Analytics
        if (document.getElementById("analyticsOptions")) {
            var jq = window.jQuery.noConflict(),
                website_base_url = window.website_base_url,
                ir_base_url = window.ir_base_url;
                
            var analyticsOptions = JSON.parse(document.getElementById("analyticsOptions").innerText);
            (function (i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function (){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,"script","https://www.google-analytics.com/analytics.js","ga");
            
            var ga = window.ga;
            ga("create", analyticsOptions.gaId, analyticsOptions.domain);
            
            (function () {
                var opts = {};
                var prefix = "/investors";
                if (location.hostname.indexOf("stockpr.com") === -1) {
                    opts.cookiePath = location.pathname.substring(0, location.pathname.indexOf("/", 1) + 1);
                    opts.page = prefix + location.pathname.substring(location.pathname.indexOf("/", 1));
                } else if (location.hostname.match(/^ir\./)) {
                    opts.page = prefix + location.pathname;
                }
                ga("send", "pageview", opts);
            })();
            /**
            * Function that tracks a click on an outbound link in Analytics.
            * This function takes a valid URL string as an argument, and uses that URL string
            * as the event label. Setting the transport method to 'beacon' lets the hit be sent
            * using 'navigator.sendBeacon' in browser that support it.
            */
            var trackOutboundLink = function (url, category) {
                category = category || "outbound";
                ga("send", "event", category, "click", url, {
                    "transport": "beacon"
                });
            };
            
            // Add outbound link tracking in GA
            jq("a").not(".fancybox").each(function (){
                var href = jq(this).attr("href");
                if (typeof href === "undefined") return;
                if (href.indexOf("http") >= 0 &&
                    (href.indexOf(website_base_url) < 0 && 
                        href.indexOf(ir_base_url) < 0 && 
                        href.indexOf("eqcdn") < 0 && 
                        href.indexOf("amazonaws") < 0
                   )
               ) {
                    jq(this).click(function (e) {
                        trackOutboundLink('"' + href + '"');
                    });
                } else {
                    // It's not an outbound link, but if it's a link to a file, we want to track that.
                    if (href.match(/(\.pdf|\.jpg|\.png|\.gif|\.ppt|\.jpeg|\.mp3|\.mp4|\.wav|\.docx|\.doc|\.xsl|\.cslx)/g)) {
                        jq(this).click(function (e) {
                            trackOutboundLink('"' + href + '"', "documents-and-files");
                        });
                    }
                }
            });
        }
    });
})();
