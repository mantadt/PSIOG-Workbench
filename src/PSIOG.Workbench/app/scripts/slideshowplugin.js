angular.module('sbAdminApp').service('slideshowService', function ($http, $q, config) {
    this.getSlideshowJSON = function (flowchart, flow) {
        var one = $http({
            method: 'GET',
            url: config.baseUrl + 'getFlowChartByID/' + flowchart,
            data: '',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });

        var two = $http({
            method: 'GET',
            url: config.baseUrl + 'getCoordbyFlowId/' + flowchart,
            data: '',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });

        return $q.all([one, two]).then(function success(ret) {
            var json = ret[0].data.Flowchart[0].nodeDataArray;
            var coOrds = ret[1].data.Coordinates;
            var blocks = flow.split('_');
            var result = { coOrdinates: [] };

            for (var iL = 0; iL < blocks.length; iL++) {
                for (var jL = 0; jL < json.length; jL++) {
                    if (Number(blocks[iL]) == json[jL].key) {
                        if (json[jL].assets) {
                            json[jL].assets.sort(function (a, b) {
                                return a.Order - b.Order;
                            });

                            for (var kL = 0; kL < json[jL].assets.length; kL++) {
                                if (json[jL].assets[kL].assetType.toString().toUpperCase().indexOf('IMAGE') >= 0) {
                                    var file = { fileId: json[jL].assets[kL].fileID, coOrds: [] };
                                    file.coOrds = fnGetCoordsForFileInBlock(json[jL].assets[kL].fileID, Number(blocks[iL]), coOrds);

                                    result.coOrdinates.push(file);
                                }
                            }
                        }
                        break;
                    }
                }
            }

            return result;
        }, function error(res) {
            Console.log('error');
        });
    };

    function fnGetCoordsForFileInBlock(fileId, blockId, json) {
        var result = [];

        for (var mL = 0; mL < json.length; mL++) {
            if (blockId == json[mL].blockId && fileId == json[mL].FileID) {
                result = json[mL].coordinates;
                break;
            }
        }

        return result;
    }
});