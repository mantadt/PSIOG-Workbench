angular.module('sbAdminApp').service('slideshowService', function ($http, $q) {
    this.getSlideshowJSON = function (flowchart, flow) {

        var one = $http({
            method: 'GET',
            url: 'http://192.168.10.132:1337/getFlowChartByID/' + flowchart,
            data: '',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });

        var two = $http({
            method: 'GET',
            url: 'http://192.168.10.132:1337/getCoordbyFlowId/' + flowchart,
            data: '',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });

        $q.all([one, two]).then(function success(ret) {
            var json = ret[0].data;
            var coords = ret[1].data;
            var blocks = flow.split('_');
            var result = { coOrdinates: [] };

            for (var iL = 0; iL < blocks.length; iL++) {
                var file = { fileId: "", coOrds: [] };

                result.push(file);
            } 

            return result;
        }, function error(ret) {
            Console.log('error');
        });
    };
});