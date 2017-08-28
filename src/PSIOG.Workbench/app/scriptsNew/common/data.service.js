(function () {
    var app = angular.module("common");

    app.service("commonSvc", serviceDef);

    function serviceDef($http, $q, config) {
        var service = {
            getFlowchartByFlowIdBlockId: getFlowchartByFlowIdBlockId
        };

        return service;

        function getFlowchartByFlowIdBlockId(flowchartId, blockId) {
            return $http({
                method: 'GET',
                url: config.baseUrl + 'getFlowChartByFlowIdBlockId/' + flowchartId + '/' + blockId,
                data: {},
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            });
        }
    }
})();