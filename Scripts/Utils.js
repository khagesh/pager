if (typeof Module === "undefined") {
    Module = {};
}
/**
* Provides utilities function to use in JavaScript
*/
Module.Utils = (function () {

    var utilObject = {};

    /**
    * Returns if given variable is not undefined, null, false, empty string
    */
    var _isSafe = function (literalToCheck) {
        if (typeof literalToCheck === "undefined" || !literalToCheck) {
            return false;
        }
        return true;
    };

    // Add it to pool of utility function to make it publicly available 
    utilObject.IsSafe = _isSafe;

    /**
    * Checks if JSON object is empty or not
    */
    var _isEmptyObject = function (oValue) {
        if (_isSafe(oValue) && typeof oValue === "object") {
            var keyCount = 0, keyCounter;
            for (keyCounter in oValue) {
                oValue.hasOwnProperty(keyCounter) && keyCount++;
            }
			
            return keyCount === 0;
        }
        return true;
    };
    utilObject.IsEmptyObject = _isEmptyObject;

    /**
    * Dumps all the content of an object in JSON format
    * @attribute oValue {object} object which needs to converted to simple string representation
    * @attribute d {Integer} depth to which we need to recursively iterate object, default value is 4
    * @return {string} simple representation of an object
    */
    var _Dump = function (oValue, d) {
        var elementsStack = [], OBJ = '{...}', COMMA = ',', COLON = ':', ARROW = '=>', i;
        d = _isNumber(d) ? d : 4;

        // TODO: Add logic to handle all kind of objects to dump, i.e. Function, Date, Regex, Number

        if (_isSafe(oValue) && (_isArray(oValue) || _isObject(oValue) || _isString(oValue))) {
            // If object passed is an array, push "[" and "]" this to element stack
            if (_isArray(oValue)) {
                elementsStack.push('[');
                for (i = 0; i < oValue.length; i++) {
                    elementsStack.push(i);
                    elementsStack.push(ARROW);
                    // an object or array inside an array
                    if (_isObject(oValue[i]) || _isArray(oValue[i])) {
                        elementsStack.push((d > 0) ? _Dump(oValue[i], d - 1) : OBJ);
                    }
                        // normal value
                    else {
                        elementsStack.push(oValue[i]);
                    }
                    elementsStack.push(COMMA);
                }
                if (elementsStack.length > 1) {
                    elementsStack.pop();
                }
                elementsStack.push(']');
            }
                // else object {key : value}
            else if (_isObject(oValue)) {
                elementsStack.push('{');
                for (i in oValue) {
                    if (oValue.hasOwnProperty(i)) {
                        elementsStack.push(i);
                        elementsStack.push(COLON);
                        if (_isObject(oValue[i]) || _isArray(oValue[i])) {
                            elementsStack.push((d > 0) ? _Dump(oValue[i], d - 1) : OBJ);
                        }
                        else {
                            elementsStack.push(oValue[i]);
                        }
                    }
                    elementsStack.push(COMMA);
                }
                if (elementsStack.length > 1) {
                    elementsStack.pop();
                }
                elementsStack.push('}');
            }
            else {
                elementsStack.push(oValue);
            }
        }
        return elementsStack.join(' ');
    };
    utilObject.Dump = _Dump;

    /**
    * returns number of key available if an object is passed, for an array the length of array, for string number of characters, for any other object return zero
    */
    var _GetLength = function (oValue, IsTrim) {
        // Check if a valid object
        if (_isSafe(oValue)) {
            // if array then return length
            if (_isArray(oValue)) {
                return oValue.length;
            }

            // If string then trim and then return length
            if (_isString(oValue)) {
                return (_isSafe(IsTrim) && IsTrim === true) ? _Trim(oValue).length : oValue.length;
            }
            // so now if it is an object
            if (_isObject(oValue)) {
                var keyCount = 0, keyCounter;
                for (keyCounter in oValue) {
                    if (oValue.hasOwnProperty(keyCounter)) {
                        keyCount++;
                    }
                }
                return keyCount;
            }
        }
        return 0;
    };
    utilObject.Length = _GetLength;

    /**
    * Checks if value is an array or not
    */
    var _isArray = function (oValue) {
        return _GetType(oValue) === "array";
    };
    utilObject.IsArray = _isArray;

    /**
    * Checks if given value is string
    */
    var _isString = function (oValue) {
        return _GetType(oValue) === "string";
    };
    utilObject.IsString = _isString;

    // Checks if a value is Boolean
    var _isBoolean = function (oValue) {
        return _GetType(oValue) === "boolean";
    };
    utilObject.IsBoolean = _isBoolean;

    /**
    * Checks if variable passed is an strict object
    */
    var _isObject = function (oValue) {
        return _GetType(oValue) === "object";
    };
    utilObject.IsObject = _isObject;

    var _isFunction = function (oValue) {
        return _GetType(oValue) === "function";
    };
    utilObject.IsFunction = _isFunction;

    var _isInteger = function (oValue) {
        return _GetType(oValue) === "number";
    };
    utilObject.IsInteger = _isInteger;

    var _isDate = function (oValue) {
        return _GetType(oValue) === "date";
    };
    utilObject.IsDate = _isDate;

    var _isNodeList = function (oValue) {
        return _GetType(oValue) === "nodelist";
    };
    utilObject.IsNodeList = _isNodeList;

    /**
    * Private property to hold all objects type
    */
    var _oType = {};
    (function () {
        var _oJSObjects = "Boolean Number String Function Array Date RegExp Object NodeList".split(" "), i = 0;
        for (; i < _oJSObjects.length; i++) {
            _oType["[object " + _oJSObjects[i] + "]"] = _oJSObjects[i].toLowerCase();
        }
    })();

    /**
    * Public method to get the type of object
    */
    var _GetType = function (oValue) {
        // Passed parameter may be blank string or Boolean value false, so we cannot use if(oValue) to check for false condition
        if (oValue === null) {
            return "null";
        }
        return _oType[Object.prototype.toString.call(oValue)] || "object";
    };
    utilObject.GetType = _GetType;

    /**
    * Check if a given string can be used as number or not, only unsigned integers
    */
    var _isNumber = function (oValue) {
        if (_isSafe(oValue)) {
            return (/^\d+$/.test(oValue));
        }
        return false;
    };
    utilObject.IsNumber = _isNumber;

    // Check if a given value is signed integer or signed decimal
    var _IsDecimal = function (oValue) {
        if (_isSafe(oValue)) {
            return (/^[+-]?\d+(\.\d+)?$/.test(oValue));
        }
    };
    utilObject.IsDecimal = _IsDecimal;

    var _EqualTrim = function (sFirstValue, sSecondValue) {
        return _isString(sFirstValue) && _isString(sSecondValue) && _Trim(sFirstValue) === _Trim(sSecondValue);
    };

    // This will serve as method when we are comparing any two objects to be equal
    utilObject.oComparisonFn = {
        oStringComparison: {
            Trim: _EqualTrim
        }
    };


    /**
    * This function job is similar to how jQuery handles optional configuration 
    * Return an object after replacing similar keys, value, in oDefaultConfig with values in oUserDefinedConfig. 
    * Non matching keys from oDefaultConfig are preserved as it is in return object.
    * @attribute oUserDefinedConfig {object} key value pair which needs to in returned object
    * @attribute oDefaultConfig {object} key value pair which needs to be replace with values in oUserDefinedConfig
    * Both user defined objects and default configuration objects are preserved as it is
    */
    var _GetUserDefinedWithDefault = function (oUserDefinedConfig, oDefaultConfig) {
        if (_isEmptyObject(oDefaultConfig) && !_isEmptyObject(oUserDefinedConfig)) {
            return oUserDefinedConfig;
        }
        if (!_isEmptyObject(oDefaultConfig) && !_isEmptyObject(oUserDefinedConfig)) {
            var oConfig = {};
            for (var DefaultKey in oDefaultConfig) {
                if (oDefaultConfig.hasOwnProperty(DefaultKey)) {
                    for (var UserKey in oUserDefinedConfig) {
                        if (oUserDefinedConfig.hasOwnProperty(UserKey)) {
                            // Check if current user key is in the default configuration
                            if (oDefaultConfig.hasOwnProperty(UserKey)) {
                                // If present, then replace default configuration values with user defined values
                                if (_isObject(oUserDefinedConfig[UserKey]) && _isObject(oDefaultConfig[UserKey])) {
                                    // if both values in user defined and default are objects we need deep extending
                                    oConfig[UserKey] = _GetUserDefinedWithDefault(oUserDefinedConfig[UserKey], oDefaultConfig[UserKey]);
                                }
                                else {
                                    // if one of them or both are not objects, then give value of user defined configuration
                                    oConfig[UserKey] = oUserDefinedConfig[UserKey];
                                }
                            }
                            else {
                                // No key is present in default configuration directly add value to default configuration object
                                oConfig[UserKey] = oUserDefinedConfig[UserKey];
                            }
                        }
                    }
                    // User has not set some values for Default configuration, add them to extended object
                    if (!(oUserDefinedConfig.hasOwnProperty(DefaultKey))) {
                        oConfig[DefaultKey] = oDefaultConfig[DefaultKey];
                    }
                }
            }
            return oConfig;
        }
        return oDefaultConfig;
    };
    utilObject.GetUserDefinedWithDefault = _GetUserDefinedWithDefault;
    utilObject.Extend = _GetUserDefinedWithDefault;

    // Join an Object key value pairs
    var _joinKeyValuePairs = function (oValue, keyGlue, pairGlue) {
        if (_isObject(oValue)) {
            var joinString = '', x;
            for (x in oValue) {
                if (oValue.hasOwnProperty(x)) {
                    if (joinString === '') {
                        joinString = x + keyGlue + oValue[x];
                    }
                    else {
                        joinString = joinString + pairGlue + x + keyGlue + oValue[x];
                    }
                }
            }
            return joinString;
        }
        // If an array join with keyGlue
        if (_isArray(oValue)) {
            return oValue.join(keyGlue);
        }
        // If an string return as it is
        if (_isString(oValue)) {
            return oValue;
        }
    };
    utilObject.JoinKeyValuePairs = _joinKeyValuePairs;

    // Returns a cloned copy of object, doesn't support Deep Copy
    // Clean this approach to use a deep copy by calling recursive function and use some smart technique to avoid Deep copying DOM elements
    var _Clone = function (oValue) {
        // Handle the 3 simple types, and null or undefined
        if (null === oValue || "object" !== typeof oValue) {
            return oValue;
        }

        // Handle Date
        if (_isDate(oValue)) {
            var copy = new Date();
            copy.setTime(oValue.getTime());
            return copy;
        }

        // Handle Array
        if (_isArray(oValue)) {
            var copy = [];
            for (var i = 0, len = oValue.length; i < len; ++i) {
                copy[i] = _Clone(oValue[i]);
            }
            return copy;
        }

        // Handle Object
        if (_isObject(oValue)) {
            var copy = {};
            for (var attr in oValue) {
                if (oValue.hasOwnProperty(attr)) {
                    copy[attr] = _Clone(oValue[attr]);
                }
            }
            return copy;
        }

        throw new Error("Unable to copy object! Its type isn't supported.");
    };
    utilObject.Clone = _Clone;

    // Join JSON pair with some keys to skip, takes only one dimensional array of strings as keys to skip
    var _JoinJSON = function (oValue, KeyGlue, PairGlue, oSkipKey) {
        var oCloneValue = _Clone(oValue);
        if (_isSafe(oSkipKey)) {
            // If array of string keys, then delete keys from object and then pass to join key value pair function
            if (_isArray(oSkipKey)) {
                for (var i = 0; i < oSkipKey.length; i++) {
                    if (_isString(oSkipKey[i]) && oCloneValue.hasOwnProperty(oSkipKey[i])) {
                        delete oCloneValue[oSkipKey[i]];
                    }
                }
            }
            else if (_isString(oSkipKey) && oCloneValue.hasOwnProperty(oSkipKey)) {
                delete oCloneValue[oSkipKey];
            }
        }
        return _joinKeyValuePairs(oCloneValue, KeyGlue, PairGlue);
    };
    utilObject.JoinJSON = _JoinJSON;

    // Search a value in an array
    var _GetIndex = function (sNeedle, oValue, FnComparison) {
        if (!_isSafe(oValue)) {
            return -1;
        }
        if (_isArray(oValue)) {
            var i = 0, index = -1;
            for (; i < oValue.length; i++) {
                var bEqualResult = false;
                if (_isFunction(FnComparison)) {
                    bEqualResult = FnComparison(oValue[i], sNeedle);
                }
                else {
                    bEqualResult = (oValue[i] === sNeedle);
                }
                if (bEqualResult) {
                    index = i;
                    break;
                }
            }
            return index;
        }
        // if string then return index of character or string
        if (_isString(oValue)) {
            return oValue.indexOf(sNeedle);
        }

        if (_isObject(oValue)) {
            return oValue.hasOwnProperty(sNeedle) === true ? 0 : -1;
        }
    };
    utilObject.IndexOf = _GetIndex;

    // Get name of current page
    var _CurrentPageName = function () {
        var urlPath = window.location.pathname;
        return urlPath.substring(urlPath.lastIndexOf('/') + 1);
    };
    utilObject.CurrentPageName = _CurrentPageName;

    // Private object to cache data until page refreshes. This is used only if no browser storage is available
    var _CacheItems = {};

    var _IsSessionStorage = function () {
        return (typeof Storage !== "undefined" && typeof sessionStorage !== "undefined");
    };

    // Get Cache data using HTML 5 session storage, we are not using local storage
    var _GetCacheData = function (sKey) {
        if (_IsSessionStorage()) {
            return sessionStorage[sKey];
        }
        return (_CacheItems.hasOwnProperty(sKey) ? _CacheItems[sKey] : null);
    };
    utilObject.GetCacheData = _GetCacheData;

    // Set cache data to HTML 5 session storage, if not available then save into our own created cache object
    var _SetCacheData = function (skey, oValue) {
        // Save data to cache only if key is a string
        if (_isString(skey)) {
            if (_IsSessionStorage()) {
                sessionStorage[skey] = oValue;
            }
            else {
                _CacheItems[skey] = oValue;
            }
        }
    };
    utilObject.SetCacheData = _SetCacheData;
    // Provide another name for same function
    utilObject.SaveCacheData = _SetCacheData;

    var _RemoveCacheData = function (sKey) {
        // Remove data from cache only if key is a string
        if (_isString(skey)) {
            if (_IsSessionStorage()) {
                sessionStorage.removeItem(skey);
            }
            else {
                _CacheItems.hasOwnProperty(skey) && (delete _CacheItems.skey);
            }
        }
    };
    utilObject.RemoveCache = _RemoveCacheData;
    // Provide another public name of same function 
    utilObject.DeleteFromCache = _RemoveCacheData;

    // Create a method to flush all cache
    var _flushCache = function () {
        _IsSessionStorage() && (sessionStorage.clear());
        _CacheItems = {};
    };
    utilObject.FlushCache = _flushCache;

    // Check if given object is valid JSON object or not
    var _isValidJSON = function (oValue) {
        try {
            oValue = JSON.parse(oValue);
            // We can return from here parsed JSON to save time to convert to valid JSON if already Valid
            return { "result": _isObject(oValue), "validJSON": oValue };
        }
        catch (InvalidJSONException) {
            return { "result": false, "Exception": InvalidJSONException };
        }
    };
    utilObject.IsValidJSON = _isValidJSON;

    var _QueryStringToJSON = function (sValue) {
        var parameters = {};
        if (_GetLength(sValue) > 1) {
            sValue.replace(/(\w+)=([^&]*)/gi, function (str, key, value) {
                parameters[key] = value;
            });
        }
        return parameters;
    };
    utilObject.QueryStringToJSON = _QueryStringToJSON;

    // Get Query String key value pair object 
    var _GetQueryStringParams = function () {
        var PageName = _CurrentPageName();
        if (_CacheItems.hasOwnProperty(PageName)) {
            return _CacheItems[PageName];
        }
        else {
            _CacheItems[PageName] = _QueryStringToJSON(window.location.search);
            return _CacheItems[PageName];
        }
    };
    utilObject.GetQueryStringParams = _GetQueryStringParams;

    // Get value of case insensitive query string variable with key from URL
    var _GetQueryParam = function (sQueryParam) {
        if (_isSafe(sQueryParam) && _isString(sQueryParam)) {
            var params = _GetQueryStringParams();
            for (var paramName in params) {
                if (params.hasOwnProperty(paramName)) {
                    if (paramName.toLowerCase() === sQueryParam.toLowerCase()) {
                        return params[paramName];
                    }
                }
            }
            return null;
        }
    };
    utilObject.GetQueryParam = _GetQueryParam;

    // Create a trim function if not given by browser
    var _Trim = function (sValue) {
        if (!_isString(sValue)) { return sValue; }
        if (typeof String.prototype.trim !== 'function') {
            return sValue.replace(/^\s+|\s+$/g, '');
        }
        return sValue.trim();
    };
    utilObject.Trim = _Trim;

    // TODO: Override this function to make it more like String.Format("$ ###, ##.##"), 
    // something like this which 

    // Format a numeric digit by using comma separated, and attaching exponent part if not available
    var _FormatNumeric = function (sValue, iCommaAfterDigits, sExponentPart) {
        if (!_IsDecimal(sValue)) {
            return '';
        }
        sValue += '';
        sExponentPart = _isSafe(sExponentPart) ? sExponentPart : '';
        iCommaAfterDigits = _isSafe(iCommaAfterDigits) && _isNumber(iCommaAfterDigits) ? iCommaAfterDigits : 3;
        var x = sValue.split('.'),
            x1 = x[0],
            x2 = x.length > 1 ? '.' + x[1] : sExponentPart,
            rgx = new RegExp("(\\d+)(\\d{" + iCommaAfterDigits + "})");
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    };
    utilObject.FormatNumeric = _FormatNumeric;

    // Format a number by adding comma after certain digits
    var _FormatNumber = function (sValue, iCommaAfterDigits) {
        return _FormatNumeric(sValue, (_isSafe(iCommaAfterDigits) ? iCommaAfterDigits : 3));
    };
    utilObject.FormatNumber = _FormatNumber;

    // Format LC Amount
    var _FormatAmountLC = function (sValue) {
        var FormattedValue = _FormatNumeric(sValue, 3, ".00"),
            ExponentIndex = _GetIndex(".", FormattedValue);
        return FormattedValue.substring(0, ExponentIndex + 3);
    };
    utilObject.FormatAmountLC = _FormatAmountLC;

    // Format CD Amount
    var _FormatAmountCD = function (sValue) {
        var LCFormatValue = _FormatAmountLC(sValue);
        if (_GetLength(_Trim(LCFormatValue)) > 0) {
            if (_isNegative(LCFormatValue)) {
                return LCFormatValue.replace("-", "-$");
            }
            else {
                return "$" + LCFormatValue;
            }
        }
        return LCFormatValue;
    };
    utilObject.FormatAmountCD = _FormatAmountCD;

    // Format Date
    var _FormatDate = function (sValue) {
        var oDate = new Date(sValue);
        if (_isSafe(oDate)) {
            return oDate.format("MM/dd/yyyy");
        }
        return sValue;
    };
    utilObject.FormatDate = _FormatDate;

    var _isNegative = function (sValue) {
        return ((sValue + "").indexOf("-") === 0);
    };
    utilObject.IsNegative = _isNegative;

    // Walks in an array and calling a callback function for each element of array
    var _Walk = function (aValue, fnCallBack) {
        if (_isSafe(aValue) && _isArray(aValue)) {
            for (var Index = 0; Index < aValue.length; Index++) {
                if (_isFunction(fnCallBack)) {
                    fnCallBack(aValue[Index], Index, aValue);
                }
            }
        }
        return aValue;
    };
    utilObject.Walk = _Walk;

    // Filter all values of array and will keep only those values for which callback returns true
    var _Filter = function (aValue, fnFilterCallback) {
        var aClone = [];
        _Walk(aValue, function (Value, Index, aValue) {
            fnFilterCallback(Value, Index, aValue) && aClone.push(Value);
        });
        return aClone;
    };
    utilObject.Filter = _Filter;

    // Call a user defined for each value in an array and keeps the modified value returned
    var _Modify = function (aValue, fnCallback) {
        if (_isFunction(fnCallback)) {
            _Walk(aValue, function (Value, Index, aValue) {
                aValue[Index] = fnCallback(Value, Index, aValue);
            });
        }
        return aValue;
    };
    utilObject.Modify = _Modify;

    // Private Callback to Trim all the values in an array
    var _TrimCallback = function (Value, Index, aValue) {
        aValue[Index] = _Trim(Value);
    };

    // Trim all the values in an array
    var _TrimValues = function (aValue) {
        _Walk(aValue, _TrimCallback);
        return aValue;
    };
    utilObject.TrimValues = _TrimValues;

    // Private callback to determine which value is empty
    var _RemoveEmptyCallback = function (Value, Index, aValue) {
        return _GetLength(_Trim(Value)) > 0;
    };

    // Remove all empty values from an array and returns a new array keeping original array intact
    var _RemoveEmptyValues = function (aValue) {
        return _Filter(aValue, _RemoveEmptyCallback);
    };
    utilObject.RemoveEmptyValues = _RemoveEmptyValues;

    // Remove \r, \n and \t from a string 
    var _RemoveCRLF = function (sValue) {
        if (_isSafe(sValue) && _isString(sValue)) {
            return _Trim(sValue.replace(/[\n\r\t]/g, ""));
        }
        return sValue;
    };
    utilObject.RemoveCRLFTab = _RemoveCRLF;

    // This function remove all carriage return and line feed, extra whitespaces from start and end of characters 
    // from the string provided, using regular expressions
    var _RemoveCRLFAndTrim = function (aValue) {
        return _Modify(aValue, _RemoveCRLF);
    };
    utilObject.RemoveCRLFAndTrim = _RemoveCRLFAndTrim;
    utilObject.RemoveCRLFTabAndTrim = _RemoveCRLFAndTrim;

    // Private options to pepper JS orthodox split function
    utilObject.StringSplitOptions = {};
    utilObject.StringSplitOptions.Trim = _TrimValues;
    utilObject.StringSplitOptions.RemoveEmpty = _RemoveEmptyValues;
    utilObject.StringSplitOptions.RemoveCRLFAndTrim = _RemoveCRLFAndTrim;

    // Split a given string with additional options with split string
    var _Split = function (sValue, sSeparator, oSplitOptions) {
        if (_isSafe(sValue) && _isString(sValue)) {
            // TODO: change this implementation to use regular expression to split by using replace method with callback option
            var aValue = sValue.split(sSeparator);
            if (_isFunction(oSplitOptions)) {
                aValue = oSplitOptions(aValue);
            }
            return aValue;
        }
        return []; // return empty array if undefined, false, null or empty string is passed
    };
    utilObject.Split = _Split;

    // Check if a path exists in JSON or not, this returns an object with true or false result and value node with path value if exists
    var _IsPathExist = function (sPath, oValue) {
        // Check if values are string and JSON objects
        if (_isString(sPath) && _isObject(oValue)) {
            var aKeys = _Split(sPath, ".", utilObject.StringSplitOptions.Trim), i, oFinalPathVal = null;
            for (i in aKeys) {
                var sKey = aKeys[i];
                if (oValue.hasOwnProperty(sKey)) {
                    oValue = oValue[sKey];
                }
                else {
                    return { "result": false, "value": null };
                }
            }
            return { "result": true, "value": oValue };
        }
        return { "result": false, "value": null };
    };
    utilObject.IsPathExist = _IsPathExist;

    var _GetUniqueNumber = function () {
        return (new Date()).valueOf();
    };
    utilObject.GetUniqueNumber = _GetUniqueNumber;
    
    // function used to find the parent with given node name, 
    // if no name is specified then immediate parent is returned
    var _Parent = function (oDomElement, sNodeName) {
        if (_isSafe(oDomElement) && _isSafe(oDomElement.tagName)) {
            if (!_isSafe(sNodeName) || !_isString(sNodeName)) {
                return oDomElement.parentNode;
            }
            var oParent = oDomElement.parentNode;
            while (_isSafe(oParent) && oParent.tagName !== sNodeName) {
                oParent = oParent.parentNode;
            }
            return oParent;
        }
        return null;
    };
    utilObject.Parent = _Parent;

    /**
    * Return all methods and properties that are made public
    */
    return utilObject;
})();
