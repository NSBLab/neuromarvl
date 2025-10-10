/// <reference path="../extern/jquery.d.ts"/>
/// <reference path="../extern/jqueryui.d.ts"/>


/// used to delete visualisation data
function deleteFunction() {
    let query = window.location.search.substring(1);
        

    // check of URL parameters
    if (query && query.length > 0) {

        var p = query.split("=");
        if (p.length < 2) return false;

        var json;
        // Only let source be from "save_examples" (if specified by "example") or default to "save".
        let source = p[0];      // "save" or "example"
        console.log("kere");
        $.post("brain-app/deleteappdatacopy.aspx",
            {
                filename: p[1],
                source
            },
            (data, status) => {
                console.log(`Data fetch from ${p[0]} location got configuration with length ${data.length} and "${status}" status`);
                if (status.toLowerCase() == "success") {
                    // Ensure that data is not empty
                    if (!data || !data.length) return;

                    $("#documentconent").html(data);
                }
            }
        );
    } else {
            
    }
}