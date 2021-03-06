(function(moment) {
    'use strict';
    var moduleName = "ngMaterialDatePicker";

    var VIEW_STATES = {
        DATE: 0,
        HOUR: 1,
        MINUTE: 2
    };

    var css = function(el, name) {
        if ('jQuery' in window) {
            return jQuery(el).css(name);
        } else {
            el = angular.element(el);
            return ('getComputedStyle' in window) ? window.getComputedStyle(el[0])[name] : el.css(name);
        }
    };
    moment.locale('en');
    var template = '<md-dialog class="dtp" layout="column" style="width:300px">\n<md-dialog-content class="dtp-content">\n<div class="dtp-date-view">\n<header class="dtp-header">\n<div class="dtp-actual-day" ng-show="picker.dateMode">{{picker.currentDate.format("dddd")}}</div>\n<div class="dtp-actual-day" ng-show="!picker.dateMode">&nbsp;</div>\n<div class="dtp-close text-right"> <a mdc-dtp-noclick ng-click="picker.hide()">&times;</a> </div>\n</header>\n<div layout="row">\n<div class="dtp-date" ng-show="picker.params.date" flex ng-click="picker.openDate()" ng-class="{selected: picker.isDateOpen === true}">\n<div layout="column">\n<div class="dtp-actual-month">{{picker.currentDate.format("MMM") | uppercase}}</div>\n</div>\n<div class="dtp-actual-num">\n<span>{{picker.currentDate.format("DD")}}</span>\n</div>\n<div layout="column">\n<div class="dtp-actual-year">{{picker.currentDate.format("YYYY")}}</div>\n</div>\n</div>\n<div class="dtp-time" ng-show="picker.params.time && !picker.params.date" flex>\n<div class="dtp-actual-maxtime" ng-class="">\n<a ng-class="{selected: picker.isHourOpen === true}" class="dtp-actual-hour" ng-click="picker.openHour()">{{picker.currentNearest5Minute().format("HH")}}</a>:<a ng-class="{selected: picker.isMinuteOpen === true}" class="dtp-actual-minute" ng-click="picker.openMinute()">{{picker.currentNearest5Minute().format("mm")}}</a>\n</div>\n</div>\n<div class="dtp-date-time" ng-show="picker.params.time && picker.params.date" flex>\n<div class="dtp-actual-maxtime">\n<div layout="column"><a ng-class="{selected: picker.isHourOpen === true}" class="dtp-actual-hour" ng-click="picker.openHour()">{{picker.currentNearest5Minute().format("HH")}} h</a></div>\n<div layout="column"><a ng-class="{selected: picker.isMinuteOpen === true}" class="dtp-actual-minute" ng-click="picker.openMinute()">{{picker.currentNearest5Minute().format("mm")}} min</a></div>\n</div>\n</div>\n</div>\n<div class="dtp-picker">\n<mdc-datetime-picker-calendar date="picker.currentDate" picker="picker" class="dtp-picker-calendar" ng-show="picker.currentView === picker.VIEWS.DATE"></mdc-datetime-picker-calendar>\n<div class="dtp-picker-datetime" ng-show="picker.currentView !== picker.VIEWS.DATE">\n<div class="dtp-actual-meridien">\n<div class="left p20" ng-hide="picker.params.shortTime"> <a mdc-dtp-noclick class="dtp-meridien-am" ng-class="{selected: picker.meridien == \'AM\'}" ng-click="picker.selectAM()">AM</a> </div>\n<div class="right p20" ng-hide="picker.params.shortTime"> <a href="#" mdc-dtp-noclick class="dtp-meridien-pm" ng-class="{selected: picker.meridien == \'PM\'}" ng-click="picker.selectPM()">PM</a> </div>\n<div class="clearfix"></div>\n</div>\n<mdc-datetime-picker-clock mode="hours" ng-if="picker.currentView === picker.VIEWS.HOUR"></mdc-datetime-picker-clock>\n<mdc-datetime-picker-clock mode="minutes" ng-if="picker.currentView === picker.VIEWS.MINUTE"></mdc-datetime-picker-clock>\n</div>\n</div>\n</div>\n</md-dialog-content>\n<md-dialog-actions class="dtp-buttons">\n<md-button class="dtp-btn-cancel md-button" ng-hide="picker.currentView == picker.VIEWS.DATE || (!picker.params.date && picker.currentView != picker.VIEWS.MINUTE)" ng-click="picker.back()"> {{picker.params.backText}}</md-button>\n<md-button class="dtp-btn-ok md-button" ng-click="picker.ok()"> <div ng-hide="picker.currentView == picker.VIEWS.MINUTE">{{picker.params.nextText}}</div><div ng-hide="picker.currentView != picker.VIEWS.MINUTE">{{picker.params.okText}}</div></md-button>\n</md-dialog-actions>\n</md-dialog>';
    angular.module(moduleName, ['ngMaterial'])
        .directive('mdcDatetimePicker', ['$mdDialog',
            function($mdDialog) {

                return {
                    restrict: 'A',
                    require: 'ngModel',
                    scope: {
                        currentDate: '=ngModel',
                        time: '=',
                        date: '=',
                        minDate: '=',
                        maxDate: '=',
                        shortTime: '=',
                        format: '@',
                        cancelText: '@',
                        backText: '@',
                        nextText: '@',
                        okText: '@',
                        lang: '@',
                        inputFormat: '@'
                    },
                    link: function(scope, element, attrs, ngModel) {
                        var isOn = false;
                        if (!scope.format) {
                            if (scope.date && scope.time) {
                                scope.format = 'YYYY-MM-DD HH:mm:ss';
                            } else if (scope.date) {
                                scope.format = 'YYYY-MM-DD';
                            } else {
                                scope.format = 'HH:mm';
                            }
                        }
                        scope.isHourOpen = false;
                        scope.isMinuteOpen = false;
                        scope.isDateOpen = true;

                        if (ngModel) {
                            ngModel.$formatters.push(function(value) {
                                var m = moment(value);
                                return m.isValid() ? m.format(scope.format) : '';
                            });
                        }

                        element.attr('readonly', '');
                        //@TODO custom event to trigger input
                        element.on('focus', function(e) {
                            e.preventDefault();
                            element.blur();
                            if (isOn) {
                                return;
                            }
                            isOn = true;
                            var options = {};
                            for (var i in attrs) {
                                if (scope.hasOwnProperty(i) && !angular.isUndefined(scope[i])) {
                                    options[i] = scope[i];
                                }
                            }
                            if (angular.isString(scope.currentDate) && scope.currentDate !== '') {
                                if (scope.inputFormat) {
                                    scope.currentDate = moment(scope.currentDate, scope.inputFormat).toDate();
                                } else {
                                    scope.currentDate = moment(scope.currentDate).toDate();
                                }
                            }
                            scope.oldDate = scope.currentDate;

                            if (!scope.currentDate) {
                                scope.currentDate = new Date();
                            }
                            options.currentDate = scope.currentDate;
                            var locals = {
                                options: options
                            };
                            $mdDialog.show({
                                    template: template,
                                    controller: PluginController,
                                    controllerAs: 'picker',
                                    locals: locals,
                                    openFrom: element,
                                    parent: angular.element(document.body),
                                    bindToController: true,
                                    disableParentScroll: false
                                })
                                .then(function(v) {
                                    scope.currentDate = v ? v._d : v;
                                    isOn = false;
                                }, function() {
                                    scope.currentDate = null;
                                    if (scope.oldDate) {
                                        scope.currentDate = scope.oldDate;
                                    }
                                    isOn = false;
                                });
                        });
                    }
                };
            }
        ]);

    var PluginController = function($scope, $mdDialog) {
        this.currentView = VIEW_STATES.DATE;
        this._dialog = $mdDialog;

        this.minDate;
        this.maxDate;

        this._attachedEvents = [];
        this.VIEWS = VIEW_STATES;

        this.params = {
            date: true,
            time: true,
            format: 'YYYY-MM-DD',
            inputFormat: null,
            minDate: null,
            maxDate: null,
            currentDate: null,
            lang: 'en',
            weekStart: 0,
            shortTime: false,
            cancelText: 'Cancel',
            okText: 'OK',
            nextText: 'Next',
            backText: 'Back'
        };

        this.meridien = 'AM';
        this.params = angular.extend(this.params, this.options);
        this.init();
    };
    PluginController.$inject = ['$scope', '$mdDialog'];
    PluginController.prototype = {
        init: function() {
            this.timeMode = this.params.time && !this.params.date;
            this.dateMode = this.params.date;
            this.initDates();
            this.start();
        },
        currentNearest5Minute: function() {
            var date = this.currentDate || moment();
            var minutes = (5 * Math.round(date.minute() / 5));
            if (minutes >= 60) {
                minutes = 55; //always push down
            }
            return moment(date).minutes(minutes);
        },
        initDates: function() {
            var that = this;
            var _dateParam = function(input, fallback) {
                var ret = null;
                if (angular.isDefined(input) && input !== null && input !== '') {
                    if (angular.isString(input)) {
                        if (typeof(that.params.inputFormat) !== 'undefined' && that.params.inputFormat !== null) {
                            ret = moment(input, that.params.inputFormat).locale(that.params.lang);
                        } else {
                            ret = moment(input).locale(that.params.lang);
                        }
                    } else {
                        if (angular.isDate(input)) {
                            var x = input.getTime();
                            ret = moment(x, "x").locale(that.params.lang);
                        } else if (input._isAMomentObject) {
                            ret = input;
                        }
                    }
                } else {
                    ret = fallback;
                }
                return ret;
            };

            this.currentDate = _dateParam(this.params.currentDate, moment());
            this.minDate = _dateParam(this.params.minDate);
            this.maxDate = _dateParam(this.params.maxDate);
            this.selectDate(this.currentDate);
        },
        initDate: function() {
            this.currentView = VIEW_STATES.DATE;
            this.isDateOpen = true;
            this.isHourOpen = false;
            this.isMinuteOpen = false;
        },
        initHours: function() {
            this.currentView = VIEW_STATES.HOUR;
            this.isDateOpen = false;
            this.isHourOpen = true;
            this.isMinuteOpen = false;
        },
        initMinutes: function() {
            this.currentView = VIEW_STATES.MINUTE;
            this.isDateOpen = false;
            this.isHourOpen = false;
            this.isMinuteOpen = true;
        },
        isAfterMinDate: function(date, checkHour, checkMinute) {
            var _return = true;

            if (typeof(this.minDate) !== 'undefined' && this.minDate !== null) {
                var _minDate = moment(this.minDate);
                var _date = moment(date);

                if (!checkHour && !checkMinute) {
                    _minDate.hour(0);
                    _minDate.minute(0);

                    _date.hour(0);
                    _date.minute(0);
                }

                _minDate.second(0);
                _date.second(0);
                _minDate.millisecond(0);
                _date.millisecond(0);

                if (!checkMinute) {
                    _date.minute(0);
                    _minDate.minute(0);

                    _return = (parseInt(_date.format("X")) >= parseInt(_minDate.format("X")));
                } else {
                    _return = (parseInt(_date.format("X")) >= parseInt(_minDate.format("X")));
                }
            }

            return _return;
        },
        isBeforeMaxDate: function(date, checkTime, checkMinute) {
            var _return = true;

            if (typeof(this.maxDate) !== 'undefined' && this.maxDate !== null) {
                var _maxDate = moment(this.maxDate);
                var _date = moment(date);

                if (!checkTime && !checkMinute) {
                    _maxDate.hour(0);
                    _maxDate.minute(0);

                    _date.hour(0);
                    _date.minute(0);
                }

                _maxDate.second(0);
                _date.second(0);
                _maxDate.millisecond(0);
                _date.millisecond(0);

                if (!checkMinute) {
                    _date.minute(0);
                    _maxDate.minute(0);

                    _return = (parseInt(_date.format("X")) <= parseInt(_maxDate.format("X")));
                } else {
                    _return = (parseInt(_date.format("X")) <= parseInt(_maxDate.format("X")));
                }
            }

            return _return;
        },
        selectDate: function(date) {
            if (date) {
                this.currentDate = moment(date);
                if (!this.isAfterMinDate(this.currentDate)) {
                    this.currentDate = moment(this.minDate);
                }

                if (!this.isBeforeMaxDate(this.currentDate)) {
                    this.currentDate = moment(this.maxDate);
                }
                this.currentDate.locale(this.params.lang);
                this.calendarStart = moment(this.currentDate);
                this.meridien = this.currentDate.hour() >= 12 ? 'PM' : 'AM';
            }
        },
        setName: function() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 5; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            return text;
        },
        isPM: function() {
            return this.meridien === 'PM';
        },
        isPreviousMonthVisible: function() {
            return this.calendarStart && this.isAfterMinDate(moment(this.calendarStart).startOf('month'), false, false);
        },
        isNextMonthVisible: function() {
            return this.calendarStart && this.isBeforeMaxDate(moment(this.calendarStart).endOf('month'), false, false);
        },
        isPreviousYearVisible: function() {
            return this.calendarStart && this.isAfterMinDate(moment(this.calendarStart).startOf('year'), false, false);
        },
        isNextYearVisible: function() {
            return this.calendarStart && this.isBeforeMaxDate(moment(this.calendarStart).endOf('year'), false, false);
        },
        isHourAvailable: function(hour) {
            var _date = moment(this.currentDate);
            _date.hour(this.convertHours(hour)).minute(0).second(0);
            return this.isAfterMinDate(_date, true, false) && this.isBeforeMaxDate(_date, true, false);
        },
        isMinuteAvailable: function(minute) {
            var _date = moment(this.currentDate);
            _date.minute(minute).second(0);
            return this.isAfterMinDate(_date, true, true) && this.isBeforeMaxDate(_date, true, true);
        },
        start: function() {
            this.currentView = VIEW_STATES.DATE;
            //this.initDates();
            if (this.params.date) {
                this.initDate();
            } else {
                if (this.params.time) {
                    this.initHours();
                }
            }
        },
        ok: function() {
            switch (this.currentView) {
                case VIEW_STATES.DATE:
                    if (this.params.time === true) {
                        this.initHours();
                    } else {
                        this.hide(true);
                    }
                    break;
                case VIEW_STATES.HOUR:
                    this.initMinutes();
                    break;
                case VIEW_STATES.MINUTE:
                    this.hide(true);
                    break;
            }
        },
        back: function() {
            if (this.params.time) {
                switch (this.currentView) {
                    case VIEW_STATES.DATE:
                        this.hide();
                        break;
                    case VIEW_STATES.HOUR:
                        if (this.params.date) {
                            this.initDate();
                        } else {
                            this.hide();
                        }
                        break;
                    case VIEW_STATES.MINUTE:
                        this.initHours();
                        break;
                }
            } else {
                this.hide();
            }
        },
        cancel: function() {
            this.hide();
        },
        selectMonthBefore: function() {
            this.calendarStart.subtract(1, 'months');
        },
        selectMonthAfter: function() {
            this.calendarStart.add(1, 'months');
        },
        selectYearBefore: function() {
            this.calendarStart.subtract(1, 'years');
        },
        selectYearAfter: function() {
            this.calendarStart.add(1, 'years');
        },
        selectAM: function() {
            if (this.currentDate.hour() >= 12) {
                this.selectDate(this.currentDate.subtract(12, 'hours'));
            }
        },
        selectPM: function() {
            if (this.currentDate.hour() < 12) {
                this.selectDate(this.currentDate.add(12, 'hours'));
            }
        },
        convertHours: function(h) {
            var _return = h;
            if ((h < 12) && this.isPM())
                _return += 12;

            return _return;
        },
        hide: function(okBtn) {
            if (okBtn) {
                this._dialog.hide(this.currentDate);
            } else {
                this._dialog.cancel();
            }
        },
        openHour: function() {
            this.initHours();
        },
        openMinute: function() {
            this.initMinutes();
        },
        openDate: function() {
            this.initDate();
        }
    };


    angular.module(moduleName)
        .directive('mdcDatetimePickerCalendar', [
            function() {

                var startDate = moment(),
                    YEAR_MIN = parseInt(startDate.format('YYYY')) - 30,
                    YEAR_MAX = parseInt(startDate.format('YYYY')) + 70,
                    MONTHS_IN_ALL = (YEAR_MAX - YEAR_MIN + 1) * 12,
                    ITEM_HEIGHT = 240,
                    MONTHS = [];
                for (var i = 0; i < MONTHS_IN_ALL; i++) {
                    MONTHS.push(i);
                }

                var currentMonthIndex = function(date) {
                    var year = date.year();
                    var month = date.month();
                    return ((year - YEAR_MIN) * 12) + month - 1;
                };

                return {
                    restrict: 'E',
                    scope: {
                        picker: '=',
                        date: '='
                    },
                    bindToController: true,
                    controllerAs: 'cal',
                    controller: ['$scope',
                        function($scope) {
                            var calendar = this,
                                picker = this.picker,
                                days = [];

                            for (var i = picker.params.weekStart; days.length < 7; i++) {
                                if (i > 6) {
                                    i = 0;
                                }
                                days.push(i.toString());
                            }

                            calendar.week = days;
                            if (!picker.maxDate && !picker.minDate) {
                                calendar.months = MONTHS;
                            } else {
                                var low = picker.minDate ? currentMonthIndex(picker.minDate) : 0;
                                var high = picker.maxDate ? (currentMonthIndex(picker.maxDate) + 1) : MONTHS_IN_ALL;
                                calendar.months = MONTHS.slice(low, high);
                            }


                            calendar.getItemAtIndex = function(index) {
                                var month = ((index + 1) % 12) || 12;
                                var year = YEAR_MIN + Math.floor(index / 12);
                                var monthObj = moment(picker.currentDate)
                                    .year(year)
                                    .month(month);
                                return generateMonthCalendar(monthObj);
                            };

                            calendar.topIndex = currentMonthIndex(picker.currentDate) - calendar.months[0];
                            var generateMonthCalendar = function(date) {
                                var month = {};
                                if (date !== null) {
                                    month.name = date.format('MMMM YYYY');
                                    var startOfMonth = moment(date).locale(picker.params.lang).startOf('month')
                                        .hour(date.hour())
                                        .minute(date.minute());
                                    var iNumDay = startOfMonth.format('d');
                                    month.days = [];
                                    for (var i = startOfMonth.date(); i <= startOfMonth.daysInMonth(); i++) {
                                        if (i === startOfMonth.date()) {
                                            var iWeek = calendar.week.indexOf(iNumDay.toString());
                                            if (iWeek > 0) {
                                                for (var x = 0; x < iWeek; x++) {
                                                    month.days.push(0);
                                                }
                                            }
                                        }
                                        month.days.push(moment(startOfMonth).locale(picker.params.lang).date(i));
                                    }

                                    var daysInAWeek = 7,
                                        daysTmp = [],
                                        slices = Math.ceil(month.days.length / daysInAWeek);
                                    for (var j = 0; j < slices; j++) {
                                        daysTmp.push(month.days.slice(j * daysInAWeek, (j + 1) * daysInAWeek));
                                    }
                                    month.days = daysTmp;
                                    return month;
                                }

                            };

                            calendar.toDay = function(i) {
                                return moment(parseInt(i), "d")
                                    .locale(picker.params.lang)
                                    .format("dd")
                                    .substring(0, 1);
                            };

                            calendar.isInRange = function(date) {
                                return picker.isAfterMinDate(moment(date), false, false) && picker.isBeforeMaxDate(moment(date), false, false);
                            };

                            calendar.selectDate = function(date) {
                                if (date) {
                                    if (calendar.isSelectedDay(date)) {
                                        return picker.ok();
                                    }
                                    picker.selectDate(moment(date).hour(calendar.date.hour()).minute(calendar.date.minute()));
                                }
                            };

                            calendar.isSelectedDay = function(m) {
                                return m && calendar.date.date() === m.date() && calendar.date.month() === m.month() && calendar.date.year() === m.year();
                            };

                        }
                    ],
                    template: '<md-virtual-repeat-container class="months">' +
                        '<div md-virtual-repeat="idx in cal.months" md-start-index="cal.topIndex" md-item-size="' + ITEM_HEIGHT + '">' +
                        '     <div mdc-datetime-picker-calendar-month idx="idx"></div>' +
                        '</div>' +
                        '</md-virtual-repeat-container>'
                };
            }
        ])
        .directive('mdcDatetimePickerCalendarMonth', ['$compile',
            function($compile) {
                var buildCalendarContent = function(element, scope) {
                    var tbody = angular.element(element[0].querySelector('tbody'));
                    var calendar = scope.cal,
                        month = scope.month;
                    tbody.html('');
                    month.days.forEach(function(weekDays, i) {
                        var tr = angular.element('<tr></tr>');
                        weekDays.forEach(function(weekDay, j) {
                            var td = angular.element('<td> </td>');
                            if (weekDay) {
                                var aOrSpan;
                                if (calendar.isInRange(weekDay)) {
                                    //build a
                                    var scopeRef = 'month["days"][' + i + '][' + j + ']';
                                    aOrSpan = angular.element("<a href='#' mdc-dtp-noclick></a>")
                                        .attr('ng-class', '{selected: cal.isSelectedDay(' + scopeRef + ')}')
                                        .attr('ng-click', 'cal.selectDate(' + scopeRef + ')');
                                } else {
                                    aOrSpan = angular.element('<span></span>')
                                }
                                aOrSpan
                                    .addClass('dtp-select-day')
                                    .html(weekDay.format('D'));
                                td.append(aOrSpan);
                            }
                            tr.append(td);
                        });
                        tbody.append(tr);
                    });
                    $compile(tbody)(scope);
                };

                return {
                    scope: {
                        idx: '='
                    },
                    require: '^mdcDatetimePickerCalendar',
                    restrict: 'AE',
                    template: '<div class="dtp-picker-month">{{month.name}}</div>' + '<table class="table dtp-picker-days">' + '    <thead>' + '    <tr>' + '        <th ng-repeat="day in cal.week">{{cal.toDay(day)}}</th>' + '    </tr>' + '    </thead>' + '    <tbody>' + '    </tbody>' + '</table>',
                    link: function(scope, element, attrs, calendar) {
                        scope.cal = calendar;
                        scope.month = calendar.getItemAtIndex(parseInt(scope.idx));
                        buildCalendarContent(element, scope);;
                        scope.$watch(function() {
                            return scope.idx;
                        }, function(idx, oldIdx) {
                            if (idx != oldIdx) {
                                scope.month = calendar.getItemAtIndex(parseInt(scope.idx));
                                buildCalendarContent(element, scope);
                            }
                        });
                    }
                };
            }
        ]);

    angular.module(moduleName)
        .directive('mdcDtpNoclick', function() {
            return {
                link: function(scope, el) {
                    el.on('click', function(e) {
                        e.preventDefault();
                    });
                }
            };
        });
    angular.module(moduleName)
        .directive('mdcDatetimePickerClock', [
            function() {

                var template = '<div class="dtp-picker-clock"><span ng-if="!points || points.length < 1">&nbsp;</span>' + '<div ng-repeat="point in points" class="dtp-picker-time" style="margin-left: {{point.left}}px; margin-top: {{point.top}}px;">' + '   <a href="#" mdc-dtp-noclick ng-class="{selected: point.value===currentValue}" class="dtp-select-hour" ng-click="setTime(point.value)" ng-if="pointAvailable(point)">{{point.display}}</a>' + '   <a href="#" mdc-dtp-noclick class="disabled dtp-select-hour" ng-if="!pointAvailable(point)">{{point.display}}</a>' + '</div>' + '<div class="dtp-hand dtp-hour-hand"></div>' + '<div class="dtp-hand dtp-minute-hand"></div>' + '<div class="dtp-clock-center"></div>' + '</div>';

                return {
                    restrict: 'E',
                    template: template,
                    link: function(scope, element, attrs) {
                        var minuteMode = attrs.mode === 'minutes';
                        var picker = scope.picker;
                        //banking on the fact that there will only be one at a time
                        var componentRoot = document.querySelector('md-dialog.dtp');
                        var exec = function() {
                            var clock = angular.element(element[0].querySelector('.dtp-picker-clock')),
                                pickerEl = angular.element(componentRoot.querySelector('.dtp-picker'));

                            var w = componentRoot.querySelector('.dtp-content').offsetWidth;
                            var pl = parseInt(css(pickerEl, 'paddingLeft').replace('px', '')) || 0;
                            var pr = parseInt(css(pickerEl, 'paddingRight').replace('px', '')) || 0;
                            var ml = parseInt(css(clock, 'marginLeft').replace('px', '')) || 0;
                            var mr = parseInt(css(clock, 'marginRight').replace('px', '')) || 0;
                            //set width
                            var clockWidth = (w - (ml + mr + pl + pr));
                            clock.css('width', (clockWidth) + 'px');

                            var pL = parseInt(css(pickerEl, 'paddingLeft').replace('px', '')) || 0;
                            var pT = parseInt(css(pickerEl, 'paddingTop').replace('px', '')) || 0;
                            var mL = parseInt(css(clock, 'marginLeft').replace('px', '')) || 0;
                            var mT = parseInt(css(clock, 'marginTop').replace('px', '')) || 0;

                            var r = (clockWidth / 2);

                            var points = [];

                            if (picker.params.shortTime && !minuteMode) {
                                var j = r / 1.6;
                                for (var h = 1; h < 25; ++h) {
                                    if (h > 12) {
                                        j = r / 1.15;
                                    }
                                    var x = j * Math.sin(Math.PI * 2 * (h / 12));
                                    var y = j * Math.cos(Math.PI * 2 * (h / 12));

                                    var hour = {
                                        left: ((r + x + pL / 2) - (pL + mL)),
                                        top: ((r - y - mT / 2) - (pT + mT)),
                                        value: h //5 for minute 60/12
                                    };
                                    hour.display = hour.value;

                                    points.push(hour);
                                }

                            } else {
                                var j = r / 1.2;
                                for (var h = 0; h < 12; ++h) {
                                    var x = j * Math.sin(Math.PI * 2 * (h / 12));
                                    var y = j * Math.cos(Math.PI * 2 * (h / 12));

                                    var hour = {
                                        left: (r + x + pL / 2) - (pL + mL),
                                        top: (r - y - mT / 2) - (pT + mT),
                                        value: (minuteMode ? (h * 5) : h) //5 for minute 60/12
                                    };
                                    if (minuteMode) {
                                        hour.display = hour.value < 10 ? ('0' + hour.value) : hour.value;
                                    } else {
                                        hour.display = (h === 0) ? 12 : h;
                                    }

                                    points.push(hour);
                                }
                            }



                            scope.points = points;
                            setCurrentValue();
                            clock.css('height', clockWidth + 'px');
                            //picker.initHands(true);

                            var clockCenter = element[0].querySelector('.dtp-clock-center');
                            var centerWidth = (clockCenter.offsetWidth / 2) || 7.5,
                                centerHeight = (clockCenter.offsetHeight / 2) || 7.5;
                            var _hL = r / 1.8;
                            var _mL = r / 1.5;

                            angular.element(element[0].querySelector('.dtp-hour-hand')).css({
                                left: r + (mL * 1.5) - 10 + 'px',
                                height: _hL + 'px',
                                marginTop: (r - _hL - pL) - 2 + 'px'
                            }).addClass(!minuteMode ? 'on' : '');

                            angular.element(element[0].querySelector('.dtp-minute-hand')).css({
                                left: r + (mL * 1.5) - 10 + 'px',
                                height: _mL + 'px',
                                marginTop: (r - _mL - pL) - 2 + 'px'
                            }).addClass(minuteMode ? 'on' : '');

                            angular.element(clockCenter).css({
                                left: (r + pL + mL - centerWidth) + 'px',
                                marginTop: (r - (mL / 2)) - centerHeight + 7 + 'px'
                            });
                            animateHands();
                        };

                        var animateHands = function() {
                            var _date = picker.currentNearest5Minute();
                            var h = _date.hour();
                            var m = _date.minute();

                            rotateElement(angular.element(element[0].querySelector('.dtp-hour-hand')), (360 / 12) * h);
                            var mdg = ((360 / 60) * (5 * Math.round(m / 5)));
                            rotateElement(angular.element(element[0].querySelector('.dtp-minute-hand')), mdg);
                        };

                        var rotateElement = function(el, deg) {
                            angular.element(el).css({
                                WebkitTransform: 'rotate(' + deg + 'deg)',
                                '-moz-transform': 'rotate(' + deg + 'deg)'
                            });
                        };


                        var setCurrentValue = function() {
                            var date = picker.currentNearest5Minute();
                            scope.currentValue = minuteMode ? date.minute() : (date.hour() % 12);
                            if (picker.params.shortTime) {
                                scope.currentValue = minuteMode ? date.minute() : (date.hour());
                                if (date.hour() == '0') {
                                    scope.currentValue = 24;
                                }
                                if (minuteMode && date.minute() == '0') {
                                    scope.currentValue = 0;
                                }
                            }
                        };

                        scope.$watch(function() {
                            var tmp = picker.currentNearest5Minute();
                            return tmp ? tmp.format('HH:mm') : '';
                        }, function(newVal) {
                            setCurrentValue();
                            animateHands();
                        });

                        scope.setTime = function(val) {
                            if (val === scope.currentValue) {
                                picker.ok();
                            }

                            if (!minuteMode) {
                                if (picker.params.shortTime) {
                                    if (val === 24) {
                                        val = 0;
                                    }
                                    picker.currentDate.hour(val);
                                } else {
                                    picker.currentDate.hour(picker.isPM() ? (val + 12) : val);
                                }

                            } else {
                                picker.currentDate.minute(val);
                            }
                            picker.currentDate.second(0)
                        };

                        scope.pointAvailable = function(point) {
                            return minuteMode ? picker.isMinuteAvailable(point.value) : picker.isHourAvailable(point.value);
                        };

                        var unwatcher = scope.$watch(function() {
                            return element[0].querySelectorAll('div').length;
                        }, function() {
                            exec();
                            unwatcher();
                        });
                    }
                }
            }
        ]);


})(moment);