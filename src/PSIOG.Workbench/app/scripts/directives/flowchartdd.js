angular.module('sbAdminApp')
    .directive('flowchartddl', function ($http) {
        return {
            restrict: 'E',
            scope: false,
            template: '<select ng-model="itemSelected" ng-class="selectpicker" ng-options="item as item.flowchartName for item in items track by item.flowChartID"></select>',
            link: function (scope, elem, attr) {
                $http({
                    method: 'GET',
                    url: 'http://192.168.10.132:1337/getAllFlowChartNames',
                    data: {},
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                }).then(function successCallback(response) {
                    scope.items = response.data.flowchart;
                    scope.itemSelected = response.data.flowchart[0];
                }, function errorCallback(response) {
                    console.log(response.statusText);
                });
            }
        }
    });