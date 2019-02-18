var ServerPagingTableViewModel = function(init) {
    var selfObj = this;

    selfObj.SortBy = ko.observable('');
    // Sort by price high to low
    selfObj.SortDirection = true;

    selfObj.SortStr =  function() {
            if ('' == selfObj.SortBy()) {
                return null;
            }

            if (selfObj.SortDirection) {
                return selfObj.SortBy() + ' desc';
            }

            return selfObj.SortBy() + ' asc';
    };

    //selfObj.Data = [];
    selfObj.PageSize = ((init == undefined) || (init.PageSize == undefined)) ? 100 : init.PageSize;
    selfObj.PageIndex = ko.observable(null);

    selfObj.PageNum = ko.computed({
        read: function () {
            if (null == selfObj.PageIndex()) {
                return 1;
            }

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

    selfObj.PagingSize = ((init == undefined) || (init.PagingSize == undefined)) ? 5 : init.PagingSize;;

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

    selfObj.SetPageNum = function (pageNum) {
        selfObj.PageNum(pageNum);

        selfObj.RefreshCurrentPage();
    };

    selfObj.SetPageSize = function() {
        selfObj.SetPageNum(1);

        selfObj.RefreshCurrentPage();
    }

    selfObj.RefreshCurrentPage = ((init == undefined) || (init.RefreshCurrentPage == undefined)) ? undefined : init.RefreshCurrentPage;

    selfObj.ReplaceItem = function(oldItem, newItem) {
        var index = selfObj.PageData.indexOf(oldItem);

        if (0 > index) return;

        selfObj.PageData[index] = newItem;
    };

    selfObj.SortData = function (colName) {
        selfObj.SortBy(colName);
        selfObj.SortDirection = !selfObj.SortDirection;

        selfObj.RefreshCurrentPage();
    };
};