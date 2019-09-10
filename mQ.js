// Copy-paste code in browser console.
// (Paste again to turn it off.)
// Or better still: Turn it into a bookmarklet and then use it.

// Middle-click on FB query-full long links to shorten to minimum.
// E.g., from "facebook.com/groups/myGroup/?multi_permalinks=xxxx&click_id=xxxx"
// to "facebook.com/groups/myGroup/".

{

    "use strict";

    // Keep track if link clipping is turned on or off.
    let isQlickOn;

    // If turned off, create a marker to show it, after turning on. Otherwise,
    // remove existing marker.
    let marker = document.getElementById('qlick');
    if (marker) {
        document.body.removeChild(marker);
        isQlickOn = false;
    } else {
        let el = document.createElement("div");
        el.id                 = "qlick";
        el.innerText          = "Qlick";
        el.style.position     = "fixed";
        el.style.bottom       = "15px";
        el.style.left         = "15px";
        el.style.color        = "#666";
        el.style.border       = "1px solid #aaa";
        el.style.borderRadius = "5px";
        el.style.padding      = "3px 7px";
        el.style.zIndex       = 9999;
        document.body.appendChild(el);
        isQlickOn = true;
    }

    // Clip target <a> tag's link if directly middle-clicked when turned on.
    document.onmousedown = function(e) {

        if (isQlickOn && e.which==2) {

            let target;

            // Detect if click target is an eligible (has `href` attribute) HTML
            // <a> tag, and set it as target.
            // Otherwise set nearest eligible ancestor <a> tag as target.
            if (e.target.tagName=="A" && e.target.href) {
                target = e.target;
            } else {
                let ancestor = e.target.closest('a[href]');
                if (ancestor.href) {
                    target = ancestor;
                }
            }

            if (target) {

                // Store original URL to put back in target later.
                let originalURL = target.href;

                let url         = target.href;
                let prevLength  = url.length;

                // Manually store delimiters for clipping.
                let args = [

                    // Notifications from groups, group in groups suggestions
                    ["/groups/",          "/"       ],
                    
                    // Notifications from users / Pages
                    ["/posts/",           "?"       ],
                    
                    // Someone added photo to album
                    ["/media/set/",       "&"       ],
                    
                    // Someone changed profile picture
                    ["/photo.php?",       "&"       ],
                    
                    // Someone shared someone else's video or photos
                    [".php?story_fbid=",  "&notif"  ],
                    
                    // Log-in alert notification
                    ["/login_alerts/",    "&"       ],

                    // Friendversary video shared in chat.
                    ["onthisday/message", "&creator"],
                    
                    // Indiscriminately remove all queries.
                    [".com/",             "?"       ],
                    
                ];

                // Loop until link is successfully clipped using suitable set
                // of delimiters:
                // Split URL using each delimiter set, and construct clipped
                // URL by taking up to 2nd delimiter. If link length decreased,
                // link was clipped successfully. Otherwise, apply next set.
                for (let c=0; c<args.length; ++c) {
                    url = url.split(args[c][0]).length==2
                        ? (url.split( args[c][0] )[0]
                            + args[c][0]
                            + url.split( args[c][0] )[1].split( args[c][1] )[0])
                        : url;
                    if (url.length<prevLength)
                        break;
                }

                // Put clipped link in target, to open it as a result of
                // middle-click.
                target.href = url;

                // Restore original link after delay (target has been clicked).
                setTimeout(function() {
                    target.href = originalURL;
                }, 500);

            }

        }
    }
}
