// copy-paste code in browser terminal
//
// right click on FB query-full long link to shorten to minimum
// e.g., "fb.com/groups/myGroup/?multi_permalinks=xxxx&click_id=xxxx" to "fb.com/groups/myGroup/"
// right-click target must be HTML <a> tag only, not children

{
    document.onmousedown = function(e) {
        
        // detect right-click on HTML <a> tag that has a URL
        if (e.which==3 && e.target.tagName=="A" && e.target.href) {
            
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

        }
    }
}
