/// <reference path="directives/genAndView/genAndView.js" />
'use strict';
/**
 * @ngdoc overview
 * @name sbAdminApp
 * @description
 * # sbAdminApp
 *
 * Main module of the application.
 */
angular
    .module('sbAdminApp', [
        'oc.lazyLoad',
        'ui.router',
        'ui.bootstrap',
        'angular-loading-bar',
    ])
    .value('config', {       
        //baseUrl:'http://192.168.10.132:1337/'
        baseUrl: 'http://localhost:1337/'
    })
    .config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', function ($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {

        $ocLazyLoadProvider.config({
            debug: false,
            events: true,
        });

        $urlRouterProvider.otherwise('/dashboard/CreateFlowChart');

        $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'views/dashboard/main.html',
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load(
                            {
                                name: 'sbAdminApp',
                                files: [
                                    'scripts/directives/header/header.js',
                                    'scripts/directives/header/header-notification/header-notification.js',
                                    'scripts/directives/sidebar/sidebar.js',
                                    'scripts/directives/sidebar/sidebar-search/sidebar-search.js',
                                    'scripts/directives/flowchartdd.js',
                                    'scripts/directives/genAndView/genandview.js',
                                    'scripts/directives/generator/generator.js',     
                                    'scripts/slideshowplugin.js'
                                ]
                            }),
                            $ocLazyLoad.load(
                                {
                                    name: 'toggle-switch',
                                    files: ["bower_components/angular-toggle-switch/angular-toggle-switch.min.js",
                                        "bower_components/angular-toggle-switch/angular-toggle-switch.css"
                                    ]
                                }),
                            $ocLazyLoad.load(
                                {
                                    name: 'ngAnimate',
                                    files: ['bower_components/angular-animate/angular-animate.js']
                                })
                        $ocLazyLoad.load(
                            {
                                name: 'ngCookies',
                                files: ['bower_components/angular-cookies/angular-cookies.js']
                            })
                        $ocLazyLoad.load(
                            {
                                name: 'ngResource',
                                files: ['bower_components/angular-resource/angular-resource.js']
                            })
                        $ocLazyLoad.load(
                            {
                                name: 'ngSanitize',
                                files: ['bower_components/angular-sanitize/angular-sanitize.js']
                            })
                        $ocLazyLoad.load(
                            {
                                name: 'ngTouch',
                                files: ['bower_components/angular-touch/angular-touch.js']
                            })
                    }
                }
            })
            .state('dashboard.home', {
                url: '/home',
                controller: 'MainCtrl',
                templateUrl: 'views/dashboard/home.html',
                resolve: {
                    loadMyFiles: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: [
                                'scripts/controllers/main.js',
                                'scripts/directives/timeline/timeline.js',
                                'scripts/directives/notifications/notifications.js',
                                'scripts/directives/chat/chat.js',
                                'scripts/directives/generator/generator.js',
                                'scripts/directives/genAndView/genandview.js',
                                'scripts/directives/dashboard/stats/stats.js'
                            ]
                        })
                    }
                }
            })
            .state('dashboard.form', {
                templateUrl: 'views/form.html',
                url: '/form'
            })
            .state('dashboard.blank', {
                templateUrl: 'views/pages/blank.html',
                url: '/blank'
            })
            .state('login', {
                templateUrl: 'views/pages/login.html',
                url: '/login'
            })
            .state('dashboard.chart', {
                templateUrl: 'views/chart.html',
                url: '/chart',
                controller: 'ChartCtrl',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'chart.js',
                            files: [
                                'bower_components/angular-chart.js/dist/angular-chart.min.js',
                                'bower_components/angular-chart.js/dist/angular-chart.css'
                            ]
                        }),
                            $ocLazyLoad.load({
                                name: 'sbAdminApp',
                                files: ['scripts/controllers/chartContoller.js']
                            })
                    }
                }
            })
            .state('dashboard.table', {
                templateUrl: 'views/table.html',
                url: '/table'
            })
            .state('dashboard.panels-wells', {
                templateUrl: 'views/ui-elements/panels-wells.html',
                url: '/panels-wells'
            })
            .state('dashboard.CreateFlowChart', {
                templateUrl: 'views/ui-elements/CreateFlowChart.html',
                url: '/CreateFlowChart'
            })
            .state('dashboard.ViewFlowChart', {
                templateUrl: 'views/ui-elements/ViewFlowChart.html',
                url: '/ViewFlowChart'
            })
            .state('dashboard.ModifyFlowChart', {
                templateUrl: 'views/ui-elements/ModifyFlowChart.html',
                url: '/ModifyFlowChart'
            })
            .state('dashboard.CreateUsability', {
                templateUrl: 'views/ui-elements/CreateUsability.html',
                url: '/CreateUsability'
            })
            .state('dashboard.ViewPresentations', {
                templateUrl: 'views/ui-elements/ViewPresentations.html',
                url: '/ViewPresentation'
            })
            .state('dashboard.buttons', {
                templateUrl: 'views/ui-elements/buttons.html',
                url: '/buttons'
            })
            .state('dashboard.notifications', {
                templateUrl: 'views/ui-elements/notifications.html',
                url: '/notifications'
            })
            .state('dashboard.typography', {
                templateUrl: 'views/ui-elements/typography.html',
                url: '/typography'
            })
            .state('dashboard.icons', {
                templateUrl: 'views/ui-elements/icons.html',
                url: '/icons'
            })
            .state('dashboard.grid', {
                templateUrl: 'views/ui-elements/grid.html',
                url: '/grid'
            })
            .state('dashboard.generateTests', {
                templateUrl: 'views/pages/generateTests.html',
                url: '/generateTests'
            })
    }]);

//Service to Generate all combinations of flows
angular
    .module('sbAdminApp').factory('generatorService', ['$http', 'config', function ($http, config) {
        var data = { name: 'MS' };
        
        return {
            generateFromXml: function (xmlData) {
                var formData = new FormData();
                //formData.append("xmlData", "DSDS");
                //console.log(xmlData, formData.getAll('xmlData'));
                return $http.post(config.baseUrl + "generateFromXml/", $.param({ 'xmlData': xmlData }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
            },

            generateFromJson: function (jsonData) {
                //var formData = new FormData(); 
                //formData.append("flowChartID", id);
                return $http.post(config.baseUrl + "generateFromJson/", jsonData, { headers: { 'Content-Type': 'application/json' } });
            },

            getJsonValue: function (id) {
                return $http.get(config.baseUrl + "getFlowChartByID/" + id, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
            }


        }
    }]);




