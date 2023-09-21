(function () {
    "use strict";

    angular
        .module('app.core')
        .controller('coreController', coreController);

    coreController.$inject = ['$scope', '$interval', '$location'];

    /* @ngInject */
    function coreController($scope, $interval, $location) {
        var vm = this;

        vm.data = {
            idSideTabsWindow: 0,
            idLastChromeWindow: 0,
            search: '',

            isNewTabFromSideTabs: false,

            windows: [],
            numberOfTabs: 0,
        };
        vm.optionsSettings = {
            openSide: 'left',
            backgroundColor: '',
            autoAdjustWidth: true
        };
        vm.settings = {
            tabWidth: 250,
            showSettings: false,
            showTabsForSelectedWindow: false,
            showTabsGroupedPerWindow: true,
            showPinnedTabs: true,
            showSearch: false
        };
        vm.mainChromeWindow = {
            id: 0,
            left: 0,
            top: 0,
            width: 0,
            height: 0
        };

        vm.init = init;
        vm.initSideTabs = initSideTabs;
        vm.initChromeEvents = initChromeEvents;

        vm.initPreferences = initPreferences;
        vm.savePreferences = savePreferences;

        vm.clickCreateNewTab = clickCreateNewTab;
        vm.clickTab = clickTab;
        vm.clickCloseTab = clickCloseTab;
        vm.clickShowSettings = clickShowSettings;
        vm.clickShowSearch = clickShowSearch;
        vm.clickShowTabsForSelectedWindow = clickShowTabsForSelectedWindow;
        vm.clickShowTabsGroupedPerWindow = clickShowTabsGroupedPerWindow;
        vm.clickShowPinnedTabs = clickShowPinnedTabs;
        vm.clickMoreSettings = clickMoreSettings;

        vm.loadTabs = loadTabs;

        vm.isScrolledIntoView = isScrolledIntoView;
        vm.scrollTabIntoView = scrollTabIntoView;

        vm.checkChromeWindowPosition = checkChromeWindowPosition;
        vm.checkChromeWindowState = checkChromeWindowState;

        vm.onExit = onExit;

        // Chrome events

        vm.windowChanged = windowChanged;

        ////////////////

        function init() {

            vm.initPreferences();

        }

        function initSideTabs() {

            vm.mainChromeWindow.id = parseInt($location.search().idChromeWindow);
            vm.data.screenWidth = parseInt($location.search().screenWidth);
            vm.data.idLastChromeWindow = vm.mainChromeWindow.id;

            chrome.windows.getCurrent(function (window) {
                vm.data.idSideTabsWindow = window.id;
            });

            // INIT MAIN CHROME WINDOW
            // dont move this window
            // chrome.windows.update(vm.mainChromeWindow.id,
            //     {
            //         'left': vm.optionsSettings.openSide === 'left' ? vm.settings.tabWidth : 0,
            //         'width': vm.data.screenWidth - vm.settings.tabWidth
            //     }
            // );

            // Auto adjust width
            // if (vm.optionsSettings.autoAdjustWidth) {
            //     $interval(vm.checkChromeWindowPosition, 1000);
            // }

            // // Auto minimize/restore
            // if (vm.optionsSettings.autoMinimize) {
            //     $interval(vm.checkChromeWindowState, 1000);
            // }

            const int = setInterval(() => {
                const el = document.querySelector('.ng-isolate-scope .tab.highlighted');
                if (el?.scrollIntoView) {
                    clearInterval(int);
                    el.scrollIntoView({behavior: 'smooth', block: 'center'});
                }
            }, 200);

            vm.loadTabs();

            // Revert Main Chrome Window to initial width when closing Side Tabs
            window.onbeforeunload = vm.onExit;

            vm.initChromeEvents();

        }

        function initChromeEvents() {

            chrome.windows.onFocusChanged.addListener(function (windowId) {
                vm.windowChanged(windowId)
            });
            chrome.windows.onCreated.addListener(function (tab) {
                vm.windowChanged();
            });
            chrome.windows.onRemoved.addListener(function (windowId) {
                vm.windowChanged();
            });
            chrome.tabs.onCreated.addListener(function (param) {
                vm.loadTabs();
            });
            chrome.tabs.onActivated.addListener(function (activeInfo) {
                vm.loadTabs();
            });
            chrome.tabs.onHighlighted.addListener(function (highlightInfo) {
                vm.loadTabs(function () {
                    if (highlightInfo.tabIds.length == 1) {
                        scrollTabIntoView({id: highlightInfo.tabIds[0]});
                    }
                });
            });
            chrome.tabs.onAttached.addListener(function (tabId, attachInfo) {
                vm.loadTabs();
            });
            chrome.tabs.onDetached.addListener(function (tabId, detachInfo) {
                vm.loadTabs();
            });
            chrome.tabs.onMoved.addListener(function (tabId, moveInfo) {
                vm.loadTabs();
            });
            chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
                vm.loadTabs();
            });
            chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
                vm.loadTabs();
            });

        }


        function initPreferences() {
            chrome.storage.sync.get(['tab', 'optionsSettings', 'sideTabsSettings'], function (items) {

                if (!items.tab) {
                    items.tab = {
                        height: 25,
                        width: 250,
                        fontSize: 11,
                        textColor: '#000000',

                        backgroundColor: {
                            top: '#DBD7D9',
                            bottom: '#C4C3C5'
                        },

                        hoverColor: {
                            top: '#F5F5F5',
                            bottom: '#E6E6E6'
                        },

                        highlightColor: '#F5F5F5',
                        borderColor: '#A9A9A9'
                    }
                } else {
                    items.tab = JSON.parse(items.tab);
                }

                if (!items.optionsSettings) {
                    items.optionsSettings = {
                        openSide: 'left',
                        backgroundColor: '#D4D4D4',
                        singleInstance: true,
                        autoAdjustWidth: false,
                        autoMinimize: false
                    }
                } else {
                    items.optionsSettings = JSON.parse(items.optionsSettings);
                }

                vm.optionsSettings = items.optionsSettings;

                if (!items.sideTabsSettings) {
                    items.sideTabsSettings = {
                        tabWidth: 250,
                        showTabsForSelectedWindow: false,
                        showTabsGroupedPerWindow: false,
                        showPinnedTabs: false
                    }
                } else {
                    items.sideTabsSettings = JSON.parse(items.sideTabsSettings);
                }

                vm.settings = items.sideTabsSettings;

                var style = angular.element('<style>')
                    .prop('type', 'text/css')
                    .html('\
                        body {\
                            font-size: ' + items.tab.fontSize + 'px;\
                            background-color: ' + items.optionsSettings.backgroundColor + ';\
                         }\
                        .tab {\
                            color: ' + items.tab.textColor + ';\
                            border-color: ' + items.tab.borderColor + '; \
                            background: linear-gradient(' + items.tab.backgroundColor.top + ', ' + items.tab.backgroundColor.bottom + ');\
                            height: ' + items.tab.height + 'px;\
                        }\
                        .tab.highlighted {\
                            background: ' + items.tab.highlightColor + '\
                        }\
                        .tab:hover {\
                            background: linear-gradient(' + items.tab.hoverColor.top + ', ' + items.tab.hoverColor.bottom + ');\
                        }\
                        .separator {\
                            background: + ' + items.tab.borderColor + ';\
                        }\
                        .window-separator {\
                            color: ' + items.tab.borderColor + ' \
                        }\
                        ');

                angular.element(document.querySelector('head')).append(style);


                vm.initSideTabs();

            })
        }

        function savePreferences() {

            chrome.storage.sync.set({
                sideTabsSettings: JSON.stringify(vm.settings)
            })

        }

        function clickCreateNewTab() {

            vm.isNewTabFromSideTabs = true;

            var windowId = vm.data.idLastChromeWindow ? vm.data.idLastChromeWindow : chrome.windows.WINDOW_ID_CURRENT;

            chrome.tabs.create({
                'windowId': windowId
            })

        }

        function clickTab(tab) {

            try {

                chrome.windows.get(tab.windowId, function (window) {

                    if (window.state == 'minimized' || vm.data.idLastChromeWindow != tab.windowId) {
                        chrome.windows.update(tab.windowId, {'focused': true}, function () {
                            chrome.tabs.update(tab.id, {'active': true}, function () {
                                chrome.windows.update(vm.data.idSideTabsWindow, {'focused': true}, function () {
                                    vm.loadTabs(function () {
                                        scrollTabIntoView(tab);
                                    });
                                });
                            });
                        })
                    }
                    else {
                        chrome.tabs.update(tab.id, {'active': true}, function () {
                            chrome.windows.update(vm.data.idSideTabsWindow, {'focused': true}, function () {
                                vm.loadTabs(function () {
                                    scrollTabIntoView(tab);
                                });
                            });
                        });
                    }
                })

            }
            catch (ex) {
                console.log(ex);
            }

        }

        function clickCloseTab(tab) {

            chrome.tabs.remove(tab.id, function () {
                vm.loadTabs();
            })

        }

        function clickShowSettings() {
            vm.settings.showSettings = !vm.settings.showSettings;
            vm.savePreferences();
        }

        function clickShowSearch() {
            vm.settings.showSearch = !vm.settings.showSearch;
            vm.savePreferences();

            if (!vm.settings.showSearch) {
                vm.data.search = '';
                return;
            }

            setTimeout(function () {
                document.getElementById('search').focus();
            }, 50);
        }

        function clickShowTabsForSelectedWindow() {
            vm.settings.showTabsForSelectedWindow = !vm.settings.showTabsForSelectedWindow;
            vm.savePreferences();
            vm.loadTabs();
        }

        function clickShowTabsGroupedPerWindow() {
            vm.settings.showTabsGroupedPerWindow = !vm.settings.showTabsGroupedPerWindow;
            vm.savePreferences();
        }

        function clickShowPinnedTabs() {
            vm.settings.showPinnedTabs = !vm.settings.showPinnedTabs;
            vm.savePreferences();
        }

        function clickMoreSettings() {
            chrome.runtime.openOptionsPage();
        }

        function loadTabs(callback) {

            chrome.windows.getAll({"populate": true}, function (windows) {

                // Reset number of tabs to 0;
                vm.data.numberOfTabs = 0;

                var filteredWindows = [];

                for (var i = 0; i < windows.length; i++) {
                    if (windows[i].type == "normal") {

                        if (vm.settings.showTabsForSelectedWindow) {
                            if (windows[i].id === vm.data.idLastChromeWindow) {
                                filteredWindows.push(windows[i]);
                            }
                        } else {
                            filteredWindows.push(windows[i]);
                        }

                        for (var j = 0; j < windows[i].tabs.length; j++) {
                            vm.data.numberOfTabs++;
                        }
                    }

                    /*
                     if (windows[i].id == vm.data.idLastChromeWindow) {
                     for (var j = 0; j < windows[i].tabs.length; j++) {
                     if (windows[i].tabs[j].highlighted) {
                     scrollTabIntoView(windows[i].tabs[j]);
                     }
                     }
                     }
                     */
                }

                vm.data.windows = filteredWindows;

                if (!$scope.$$phase) {
                    $scope.$digest();
                }


                /*
                for (var i = 0; i < vm.data.windows.length; i++) {
                    if (vm.data.windows[i].id == vm.data.idLastChromeWindow) {
                        for (var j = 0; j < vm.data.windows[i].tabs.length; j++) {
                            if (vm.data.windows[i].tabs[j].highlighted) {
                            }
                        }
                    }
                }
                */

                if (callback) {
                    callback();
                }

            });

        }

        function isScrolledIntoView(tab) {

            if (!tab) return;

            var tabsWrapper = document.querySelector('.tabs-wrapper');

            return ((tab.offsetTop + tab.offsetHeight <= (tabsWrapper.offsetHeight + tabsWrapper.scrollTop) * 0.9) &&
            (tab.offsetTop >= (tabsWrapper.scrollTop + tabsWrapper.offsetTop) * 1.1));

        }

        function scrollTabIntoView(selectedTab) {

            var tabs = document.querySelectorAll('.tab');

            for (var i = 0; i < tabs.length; i++) {
                var tab = angular.element(tabs[i]).scope().tab;
                if (!tab) continue;

                if (tab.id == selectedTab.id) {
                    var tabDiv = tabs[i];
                    break;
                }
            }

            if (vm.isScrolledIntoView(tabDiv) == false) {

                var tabsWrapper = document.querySelector('.tabs-wrapper');
                tabsWrapper.scrollTop = tabDiv.offsetTop - tabsWrapper.offsetHeight / 2;

            }
        }

        function checkChromeWindowPosition() {

            // eff all this.. its really annoying.
            return;

            chrome.windows.get(vm.mainChromeWindow.id, function (window) {

                if (vm.mainChromeWindow.left != window.left ||
                    vm.mainChromeWindow.width != window.width) {

                    vm.mainChromeWindow.left = window.left;
                    vm.mainChromeWindow.width = window.width;

                    if (vm.optionsSettings.openSide === 'left') {

                        vm.settings.tabWidth = window.left;

                        chrome.windows.update(vm.data.idSideTabsWindow, {
                            width: vm.settings.tabWidth,
                            left: 0,
                            top: 0
                        });

                    } else {

                        vm.settings.tabWidth = screen.width - window.width;

                        chrome.windows.update(vm.data.idSideTabsWindow, {
                            left: window.width,
                            top: 0,
                            width: vm.settings.tabWidth
                        });

                    }

                    if (vm.settings.tabWidth > 30 && vm.settings.tabWidth < window.width - 30) {
                        savePreferences();
                    }

                }

            });

        }

        function checkChromeWindowState() {
            // this is annoying.
            return;

            chrome.windows.get(vm.mainChromeWindow.id, function (window) {

                if (vm.mainChromeWindow.state != window.state) {

                    vm.mainChromeWindow.state = window.state;

                    if (window.state == 'minimized') {
                        chrome.windows.update(vm.data.idSideTabsWindow, {
                            state: 'minimized'
                        });
                    } else {
                        chrome.windows.update(vm.data.idSideTabsWindow, {
                            state: 'normal'
                        });
                    }

                }

            });

        }

        function windowChanged(windowId) {

            if (windowId != vm.data.idSideTabsWindow && windowId >= 0) {
                vm.data.idLastChromeWindow = windowId;
                vm.loadTabs();
            }

        }

        function onExit() {

            // NO thx
            // chrome.windows.update(vm.mainChromeWindow.id, {
            //     width: screen.width,
            //     left: 0
            // });

        }

        vm.init();

    }

})();