// Gruntfile

module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

    // Grunt Config
    grunt.initConfig({
        bower: {
            setup: {
                options: {install: true, copy: false}
            }
        },
        copy: {
            setup: {
                files: [
                    {
                        cwd: 'bower_components', expand: true, flatten: true,
                        dest: 'app/js/ext/',
                        src: [
                        	'requirejs/require.js',
                            'angular/angular.js',
                            'angularAMD/angularAMD.js'
                        ]
                    }
                ]
            },
            build: {
                files: [
                    {
                        cwd: '<%= cvars.app %>/<%= cvars.appcss %>/fonts/', expand: true,
                        dest: '<%= cvars.build %>/<%= cvars.appcss %>/fonts/',
                        src: '*'
                    },
                    {
                        cwd: '<%= cvars.app %>/', expand: true,
                        dest: '<%= cvars.build %>/',
                        src: []
                    }
                ]
            },
            deploy: {
                files: [
                    {
                        cwd: '<%= cvars.build %>/', expand: true,
                        dest: '<%= cvars.dist %>/',
                        src: ['<%= cvars.appcss %>/**', '<%= cvars.appjs %>/ext/**', 'images/**']
                    }
                ]
            }
        },
        clean: {
            options: {force: true},
            setup: [
                'app/js/ext/'
            ],
            build: [
                '<%= cvars.build %>'
            ],
            deploy: [
                '<%= cvars.dist %>/*'
            ]
        },
        cssmin: {
            build: {
                options: { 'keepBreaks': true },
                files: [
                    {'<%= cvars.build %>/<%= cvars.appcss %>/main.css': [
                        '<%= cvars.app %>/<%= cvars.appcss %>/ext/ui-grid.css',
                        '<%= cvars.app %>/<%= cvars.appcss %>/ext/sb-admin-2.css',
                        '<%= cvars.app %>/<%= cvars.appcss %>/ext/select.css',
                        '<%= cvars.app %>/<%= cvars.appcss %>/main.css'
                    ]}
                ]
            }
        },
        preprocess: {
            build: {
                files: [
                    {
                        src: '<%= cvars.app %>/index.html',
                        dest: '<%= cvars.build %>/index.html'
                    },
                    {
                        src: '<%= cvars.app %>/popup.html',
                        dest: '<%= cvars.build %>/popup.html'
                    }
                ]
            }
        },
        htmlmin: {
            // See https://github.com/yeoman/grunt-usemin/issues/44 for using 2 passes
            build: {
                options: {
                    removeComments: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    // collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    removeEmptyAttributes: true,
                    // Cannot remove empty elements with angular directives
                    removeEmptyElements: false
                },
                files: [
                    {'<%= cvars.build %>/index.html': '<%= cvars.build %>/index.build.html'},
                    {
                        cwd: '<%= cvars.app %>/views/', expand: true, flatten: false,
                        dest: '<%= cvars.build %>/views/',
                        src: ['**/*.html']
                    }
                ]
            },
            deploy: {
                options: {
                    collapseWhitespace: true
                },
                files: [
                    {'<%= cvars.dist %>/index.html': '<%= cvars.build %>/index.html'},
                    {'<%= cvars.dist %>/popup.html': '<%= cvars.build %>/popup.html'},
                    {
                        cwd: '<%= cvars.build %>/views/', expand: true, flatten: false,
                        dest: '<%= cvars.dist %>/views/',
                        src: ['**/*.html']
                    }
                ]
            }
        },
        requirejs: {
            build: {
                options: {
                    baseUrl: '<%= cvars.app %>/<%= cvars.appjs %>',
                    mainConfigFile: '<%= cvars.app %>/<%= cvars.appjs %>/main.js',
                    removeCombined: true,
                    fileExclusionRegExp: /ext_test|_test.js$/,
                    findNestedDependencies: false,
                    optimize: 'none',
                    dir: '<%= cvars.build %>/<%= cvars.appjs %>/',
                    modules: []
                }
            }
        },
        jshint: {
            build: {
                options: {
                    jshintrc: '.jshintrc'
                },
                files: {
                    src: [
                        '<%= cvars.app %>/<%= cvars.appjs %>/**/*.js',
                        '!<%= cvars.app %>/<%= cvars.appjs %>/ext/*.js',
                        '!<%= cvars.app %>/<%= cvars.appjs %>/ext_test/angular-mocks.js',
                    ]
                }
            }
        },

        watch: {
            www: {
                files: ['<%= cvars.app %>/**/*'],
                tasks: [],
                options: {
                    spawn: false,
                    livereload: true
                }
            }
        },
        connect: {
            server: {
                options: {
                    hostname: 'localhost',
                    port: 8080,
                    base: 'app/'
                }
            }
        }
    });


    /**
     * setup task
     * Run the initial setup, sourcing all needed upstream dependencies
     */
    grunt.registerTask('setup', [
        'bower:setup',
        'clean:setup',
        'copy:setup'
    ]);


    /**
     * devel task
     * Launch webserver and watch for changes
     */
    grunt.registerTask('serve', [
        'connect:server', 'watch:www'
    ]);

    /**
     * build task
     * Use r.js to build the project
     */
    grunt.registerTask('build', [
        // 'jshint:build',
        'clean:build',
        'preprocess:build',
        'htmlmin:build',
        'cssmin:build',
        'requirejs:build',
        'uglify:build',
        'concat:build',
        'copy:build'
    ]);


    /**
     * deploy task
     * Deploy to dist_www directory
     */
    grunt.registerTask('deploy', [
        'build',
        'clean:deploy',
        'htmlmin:deploy',
        'uglify:deploy',
        'copy:deploy'
    ]);

    grunt.registerTask('hello', function () {
        grunt.log.write('hello task called with: ', gruntConfig);
    });

};
