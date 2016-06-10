require.config({
    baseUrl: 'js/',

    // alias libraries paths.  Must set 'angular'
    paths: {
        'angular': 'ext/angular',
        'forge': 'forge.bundle',
        'angularAMD': 'ext/angularAMD'
    },
    
    shim: {
        'angularAMD': ['angular'],
        'forge': { exports: 'forge' }
    },
    
    // kick start application
    deps: ['callback']
});
