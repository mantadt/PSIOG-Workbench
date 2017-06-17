angular.module('sbAdminApp')
    .directive('fplModal', function ($http) {
        return {
            restrict: 'E',
            scope: { images: '=imagesData', visible: '=', onShown: '&', onHide: '&' },
            templateUrl: 'scripts/directives/modal/fileUploadPopup.html',
            link: function (scope, element, attrs) {
                $(element).modal({
                    show: false,
                    keyboard: attrs.keyboard,
                    backdrop: attrs.backdrop
                });

                scope.$watch(function () { return scope.visible; }, function (value) {
                    if (value == true) {
                        $(element).modal('show');
                    } else {
                        $(element).modal('hide');
                    }
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.onShown({});
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.onHide({});
                    });
                });
            }
        });