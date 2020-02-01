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

    // If turned off, create a sign to show it, after turning on.
    // Otherwise, remove existing sign.
    let sign = document.getElementById('qlick_sign');
    if (sign) {
        document.body.removeChild(sign);
        isQlickOn = false;
    } else {
        document.body.appendChild(
            createSign({
                id: 'qlick_sign',
                text: 'Qlick',
            })
        );
        isQlickOn = true;
    }

    function createSign(conf) {
        let sb = document.createElement("div");
        sb.id                 = conf.id;
        sb.innerText          = conf.text;
        sb.style.position     = "fixed";
        sb.style.bottom       = "15px";
        sb.style.left         = "15px";
        sb.style.color        = "#666";
        sb.style.border       = "1px solid #aaa";
        sb.style.borderRadius = "5px";
        sb.style.padding      = "3px 7px";
        sb.style.zIndex       = 9999;
        return sb;
    }

    function clipLink(url) {

        // Store old URL length to later determine if link was clipped successfully.
        let oldLength  = url.length;

        // Delimiter sets for clipping
        let dList = [

            // Group post notifications
            [ "/?multi_permalinks=", "%"        ],
            [ "/?multi_permalinks=", "&"        ],

            // Group posts (with optional trailing queries)
            [ "/permalink/",         "/"        ],

            // Group names in groups suggestions
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

            // Notifications about pages (invite, name change, etc.)
            ["pages/?category=",  "&"       ],

            // Indiscriminately remove all queries.
            [".com/",             "?"       ],

        ];

        // Loop until link is successfully clipped using suitable set
        // of delimiters.
        // Split URL using each delimiter set, and construct clipped
        // URL by taking up to 2nd delimiter. If link length decreases,
        // link was clipped successfully. If not, apply next set.
        for (let c=0; c<dList.length; ++c) {

            url = url.split(dList[c][0]).length==2
                ? (url.split( dList[c][0] )[0]
                    + dList[c][0]
                    + url.split( dList[c][0] )[1].split( dList[c][1] )[0])
                : url;

            if (url.length<oldLength)
                break;

        }

        return url;
    }

    // Clip target <a> tag's link if directly middle-clicked when turned on.
    document.onmousedown = function(e) {

        if (isQlickOn && e.which==2) {

            let target;

            // Detect if click target is an eligible (has `href` attribute) HTML
            // <a> tag, and set it as target.
            // Otherwise, set nearest eligible ancestor <a> tag as target.
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
                let oldURL = target.href;

                // Put clipped link in target, to open it as a result of
                // middle-click.
                target.href = clipLink(oldURL);

                // Restore original link after delay (target has been clicked).
                setTimeout(function() {
                    target.href = oldURL;
                }, 500);

            }

        }
    }
}
