// copy-paste in browser terminal
//
// right click on FB query-full long link to shorten to minimum
// e.g., "fb.com/groups/myGroup/?multi_permalinks=xxxx&click_id=xxxx" to "fb.com/groups/myGroup/"
// only right click on <a> tag for this to work

{
    document.onmousedown = function(e) {
        
        // detect right-click
        if (e.which==3) {
            
            // only works when right-clicked on <a> tag, not on any child
            if (e.target.tagName=="A") {
                
                let t = document.createElement("textarea");
                
                // either takes the URL or nothing is copied
                let v = e.target.href || "";
                
                // manually entered delimiters
                let args = [
                    ["facebook.com/groups/", "/"],
                    ["/posts/",              "?"],
                ];
                
                // split URL using parts and then add again to make URL excluding excess
                // if not of one type, then must be another; if none at all, nothing is copied
                for (let c=0; c<args.length; ++c) {
                    v = v.split(args[c][0]).length==2
                        ? (v.split( args[c][0] )[0] + args[c][0] + v.split( args[c][0] )[1].split( args[c][1] )[0])
                        : "";
                    if (v) 
                        break;
                }
                
                t.value = v;
                
                // "display:none" seems to have some problem with "select()"
                t.style.height = 0;
                
                document.body.appendChild(t);
                
                // copy modified link (currently the content of the invisible text-area)
                t.select();
                document.execCommand("copy");
                
                document.body.removeChild(t);
                
                // scroll up, since text-area is added at the end of body and view is scrolled down
                window.scrollTo(0, 0);
                
            }
        }
    }
}
