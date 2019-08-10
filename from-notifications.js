// copy-paste code in browser terminal
//
// middle-click on FB query-full long link to shorten to minimum
// e.g., "fb.com/groups/myGroup/?multi_permalinks=xxxx&click_id=xxxx" to "fb.com/groups/myGroup/"
// click's target must be HTML <a> tag only, not children

{

    "use strict";

    document.onmousedown = function(e) {
        
        // detect middle-click on an HTML <a> tag that has a URL
        if (e.which==2 && e.target.tagName=="A" && e.target.href) {
            
            // store original URL so it can be put back later
            let o = e.target.href;

            let v = e.target.href;
            
            // manually stored delimiters
            let args = [
                ["facebook.com/groups/", "/"],
                ["/posts/",              "?"],
            ];

            // store URL length to detect when shortened
            let l = v.length;

            // split URL using parts and then add again to make URL excluding excess
            for (let c=0; c<args.length; ++c) {
                v = v.split(args[c][0]).length==2
                    ? (v.split( args[c][0] )[0] + args[c][0] + v.split( args[c][0] )[1].split( args[c][1] )[0])
                    : v;
                if (v.length<l) break;
            }

            // replace target URL [this needs to be done differently]
            e.target.href = v;

            setTimeout(function() {
                e.target.href = o;
            }, 500);

        }
    }
}
