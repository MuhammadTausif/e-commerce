var RestHelper = {

    GetCallUrl: function (url, functionName, params) {
        var pairs = [];
        var strParams;

        if (null == params) {
            //            params = [];
            params = {};
        }

        params["_tstamp"] = "" + new Date().getTime();



        //        for (var prop in params) {
        //            if (null != params[prop]) {
        //                pairs.push(prop + "='" + this.encodeData(params[prop]) + "'");
        //            }
        //        }

        //        strParams = pairs.join("&");
        //debugger;

        for (var prop in params) {
            if (null == params[prop]) {
                delete params[prop];
            }
        }

        strParams = $.param(params);
        url = url + functionName + "?" + strParams;

        return url;
    },

    Call: function (url, functionName, params, successCallback, errorCallback, async, context) {
        //debugger;
        //var url = "api.svc/";

        //http://stackoverflow.com/questions/894860/set-a-default-parameter-value-for-a-javascript-function
        async = typeof async !== 'undefined' ? async : true;

        url = RestHelper.GetCallUrl(url, functionName, params);

        var ajaxParams = {
            type: "GET",
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: successCallback,
            error: function(request, status, error) {
                debugger;

                if (undefined != errorCallback) {
                    errorCallback(request, status, error);
                }

                console.log("%O", request);
                console.log("%O", status);
                console.log("%O", error);
                //debugger;
                if ("Unauthorized" == error) {
                    window.location = "Default.aspx";
                } else if ("Not Found" == error) {
                } else {
                    //debugger;
                    var j = jQuery.parseJSON(request.responseText);

                    alert(j);

                    //                    if ((undefined == j.error.innererror) || (null == j.error.innererror)) {
                    //                        alert(j.error.message);
                    //                    }
                    //                    else {
                    //                        var ex = j.error.innererror;
                    //                        while (undefined != ex.internalexception) {
                    //                            ex = ex.internalexception;
                    //                        }

                    //                        alert(ex.message);
                    //                    }
                }
            },
            async: async
        };

        if (context) {
            ajaxParams.context = context;
        }

        $.ajax(ajaxParams);
    },

    CallSync: function (url, functionName, params, successCallback, errorCallback) {
        this.Call(url, functionName, params, successCallback, errorCallback, false);
    },

    Post: function (url, functionName, data, successCallback, errorCallback, async, context) {
        async = typeof async !== 'undefined' ? async : true;

        url = url + functionName;

        var ajaxParams = {
            type: "POST",
            url: url,
            contentType: "application/json; charset=utf-8",
            data: data,
            dataType: "json",
            processData: true,
            success: successCallback,
            error: function(request, status, error) {
                debugger;

                if (undefined != errorCallback) {
                    errorCallback(request, status, error);
                }

                console.log("%O", request);
                console.log("%O", status);
                console.log("%O", error);
                //debugger;
                if ("Unauthorized" == error) {
                    window.location = "Default.aspx";
                } else if ("Not Found" == error) {
                } else {
                    //debugger;
                    var j = jQuery.parseJSON(request.responseText);

                    alert(j);
                }
            },
            async: async
        };

        if (context) {
            ajaxParams.context = context;
        }
        
        $.ajax(ajaxParams);
    },

    GetArray: function (p) {
        //url
        //functionName
        //params
        //targetObservableArray
        //errorCallback
        //funcObjectBuilder
        //parentObject

        if (!p.params) {
            p.params = null;
        }

        if (p.funcBeforeCall) {
            p.funcBeforeCall();
        }

        this.Call(p.url, p.functionName, p.params, function (res) {
            p.targetObservableArray.removeAll();

            Helper.CreateObjects(res, p.parentObject, p.funcObjectBuilder);

            p.targetObservableArray(res);

            if (p.funcAfterCall) {
                p.funcAfterCall();
            }

        }, p.errorCallback, false);
    },

    encodeData: function (s) {
        return encodeURIComponent((s + '').replace("'", "\""));
    }
}