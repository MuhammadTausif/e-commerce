var UserViewModel = function () {
    var url = 'api/User.svc/';
    var selfObj = this;

    selfObj.Roles = ko.observableArray([]);
    selfObj.IsSelectedSubCustomer = ko.observable();
    selfObj.CustomerDiscount = ko.observable();
    selfObj.DefaultMaxAGREE = ko.observable();
    selfObj.IsAuth = ko.observable();

    selfObj.ReloadRoles = function() {
        RestHelper.CallSync(url, 'GetRoles', null, function (res) {
            selfObj.Roles.removeAll();
            selfObj.Roles(res);
        });
    };

    selfObj.Reload = function() {
        RestHelper.CallSync(url, 'GetCurrentUser', null, function (res) {
            selfObj.Roles.removeAll();
            selfObj.Roles(res.Roles);

            selfObj.IsSelectedSubCustomer(res.IsSelectedSubCustomer);
            selfObj.CustomerDiscount(res.CustomerDiscount);
            selfObj.DefaultMaxAGREE(res.DefaultMaxAGREE);
            selfObj.IsAuth(res.IsAuth);
        });
    }

    selfObj.IsCustomer = ko.computed(function () {
        return (selfObj.Roles().indexOf("customer") > -1);
    }, this);

    selfObj.IsSubCustomer = ko.computed(function () {
        return (selfObj.Roles().indexOf("subcustomer") > -1);
    }, this);


    selfObj._init = function() {
        selfObj.Reload();
    }();
}