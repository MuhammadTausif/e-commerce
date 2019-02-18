(function(G, U){
    "use strict";
    var helper = G.Helper || {};

    helper.isInt = function (n) {
        if ("" == n) {
            return false;
        }

        return n % 1 === 0;
    };

    helper.isFloat = function (n) {
        if ("" == n) {
            return false;
        }

        return n === Number(n) && n % 1 !== 0;
    };

    helper.Multiple = function (multiple, val) {
        if (0 != (val % multiple)) {
            val = ((Math.floor(val / multiple) + 1) * multiple);
        }

        return val;
    };

    helper.CreateObject = function (objItem, parent, funcObj) {
        objItem = new (function (obj) {
                this.parent = parent;
                for (var prop in obj) {
                    this[prop] = obj[prop];

                };

                if (funcObj) {
                    funcObj.call(this);
                }

        })(objItem);

        return objItem;
    };

    helper.CreateObjects = function (objects, parent, funcObj) {

        var i;

        for (i = objects.length; i--;) {
            objects[i] = helper.CreateObject(objects[i], parent, funcObj);
        }
    };

    helper.QueryString = function () {
        // This function is anonymous, is executed immediately and 
        // the return value is assigned to QueryString!
        // http://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-url-parameter
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    }();

    helper.GenerateGuid = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    helper.StripHtml = function(html) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    G.Helper = helper;
}(this, undefined));