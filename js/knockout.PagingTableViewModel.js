var PagingTableViewModel = function(init) {
    var selfObj = this;

    selfObj.SortBy = ko.observable('');
    // Sort by price high to low
    selfObj.SortDirection = true;

    selfObj.RawData = [];
    selfObj.Data = [];
    selfObj.PageSize = ((init == undefined) || (init.PageSize == undefined)) ? 100 : init.PageSize;
    selfObj.PageIndex = ko.observable(0);

    selfObj.PageNum = ko.computed({
        read: function() {
            return selfObj.PageIndex() + 1;
        },
        write: function (newVal) {

            if (newVal > selfObj.TotalPages()) {
                newVal = selfObj.TotalPages();
            }
            else if (1 > newVal) {
                newVal = 1;
            }

            selfObj.PageIndex(newVal - 1);
        }
    });

    selfObj.TotalPages = ko.observable(0);

    selfObj.PagingSize = ((init == undefined) || (init.PagingSize == undefined)) ? 5 : init.PagingSize;

    selfObj.Filter = ((init == undefined) || (init.Filter == undefined)) ? null : init.Filter;

    selfObj.ApplyFilter = function () {
        if (null !== selfObj.Filter) {
            selfObj.Data = selfObj.RawData.filter(selfObj.Filter);
        } else {
            selfObj.Data = selfObj.RawData;
        }

        selfObj.TotalPages(Math.ceil(selfObj.Data.length / selfObj.PageSize));
        selfObj.SetPageIndex(1);
    };

    selfObj.Filters = {};

    selfObj.ApplyFilters = function () {

        selfObj.Data = selfObj.RawData.filter(function (el) {

            var ok = true;

            for (var propName in selfObj.Filters) {
                var propVal = selfObj.Filters[propName].toLowerCase();

                var elVal = ('' + ko.utils.unwrapObservable(el[propName])).toLowerCase();

                ok = ok && (-1 < elVal.indexOf(propVal.toLowerCase()));
            }

            return ok;
        });

        selfObj.TotalPages(Math.ceil(selfObj.Data.length / selfObj.PageSize));
        selfObj.SetPageIndex(1);
    };

    selfObj.PageData = ko.observableArray([]);

    selfObj.Pages = function () {

        var iFirst = selfObj.PageIndex() - Math.floor(selfObj.PagingSize / 2);
        var iLast = selfObj.PageIndex() + Math.floor(selfObj.PagingSize / 2);

        if (iLast > selfObj.TotalPages()) {
            iFirst = iFirst - (iLast - selfObj.TotalPages());
            iLast = selfObj.TotalPages();
        }

        if (iFirst < 1) {
            iLast = iLast + (1 - iFirst);
            iFirst = 1;
        }

        if (iLast > selfObj.TotalPages()) {
            iLast = selfObj.TotalPages();
        }

        var pages = [];
        for (var i = iFirst; i <= iLast; i++) {
            pages.push(i);
        }

        return pages;
    };

    selfObj.SetPageIndex = function (pageNum) {
        selfObj.PageIndex(pageNum - 1);

        selfObj.RefreshCurrentPage();
    };

    selfObj.SetPageSize = function(newPageSize) {
        selfObj.PageSize = newPageSize;
        selfObj.SetPageIndex(1);
    }

    selfObj.RefreshCurrentPage = function() {
        var iFirst = selfObj.PageIndex() * selfObj.PageSize;
        var iLast = ((selfObj.PageIndex() + 1) * selfObj.PageSize);

        selfObj.PageData(selfObj.Data.slice(iFirst, iLast));
    };

    selfObj.ReplaceItem = function(oldItem, newItem) {
        var index = selfObj.Data.indexOf(oldItem);

        if (0 > index) return;

        selfObj.Data[index] = newItem;

        return selfObj.Data[index];
    };

    selfObj.ReloadItem = function (oldItem, newItem) {
        var newItemRef = selfObj.ReplaceItem(oldItem, newItem);
        selfObj.RefreshCurrentPage();

        return newItemRef;
    };

    selfObj.AddItem = function(newItem) {
        selfObj.RawData.push(newItem);
        selfObj.ApplyFilter();
    }

    selfObj.ReloadData = function (data) {
        selfObj.RawData = data;
        selfObj.ApplyFilter();
    };

    selfObj.ReloadDataFromService = function (p) {
        if (p.funcBeforeCall) {
            p.funcBeforeCall();
        }

        RestHelper.Call(p.url, p.functionName, p.params, function (res) {

            Helper.CreateObjects(res, p.parentObject, p.funcObjectBuilder);

            selfObj.ReloadData(res);

            if (p.funcAfterCall) {
                p.funcAfterCall();
            }

        }, p.errorCallback, false);
    };

    selfObj.SortData = function (colName) {
        selfObj.SortBy(colName);
        selfObj.SortDirection = !selfObj.SortDirection;
        selfObj.Data.sort(selfObj._sort_by(selfObj.SortBy(), selfObj.SortDirection));

        selfObj.RefreshCurrentPage();
    };

    selfObj._sort_by = function (field, reverse, primer) {

        var key = primer ?
            function (x) { return primer(x[field]) } :
            function (x) { return x[field] };

        reverse = !reverse ? 1 : -1;

        return function (a, b) {
            return a = ko.utils.unwrapObservable(key(a)), b = ko.utils.unwrapObservable(key(b)), reverse * ((a > b) - (b > a));
        }
    }

    // http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects-by-numeric-property
    //  Sort by price high to low
    // homes.sort(sort_by('price', true, parseInt));

    // Sort by city, case-insensitive, A-Z
    // homes.sort(sort_by('city', false, function (a) { return a.toUpperCase() }));
};

ko.bindingHandlers.textFilter = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var filterName = valueAccessor();

        $(element).on("keyup", function (event) {
            var keyCode = (event.which ? event.which : event.keyCode);

            if (keyCode === 13) {
                viewModel.ApplyFilters();
                return;
            }

            viewModel.Filters[filterName] = event.currentTarget.value;
        });
        
        viewModel.Filters[filterName] = "";
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
    }
};