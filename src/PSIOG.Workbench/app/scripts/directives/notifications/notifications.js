'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('sbAdminApp')
    .directive('notifications', function (generatorService) {

        generatorService.generateFromXml("<headers>Hi</headers>")
            .then(function (success) { console.log(success); }, function (failure) { console.log(failure); });

		return {
        templateUrl:'scripts/directives/notifications/notifications.html',
        restrict: 'E',
        replace: true,
    	}
    })


