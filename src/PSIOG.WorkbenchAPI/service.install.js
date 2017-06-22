var Service = require('node-windows').Service;

var svc = new Service({
    name: 'Workbench Node API',
    description: 'The Workbench nodejs API Server.',
    script: require('path').join(__dirname, 'app.js')
});

svc.on('install', function () {
    console.log("Service Installed.");
    svc.start();
});

svc.install();