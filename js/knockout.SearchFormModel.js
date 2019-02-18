var SearchFormModel = function(selectedTab, siteUser) {
    var self = this;

    self.SiteUser = siteUser;

    var url_search = "api/Search.svc/";
    var url_catalog = "api/Catalog.svc/";
    var url_price_lists = "api/PriceLists.svc/";

    var state = ($.cookie("SearchFormState")) ? JSON.parse($.cookie("SearchFormState")) : {};
    var SaveState = function() {
        $.cookie("SearchFormState", JSON.stringify(state), { expires: 365 });
    };


    var defaultSelTab = state.SearchSelectTab;
    defaultSelTab = (defaultSelTab) ? defaultSelTab : "TabSearchByNumber";

    self.SelectedTab = ko.observable((selectedTab) ? selectedTab : defaultSelTab);
    self.SelectTab = function(selTab) {
        self.SelectedTab(selTab);
        state.SearchSelectTab = selTab;
        SaveState();
    };

    self.Builders = {
        CustomerDestination: function() {

        },
        CustomerDestinationDropDownBox: function() {

            var selfObj = this;

            this.ListItems = ko.observableArray([]);
            this.SelectedItem = ko.observable();
            this.Visible = ko.observable(false);
            this.Select = function(item) {
                selfObj.SelectedItem(item);
                selfObj.Visible(false);
                self.TabSearchByNumber.GoSearch();
            };

            this.GoSearch = function() {
                self.TabSearchByNumber.GoSearch();
            }

            this.VisibleToogle = function() {
                this.Visible(!this.Visible());
            };

            this.Reload = function() {
                RestHelper.GetArray({
                    url: url_search,
                    functionName: "GetCustomerDestinations",
                    params: null,
                    targetObservableArray: this.ListItems,
                    funcObjectBuilder: self.Builders.CustomerDestination,
                    parentObject: this,
                    funcAfterCall: function() {

                        var selDestinationLogo = selfObj.ListItems()[0];

                        selfObj.ListItems()
                            .forEach(function(element, index, array) {
                                if (element.DestinationLogo === state.TabSearchByNumber.DestinationLogo) {
                                    selDestinationLogo = element;
                                }
                            });

                        selfObj.SelectedItem(selDestinationLogo);
                    }
                });
            };

            this.Reload.call(this);
        },
        DeliveryDaysDropDownBox: function() {
            var selfObj = this;

            this.SelectedItem = ko.observable();
            this.ListItems = ko.observableArray([]);

            this.Reload = function() {
                //self.SiteUser
                //if (self.SiteUser.IsCustomer()) {
                    RestHelper.Call(url_price_lists,
                        "GetCustomerPrices",
                        { bitDownload: false },
                        function(res) {

                            var unique = [];

                            $.each(res,
                                function(i, el) {
                                    if ($.inArray(el.DeliveryDays, unique) === -1) unique.push(el.DeliveryDays);
                                });

                            unique.sort(function(a, b) {
                                if (a < b)
                                    return -1;
                                if (a > b)
                                    return 1;
                                return 0;
                            });

                            selfObj.ListItems.removeAll();
                            selfObj.ListItems(unique);

                            if (state.TabSearchByExcel.SelectedDeliveryDay) {
                                selfObj.SelectedItem(state.TabSearchByExcel.SelectedDeliveryDay);
                            } else {
                                selfObj.SelectedItem(14);
                            }
                        });
                //}
            };

            this.Reload.call(this);
        },
        DeliveryDaysOptionsDropDownBox: function() {
            this.ListItems = [
                { Text: resx.DeliveryDaysOptions_0, Value: "0" }, { Text: resx.DeliveryDaysOptions_1, Value: "1" }
            ];

            this.SelectedItem = ko.observable(this.ListItems[0]);

            if (state.TabSearchByExcel.SelectedDeliveryDayOption) {
                //http://stackoverflow.com/questions/7364150/find-object-by-id-in-an-array-of-javascript-objects
                // шикарный поиск :)
                var result = $.grep(this.ListItems,
                    function(e) { return e.Value == state.TabSearchByExcel.SelectedDeliveryDayOption; });

                if (0 < result.length) {
                    this.SelectedItem(result[0]);
                }
            }
        }
    };


    self.TabSearchByExcel = new (function() {

        if (!state.TabSearchByExcel) {
            state.TabSearchByExcel = {};
            SaveState();
        }

        var selfObj = this;
        this.IsBusy = ko.observable(false);
        this.ShowSubsts = ko.observable(false); // this.ShowSubsts = ko.observable(!(state.TabSearchByExcel.ShowSubsts != false));
        this.quotationSessionId = null;

        this.CustomerDestinationDropDownBox = (self.SiteUser.IsAuth())
            ? Helper.CreateObject({}, undefined, self.Builders.CustomerDestinationDropDownBox)
            : undefined;
        
        var clearFileUpload = function () {
            //Reference the FileUpload and get its Id and Name.            
            var fu = document.getElementById("FileUpload1");
            if (fu === undefined)
                return;
            var id = fu.id;
            var name = fu.name;

            //Create a new FileUpload element.
            var newFileUpload = document.createElement("INPUT");
            newFileUpload.type = "FILE";

            //Append it next to the original FileUpload.
            fu.parentNode.insertBefore(newFileUpload, fu.nextSibling);

            //Remove the original FileUpload.
            fu.parentNode.removeChild(fu);

            //Set the Id and Name to the new FileUpload.
            newFileUpload.id = id;
            newFileUpload.name = name;
        }

        this.UploadClick = function () {
            var fu = $("#FileUpload1");
            fu.change(function (ev) {
                var files = fu[0].files;
                if (files.length > 0) {
                    var formData = new FormData();
                    for (var i = 0; i < files.length; i++) {
                        formData.append(files[i].name, files[i]);
                    }

                    selfObj.quotationSessionId = Helper.GenerateGuid();

                    selfObj.IsBusy(true);
                    NProgress.start();


                    var ajaxurl = selfObj.CustomerDestinationDropDownBox
                        ? "UploadFile.ashx?k=s&qsid=" +
                        selfObj.quotationSessionId +
                        "&dl=" +
                        selfObj.CustomerDestinationDropDownBox.SelectedItem().DestinationLogo
                        : "UploadFile.ashx?k=s&qsid=" + selfObj.quotationSessionId;


                    $.ajax({
                        url: ajaxurl,
                        method: "post",
                        data: formData,
                        contentType: false,
                        processData: false,
                        success: function () {
                            selfObj.IsBusy(false);
                            NProgress.done();
                            clearFileUpload();
                            selfObj._gotoLocation();
                        },
                        error: function (err) {
                            selfObj.IsBusy(false);
                            NProgress.done();
                            clearFileUpload();
                            alert(err.statusText);
                        }
                    });
                   }
            });

            fu.click();
        };

        this.Refresh = function(obj, event) {
            //http://stackoverflow.com/questions/11078016/change-event-on-select-with-knockout-binding-how-can-i-know-if-its-a-real-chang
            if (event.originalEvent) {
                state.TabSearchByExcel.SelectedDeliveryDay = selfObj.DeliveryDaysDropDownBox.SelectedItem();
                state.TabSearchByExcel
                    .SelectedDeliveryDayOption = selfObj.DeliveryDaysOptionsDropDownBox.SelectedItem().Value;
                state.TabSearchByExcel.ShowSubsts = this.ShowSubsts();
                SaveState();
                selfObj._gotoLocation();
            }

            return true;
        };

        this._gotoLocation = function () {
            if (selfObj.quotationSessionId) {
                window.location = "Search.aspx#ShowQuotation" +
                    "/" +
                    selfObj.DeliveryDaysDropDownBox.SelectedItem() +
                    "/" +
                    selfObj.DeliveryDaysOptionsDropDownBox.SelectedItem().Value +
                    "/" +
                    selfObj.quotationSessionId +
                    "/" +
                    selfObj.ShowSubsts() +
                    "/" +
                    Date.now();
            }
        };
        this.DeliveryDaysDropDownBox = Helper.CreateObject({}, undefined, self.Builders.DeliveryDaysDropDownBox);
        this.DeliveryDaysOptionsDropDownBox = Helper
            .CreateObject({}, undefined, self.Builders.DeliveryDaysOptionsDropDownBox);
    })();

    self.TabSearchByNumber = new (function () {

        if (!state.TabSearchByNumber) {
            state.TabSearchByNumber = {};
            SaveState();
        }

        this.SearchProceed = ko.observable(false);

        this.DetailNum = ko.observable((state.TabSearchByNumber.DetailNum) ? state.TabSearchByNumber.DetailNum : "");
        this.ShowSubsts = ko.observable(state.TabSearchByNumber.ShowSubsts != false);

        this.CustomerDestinationDropDownBox = (self.SiteUser.IsAuth())
            ? Helper.CreateObject({}, undefined, self.Builders.CustomerDestinationDropDownBox)
            : undefined;

        this.GoSearch = function () {

            if (true === this.SearchProceed()) {
                return;
            }

            this.SearchProceed(true);

            state.TabSearchByNumber.DetailNum = this.DetailNum();
            state.TabSearchByNumber.ShowSubsts = this.ShowSubsts();

            var destinationLogo = "";

            if (this.CustomerDestinationDropDownBox) {
                state.TabSearchByNumber.DestinationLogo = this.CustomerDestinationDropDownBox.SelectedItem()
                    .DestinationLogo;
                destinationLogo = "/" +
                    this.CustomerDestinationDropDownBox.SelectedItem().DestinationLogo +
                    "/" +
                    Date.now();
            }

            SaveState();

            if (self.SiteUser.IsAuth()) {
                window.location = "Search.aspx#" + this.DetailNum() + "/" + this.ShowSubsts() + destinationLogo;
            } else {
                window.location = "Search.aspx?n=" + this.DetailNum();
            }
            

            return true;
        };


        //(function () {
        //    this.CustomerDestinationDropDownBox.Reload();
        //})();
    })();

    self.TabSearchByVIN = new (function() {
        if (!state.TabSearchByVIN) {
            state.TabSearchByVIN = {};
            SaveState();
        }

        this.VIN = ko.observable(state.TabSearchByVIN.VIN);

        this.GoSearch = function() {
            state.TabSearchByVIN.VIN = this.VIN();
            SaveState();

            window.location = "Vehicles.aspx?ft=findByVIN&c=&ssd=&vin=" + this.VIN();
            return true;
        };
    })();

    self.TabSearchByModel = new (function() {
        if (!state.TabSearchByModel) {
            state.TabSearchByModel = {};
            SaveState();
        }

        this.CatalogsList = ko.observableArray([]);

        this.SelectedCatalogCode = ko.observable();

        this.ReloadCatalogsList = function() {
            RestHelper.Call(url_catalog,
                "CatalogsList",
                null,
                function(res) {
                    this.CatalogsList.removeAll();
                    this.CatalogsList(res);
                    this.SelectedCatalogCode(state.TabSearchByModel.CatalogCode);

                },
                undefined,
                true,
                this);
        };

        this.GoSearch = function(obj, event) {
            //http://emexdirect.com/Catalog.aspx?c=RFiat112013&ssd=


            if (this.SelectedCatalogCode()) {
                if (event.originalEvent) {
                    state.TabSearchByModel.CatalogCode = this.SelectedCatalogCode();
                    SaveState();
                    window.location = "CatalogParamSearch.aspx#" + this.SelectedCatalogCode() + "/" + Date.now();
                }
            }
        };

        this.ReloadCatalogsList();
    })();


    self._init = function() {
        //self.TabSearchByNumber
    }();
}