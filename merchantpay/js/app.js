!function () {
	var app = angular.module('webapp', []);
    
    app.directive('watchChange', function ($log) {
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
    });
    
    app.directive("loadScript", function($log) {
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
                scope.$watch('src', function (src) {
                	if (src) {
                        if (scriptElem) {
                            scriptElem.remove();
                        }
                        scriptElem = angular.element('<script></script>');
                        scriptElem.attr('src', src);
                        scriptElem.on('load', function () {
                            $log.log('script onload event');
                            if (!scope.$$phase) {
                                scope.$apply();
                            }
                            scope.$emit(EVENTNAME, 'loaded');
                        });
                        scriptElem.on('error', function () {
                        	$log.log('script load failed');
                            if (!scope.$$phase) {
                                scope.$apply();
                            }
                            scope.$emit(EVENTNAME, 'failed');
                        });
                        
                        elem.append(scriptElem);
                        scope.$emit(EVENTNAME, 'loading');
                    }
                });
            }
        };
    });
    
    
    app.service('setting', ['$log', function ($log) {
        
        var	self = this,
            EPOCH = new Date('2015-04-14'),
            STORE = window.localStorage,
            privStoreFields = ['appId', 'secretKey', 'inst'],
            privScope = {}
       	;
        
        // Function to generate unique orderId
        function getTransactionId() {
        	var now = new Date(),
                dpart = Math.round((now - EPOCH)/(1000*60*60*24)),
                hpart = now.getHours(),
                spart = now.getMinutes() * now.getSeconds()
           	;
            
            return dpart + '-' + hpart + '-' + padString('0000', spart.toString());
        }
        
        function padString(template, input) {
            var inLen = input.length,
                tmpLen = template.length,
                diffLen = tmpLen - inLen;

            console.log('inLen, tmpLen, diffLen', inLen, tmpLen, diffLen);

            if (inLen > tmpLen) {
                return input.substr(0, tmpLen);
            } else {
                return template.substr(0, diffLen) + input;
            }
        }
        
        function b64urlEncode(inBytes) {
			var b64 = forge.util.encode64(inBytes),
                s1 = b64.replace(/\+/g, '-'),
                s2 = s1.replace(/\//g, '_');
            return s2;
		}

		function calcValidationHash() {
			var data = privScope.data;
            
            if (data.transactionId && data.currency && data.amount && data.secretKey) {
                var innerHash = forge.md.sha1.create(),
					validationHash = forge.md.sha1.create();
                
                innerHash.update(data.transactionId);
                innerHash.update(data.currency);
                innerHash.update(data.amount);
                innerHash.update(data.secretKey);

                var innerHashB64 = b64urlEncode(innerHash.digest().bytes());
                
                validationHash.update(data.appId);
                validationHash.update(innerHashB64);
                validationHash.update(data.secretKey);

                var validationHashB64 = b64urlEncode(validationHash.digest().bytes());

				data.innerHash = innerHashB64;
                data.validationHash = validationHashB64;
            }
		}

        this.calcHash = function () {
        	calcValidationHash();
        };
        
        this.save = function () {
            if (STORE) {
                var data = privScope.data;
                angular.forEach(privStoreFields, function (field) {
                	STORE.setItem(field, data[field]);
                });
            }
        };
        
        this.read = function () {  
          	if (STORE) {
                var data = privScope.data;
                angular.forEach(privStoreFields, function (field) {
                	data[field] = STORE.getItem(field);
                });
            }
        };
        
        this.loadScript = function (appId) {
            if (appId) {
                var jsUrl = self.getJsUrl(),
                    scriptId = '2pay-script',
                    script = document.getElementById(scriptId);
               	
                $log.log('script element:', script);
                if (script) {
                	script = document.createElement('script');
                    script.id = "2pay-script";
                    document.body.appendChild(script);
                }
                
                script.onload = function () {
                	$log.log('2pay-script loadig...');
                }
                
                // sessionIdField.textContent('loading...');
                script.src = jsUrl + data.appId;

                $log.log('Added js script tag to source app-id');
            }
        };

        this.initialize = function (scope) {
        	privScope = scope;
            
            // Set default data
            privScope.data = {
            	'transactionId': getTransactionId(),
                'currency': 'EUR',
                'amount': 1,
                'sessionId': 'Initial session for ' + getTransactionId()
            };
           	
            // Read stored data
            self.read();
            
            // Set installation options
            privScope.insts = {
            	'dev': {
                	'desc': 'Dev',
                    'postUrl': 'https://appdev.2pay.it/payapi/payment-request',
                    'jsUrl': 'https://zappdev.2pay.it/payapi/js/core?key='
                },
                'qa': {
                	'desc': 'Sandbox',
                    'postUrl': 'https://appqas.2pay.it/payapi/payment-request',
                    'jsUrl': 'https://appqas.2pay.it/payapi/js/core?key='
                },
                'prod': {
                	'desc': 'Live',
                    'postUrl': 'https://app.2pay.it/payapi/payment-request',
                    'jsUrl': 'https://app.2pay.it/payapi/js/core?key='
                }
            };
            
            $log.log('Setting initialized');
        }
        
        this.getPostUrl = function () {
            if (privScope.insts && privScope.data.inst) {
                var data = privScope.insts[privScope.data.inst];
                if (data) {
                	return data.postUrl;
                }
            }
        }
        
        this.getJsUrl = function () {
            if (privScope.insts && privScope.data.inst) {
                var data = privScope.insts[privScope.data.inst];
                if (data) {
                	return data.jsUrl + privScope.data.appId;
                }
            }
        };
        
        this.setSessionId = function (sessionId) {
            privScope.data.sessionId = sessionId
        };
        
    }]);
    
    app.controller('main_ctrl', function ($scope, setting, $location, $log, $timeout) {
        setting.initialize($scope);
        $scope.read = setting.read;
        $scope.save = setting.save;
        $log.log('main_ctrl.data', $scope.data);
    	
        $scope.$watchGroup(['data.transactionId','data.amount'], function () {
			setting.calcHash();
		});
        
        $scope.loadScript = function () {
            $scope.data.jsUrl = setting.getJsUrl();
            
            $timeout(function () {
            	
            }, 1000);
        	
        }
        
        $scope.$on('loadScriptEvent', function (event, status) {
            $log.log('loadScriptEvent value: ', status);
        	if (status==='loading') {
            	$scope.data.sessionId = "loading...";
            } else if (status==='failed') {
            	$scope.data.sessionId = "load failed!!!";
            }
        });
        
        
        $scope.$on('watchChangeEvent', function (event, value) {
            $log.log('watchChangeEvent value: ', value);
        	setting.setSessionId(value);
        });
        
        // Load the data
        var data = $scope.data;
        if (data) {
        	// setting.loadScript(data.appId);
        }
        
    });
    

    /*
    app.controller('nav_ctrl', function ($scope, $log) {
        $log.log('nav_ctrl.data', $scope.insts);
    });
    
	app.controller('setting_ctrl', function ($scope, setting, $location, $log) {

	});
    */


}();