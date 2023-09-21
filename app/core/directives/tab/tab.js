(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('tab', tab);

    tab.$inject = [];

    /* @ngInject */
    function tab() {
        var directive = {
            link: link,
            restrict: 'AE',
            scope: {
                tab: '=',
                window: '=',
                idLastChromeWindow: '=',

                onClick: '&',
                onClose: '&'
            },
            templateUrl: chrome.runtime.getURL('app/core/directives/tab/tab.html')
        };
        return directive;

        function link(scope, element, attrs) {

            scope.checkHighlight = function (newValue) {
                scope.tabClass = "";

                if (scope.tab.highlighted == true && scope.idLastChromeWindow == scope.tab.windowId) {
                    if (scope.tabClass.indexOf("highlighted") == -1) {
                        scope.tabClass += " highlighted ";
                    }
                } else {
                    scope.tabClass.replace(" highlighted ", "");
                }
            };

            scope.$watch('idLastChromeWindow', function (newValue, oldValue) {
                scope.checkHighlight(newValue)
            }, true);

            scope.$watch('tab.highlighted', function (newValue, oldValue) {
                scope.checkHighlight(newValue)
            }, true);

            var close = angular.element(element[0].querySelector('.close'))[0];
            close.addEventListener('mousedown', function(e) {
                e.stopPropagation();
                scope.onClose({tab: scope.tab});
            });

            var tab = angular.element(element[0].querySelector('.tab'))[0];
            tab.addEventListener('mousedown', function (e) {

                e.stopPropagation();

                var buttonCode = e.button;

                switch(buttonCode) {
                    case 0:
                        scope.onClick({tab: scope.tab});
                        break;

                    case 1:
                        scope.onClose({tab: scope.tab});
                        break;
                }

            });

        }

    }

})();