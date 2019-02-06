(function () {
    'use strict';

    angular
        .module('app').config(config);

    config.$inject = ['$sceDelegateProvider'];

    function config($sceDelegateProvider) {

        $sceDelegateProvider.resourceUrlWhitelist(['**']);

    }

})();