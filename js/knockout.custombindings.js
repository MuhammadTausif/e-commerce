ko.bindingHandlers.executeOnEnter = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var allBindings = allBindingsAccessor();
        $(element).keypress(function (event) {
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 13) {
                allBindings.executeOnEnter.call(viewModel);
                return false;
            }
            return true;
        });
    }
};

ko.bindingHandlers.executeOnTimeout = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var allBindings = allBindingsAccessor();
        $(element).keydown(function (event) {

            if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode == 46) || (event.keyCode == 8) || (event.keyCode == 13)) {

                var timeout = allBindingsAccessor.get('timeout') || 2000;

                if (element.timer) clearTimeout(element.timer);

                element.timer = setTimeout(function () {
                    allBindings.executeOnTimeout.call(viewModel);
                    return false;
                }, timeout);
            }

            return true;
        });
    }
};

ko.bindingHandlers.numericText = {
    update: function (element, valueAccessor, allBindingsAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor()),
            precision = ko.utils.unwrapObservable(allBindingsAccessor().precision) || ko.bindingHandlers.numericText.defaultPrecision,
            formattedValue = (null != value) ? value.toFixed(precision) : null;

        ko.bindingHandlers.text.update(element, function () { return formattedValue; });
    },
    defaultPrecision: 1
};

ko.bindingHandlers.numericInput = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here

        $(element).on("keyup", function (event) {
            var value = valueAccessor();

            if (!isNaN(event.currentTarget.value)) {
                var numValue = Number(event.currentTarget.value);

                var numberMin = allBindings().numberMin;
                if (!isNaN(numberMin)) {
                    numberMin = Number(numberMin);

                    if (numValue < numberMin) {
                        value(numberMin);
                        event.currentTarget.value = numberMin;
                        return;
                    }
                }

                var numberMax = allBindings().numberMax;
                if (!isNaN(numberMax)) {
                    numberMax = Number(numberMax);

                    if (numValue > numberMax) {
                        value(numberMax);
                        event.currentTarget.value = numberMax;
                        return;
                    }
                }


                value(event.currentTarget.value);
            } else {
                event.currentTarget.value = value();
            }
        });
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called once when the binding is first applied to an element,
        // and again whenever any observables/computeds that are accessed change
        // Update the DOM element based on the supplied values here.

        var value = valueAccessor();

        $(element).val(value());
    }
};

// http://jsfiddle.net/mbest/n4z8Q/
// <input data-bind="numeric, value: Interval" />
ko.bindingHandlers.numeric = {
    init: function (element) {
        $(element).on("keydown", function (event) {
            // Allow: backspace, delete, tab, escape, and enter
            if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 ||
                // Allow: Ctrl+A
                (event.keyCode == 65 && event.ctrlKey === true) ||
                // Allow: . ,
                (event.keyCode == 188 || event.keyCode == 190 || event.keyCode == 110) ||
                // Allow: home, end, left, right
                (event.keyCode >= 35 && event.keyCode <= 39)) {
                // let it happen, don't do anything
                return;
            }
            else {
                // Ensure that it is a number and stop the keypress
                if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                    event.preventDefault();
                }
            }
        });
    }
};

ko.bindingHandlers.integer = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        $(element).on("keydown", function (event) {
            // Allow: backspace, delete, tab, escape, and enter
            if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 ||
                // Allow: Ctrl+A
                (event.keyCode == 65 && event.ctrlKey === true) ||
                // Allow: home, end, left, right
                (event.keyCode >= 35 && event.keyCode <= 39)) {
                // let it happen, don't do anything
                return;
            }
            else {
                // Ensure that it is a number and stop the keypress
                if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                    event.preventDefault();
                }
            }
        });
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = valueAccessor();
        var valueUnwrapped = ko.unwrap(value);

        if (null == valueUnwrapped) {
            valueUnwrapped = '';
        }

        if ('' != valueUnwrapped) {
            valueUnwrapped = +valueUnwrapped;


            var integerMin = allBindings().integerMin;
            if (valueUnwrapped < integerMin) {
                value(integerMin);
            }

            var integerMax = allBindings().integerMax;
            if (valueUnwrapped > integerMax) {
                value(integerMax);
            }
        }

    }
};

ko.bindingHandlers.datepicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var $el = $(element);

        //initialize datepicker with some optional options
        var options = allBindingsAccessor().datepickerOptions || {};
        $el.datepicker(options);

        //handle the field changing
        ko.utils.registerEventHandler(element, "change", function () {
            var observable = valueAccessor();
            observable($el.datepicker("getDate"));
        });

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $el.datepicker("destroy");
        });

    },
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor()),
            $el = $(element),
            current = $el.datepicker("getDate");

        if (value - current !== 0) {
            $el.datepicker("setDate", value);
        }
    }
};

ko.bindingHandlers.modal = {
    init: function (element, valueAccessor) {
        $(element).modal({
            show: false
        });

        var value = valueAccessor();
        if (typeof value === 'function') {
            $(element).on('hide.bs.modal', function () {
                value(false);
            });
        }
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).modal("destroy");
        });

    },
    update: function (element, valueAccessor) {
        var value = valueAccessor();
        if (ko.utils.unwrapObservable(value)) {
            $(element).modal('show');
        } else {
            $(element).modal('hide');
        }
    }
}

ko.bindingHandlers.noUiSliderPrice = {
    init: function (element, valueAccessor, allBindingsAccesor, viewModel, bindingContext) {
        var params = valueAccessor();

        var minStart = params.minStart() ? params.minStart() : 0;
        var maxStart = params.maxStart() ? params.maxStart() : 100;

        var minRange = params.minRange() ? params.minRange() : 0;
        var maxRange = params.maxRange() ? params.maxRange() : 100;

        noUiSlider.create(element, {
            start: [0, 100],
            step: 1,
            connect: true,
            range: {
                'min': 0,
                'max': 100
            }
        });

        element.noUiSlider.on('change', function (values, handle) {
            params.minStart(values[0]);
            params.maxStart(values[1]);
        });

    },
    update: function (element, valueAccessor, allBindingsAccesor, viewModel, bindingContext) {
        var params = valueAccessor();

        var minStart = params.minStart() ? params.minStart() : 0;
        var maxStart = params.maxStart() ? params.maxStart() : 100;

        var minRange = params.minRange() ? params.minRange() : 0;
        var maxRange = params.maxRange() ? params.maxRange() : 100;
        //element.noUiSlider.set(range);

        if (minRange === maxRange) {
            maxRange = maxRange + 1; //min and max can't been equal
        }

        if (0 <= minRange && 0 < maxRange) {
            //https://stackoverflow.com/questions/25772170/nouislider-update-range-on-demand
            element.noUiSlider.updateOptions({
                range: {
                    'min': minRange,
                    'max': maxRange
                }
            });
        }

        if (0 <= minStart && 0 <= maxStart) {
            element.noUiSlider.set([minStart, maxStart]);
        }
    }
};


ko.bindingHandlers.starRatingSVG = {
    init: function (element, valueAccessor, allBindingsAccesor, viewModel, bindingContext) {
        var params = valueAccessor();
        var starParams = {
            initialRating: params.initialRating(),
            activeColor: '#444444',
            starSize: 12,
            useGradient: false,
            readOnly: true
        };

        $(element).starRating(starParams);

    },
    update: function (element, valueAccessor, allBindingsAccesor, viewModel, bindingContext) {
        var params = valueAccessor();
        var starParams = {
            initialRating: params.initialRating(),
            activeColor: '#444444',
            starSize: 12,
            useGradient: false,
            readOnly: true
        };

        $(element).starRating(starParams);
    }
};