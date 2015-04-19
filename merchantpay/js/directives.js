define(['angularAMD'], function (angularAMD) {
    
	angularAMD.directive('watchChange', ['$log', function ($log) {
        /*
		Watch for changes done outside of the AngularJS and therefore
		the need to use DOM's document to pool for the changes.
        
        When change is detected, emit a `watchChangeEvent` passing the value.
		*/
    	return {
            restrict: "EA",
            scope: {},
            link: function(scope, elem) {
                var elemId;
                try {
                	elemId = elem[0].id;
                } catch(e) {}
                
                if (elemId) {
                    $log.log('Watching for input.value changes for ' + elemId);
                    function inputChanged() {
                        var input = document.getElementById(elemId);
                        return input.value;
                    }
                    scope.$watch(inputChanged, function (value) {
                        scope.$emit('watchChangeEvent', value);
                    });
                } else {
                	$log.error('watchChange failed to start due to missing id property for element:', elem);
                }
            }
        };
    }]);
    
    angularAMD.directive("loadScript", ['$timeout', '$log', function($timeout, $log) {
        /*
		Load the script as defined in src on demand by watching the changes to the value
        of the src attribute.  When src changes, remove previosly created script tag if
        exists, and add a new script tag with src passed.
        
        Emit the `loadScriptEvent` with following status:
        - loading
        - loaded
        - faild
        
        As loaded script could make changes outside AngularJS, scope.$apply() is called
        on the loaded and failed event.
        
		*/
        return {
            restrict: "E",
            scope: {
            	'src': '=*'
            },
            link: function(scope, elem, attrs) {
            	var EVENTNAME = 'loadScriptEvent',
                    scriptElem;
                
                function emitEvent(status) {
                    // Using timeout to overcome the need to use $apply
                    $timeout(function () {
                    	scope.$emit(EVENTNAME, status);
                    }, 0);
                }
                
                scope.$watch('src', function (src) {
                	if (src) {
                        if (scriptElem) {
                            scriptElem.remove();
                        }
                        scriptElem = angular.element('<script></script>');
                        scriptElem.attr('src', src);
                        scriptElem.on('load', function () {
                            $log.log('script onload event');
                            emitEvent('loaded');
                        });
                        scriptElem.on('error', function () {
                        	$log.log('script load failed');
                            emitEvent('failed');
                        });
                        elem.append(scriptElem);
                        emitEvent('loading');
                    }
                });
            }
        };
    }]);
                                        
});