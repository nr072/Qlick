// Copy-paste code in browser console.
// (Paste again to turn it off.)

// Middle-click on FB query-full long link to shorten to minimum.
// E.g., "fb.com/groups/myGroup/?multi_permalinks=xxxx&click_id=xxxx" to "fb.com/groups/myGroup/".
// Click's target must be HTML <a> tag only. Even descendants do not work.

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

            // Detect if click target is notification item, 
            // or user / commenter / Page name in posts.
            if (e.target.tagName=="A" && e.target.href) {
                target = e.target;
            }

            // Target is from group suggestions displayed on right.
            else if (!e.target.children.length) {

                // Clicked on group name ("SPAN") or image ("IMG").
                let ancestor = e.target.tagName=="SPAN" 
                    ? e.target.parentNode.parentNode
                    : e.target.tagName=="IMG"
                        ? e.target.parentNode.parentNode.parentNode
                        : e.target;

                if (ancestor.tagName=="A" && ancestor.href) {
                    target = ancestor;
                }

            }

            let url            = target.href;
            let originalLength = url.length;

            // Store original URL to put back in target later.
            let originalURL    = target.href;

            // Manually store delimiters for clipping.
            let args = [
                // Notifications from groups, group in groups suggestions
                ["/groups/", "/"],
                // Notifications from users / Pages
                ["/posts/" , "?"],
            ];
            
            // Loop until link is successfully clipped using suitable set of
            // delimiters:
            // Split URL using each delimiter set, and construct clipped URL by
            // taking up to 2nd delimiter. If link length decreased, link was
            // clipped successfully. Otherwise, apply next set.
            for (let c=0; c<args.length; ++c) {
                url = url.split(args[c][0]).length==2
                    ? (url.split( args[c][0] )[0] 
                        + args[c][0] 
                        + url.split( args[c][0] )[1].split( args[c][1] )[0])
                    : url;
                if (url.length<originalLength)
                    break;
            }

            // Put clipped link in target, to open it as a result of middle-click.
            target.href = url;

            // Restore original link after delay (target has been clicked).
            setTimeout(function() {
                target.href = originalURL;
            }, 500);

        }
    }
}
