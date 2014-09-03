/*global Module,document*/
/// <reference path="Utils.min.js"/>
/** 
* This file handles logic generating pager inside an array of HTML container objects, or an HTML element id
*/
if (typeof Module === "undefined" || typeof Module.Utils === "undefined") {
    throw "Please load Module.Utils.js first";
}

Module.Pager = (function () {
    "use strict";
    // An object to hold all the public methods and properties
    var PublicObject = {},
	_PagerId = 1, // Private unique id to each pager on one page
    U = Module.Utils, // Shorthand for Module.Utils
    Pagers = {}, // Collection of all Pager in single page

    // Constructor for generating pager instance
	_GetPager = function (oConfig) {
	    // Private properties for pager
	    var Id = _PagerId++,
        DefaultConfig = {
            CurrentPage: 1,
            TotalResults: 0,
            PageSize: 10,
            ContainerSelector: '',
            NumberOfLinks: 10,
            PagingVariable: "page",
            PagerFormat: "{First} {Previous} {PageNumbers} {Next} {Last} {TotalPages} {pages}"
        },
	    // Merge user defined and default configurations
        oConfig = U.GetUserDefinedWithDefault(oConfig, DefaultConfig),

	    // Set all configuration values to default values, till render() is called
	    CurrentPage = DefaultConfig.CurrentPage,
        IndexLimit = DefaultConfig.TotalResults,
        PageSize = DefaultConfig.PageSize,
        TotalPages = Math.ceil(IndexLimit / PageSize),

	    // A list of values passed for Page Size drop down
        PagerDropDownValues = [],

	    // We need to call this function to set the initialization variables to correct value every time any event occurs. for example, update via AJAX call, change in page numbers, etc.
	    _init = function (oPager) {
	        oPager.SetCurrentPage(parseInt(oConfig.CurrentPage, 10));
	        oPager.SetPageSize(parseInt(oConfig.PageSize, 10));
	        IndexLimit = parseInt(oConfig.TotalResults, 10);
	        TotalPages = Math.ceil(IndexLimit / PageSize);
	        // Get all HTML container in which to place this pager
	        oPager.aPagingContainers = document.querySelectorAll(oConfig.ContainerSelector);
	    },

	    // Parse string given by user for Pager Format and convert it to JSON object
        _ParsePagerFormat = function (sFormat) {
            var oPlaceHolders = sFormat.match(/{([^}]+)}/gi), rPlaceHolderWithAttrs = /\{(\w+?)\[(.+[^\]])\]\}/gi, rPlaceHolder = /\{(\w+)\}/gi, i = 0;
            for (; i < oPlaceHolders.length; i++) {
                // see if  attributes are defined with Placeholders
                if (oPlaceHolders[i].match(rPlaceHolderWithAttrs)) {
                    oPlaceHolders[i] = oPlaceHolders[i].replace(rPlaceHolderWithAttrs, function (matchedGroup, placeHolderName, attrValue) {
                        return '{"PlaceHolderName":"' + placeHolderName + '", "Attributes":"' + attrValue + '"}';
                    });
                }
                    // else only name of placeholders are defined
                else if (oPlaceHolders[i].match(rPlaceHolder)) {
                    oPlaceHolders[i] = oPlaceHolders[i].replace(rPlaceHolder, function (matchedGroup, placeHolderName) {
                        return '{"PlaceHolderName":"' + placeHolderName + '", "Attributes":""}';
                    });
                }
                oPlaceHolders[i] = JSON.parse(oPlaceHolders[i]);
            }
            return oPlaceHolders;
        },

	    // Private functions to generate HTML for Pager parts as per configuration defined by PagerFormat public property
	    // TODO: Move these functions out of this file and add one more parameter as Module.Pager object, so anyone can add any type of placeholder and can override anyone of these
	    _GetFirstLinkHTML = function (oAttr, start, end, oPager) {
	        if (start != end) {
	            // We are doing this at function level because each and every function will implement attributes functionality differently
	            var sfirstLink = '', sAttrJoined = U.JoinJSON(oAttr, "=", " ", ["text"]), i = 1, sFirstText = unescape((oAttr.hasOwnProperty("text") ? oAttr["text"] : i));
	            if (oPager.GetCurrentPage() > 1) {
	                sfirstLink = '<a href="#?' + oConfig.PagingVariable + '=' + i + '" title="Go to page ' + i + '" ' + sAttrJoined + '>' + sFirstText + '</a>';
	            }
	            else {
	                sfirstLink = '<span ' + sAttrJoined + '>' + sFirstText + '</span>';
	            }
	            return sfirstLink;
	        }
	        return '';
	    },

        _GetPreviousLinkHTML = function (oAttr, start, end, oPager) {
            if (start != end) {
                var sPreviousLink = '', sAttrJoined = U.JoinJSON(oAttr, "=", " ", ["text"]), i, sPreviousText = unescape((oAttr.hasOwnProperty("text") ? oAttr["text"] : "&lt;&lt;"));
                if (oPager.GetCurrentPage() == 1) {
                    sPreviousLink = '<span ' + sAttrJoined + '>' + sPreviousText + '</span>';
                } else {
                    i = oPager.GetCurrentPage() - 1;
                    sPreviousLink = '<a href="#?' + oConfig.PagingVariable + '=' + i + '" title="Go to previous page" ' + sAttrJoined + '>' + sPreviousText + '</a>';
                }
                return sPreviousLink;
            }
            return '';
        },

        _GetPageNumbersHTML = function (oAttr, start, end, oPager) {
            if (start != end) {
                var sPageNumbers = '', sAttrJoined = U.JoinJSON(oAttr, "=", " ", ""), i;
                for (i = start; i <= end && i <= TotalPages; i++) {
                    if (i == oPager.GetCurrentPage()) {
                        sPageNumbers += '<span ' + sAttrJoined + '>' + i + '</span>';
                    } else {
                        sPageNumbers += '<a href="#?' + oConfig.PagingVariable + '=' + i + '" title="Go to page ' + i + '" ' + sAttrJoined + '>' + i + '</a>';
                    }
                }
                return sPageNumbers;
            }
            return '';
        },

        _GetNextLinkHTML = function (oAttr, start, end, oPager) {
            if (start != end) {
                var sNextLink = '', sAttrJoined = U.JoinJSON(oAttr, "=", " ", ["text"]), i, sNextText = unescape((oAttr.hasOwnProperty("text") ? oAttr["text"] : "&gt;&gt;"));
                if (oPager.GetCurrentPage() < TotalPages) {
                    i = oPager.GetCurrentPage() + 1;
                    sNextLink = '<a href="#?' + oConfig.PagingVariable + '=' + i + '" title="Go to next page" ' + sAttrJoined + '>' + sNextText + '</a>';
                } else {
                    sNextLink = '<span ' + sAttrJoined + '>' + sNextText + '</span>';
                }
                return sNextLink;
            }
            return '';
        },

        _GetLastLinkHTML = function (oAttr, start, end, oPager) {
            if (start != end) {
                var sLastLink = '', sAttrJoined = U.JoinJSON(oAttr, "=", " ", ["text"]), i = TotalPages, sLastText = unescape((oAttr.hasOwnProperty("text") ? oAttr["text"] : i));
                if (TotalPages === oPager.GetCurrentPage()) {
                    sLastLink = '<span ' + sAttrJoined + '>' + sLastText + '</span>';
                }
                else {
                    sLastLink = '<a href="#?' + oConfig.PagingVariable + '=' + i + '" title="Go to page ' + i + '" ' + sAttrJoined + '>' + sLastText + '</a>';
                }
                return sLastLink;
            }
            return '';
        },

        _GetPageSizeDropdownHTML = function (oAttr, start, end, oPager) {
            var sPagerDropdown = '',
                sAttrJoined = U.JoinJSON(oAttr, "=", " ", ["text", "values"]),
                sDropdownText = unescape((oAttr.hasOwnProperty("text") ? oAttr["text"] : '')),
                aDefaultPagerValues = [10, 20, 50], //  used as Default page size
                aUserDefinedPageSize = (function (sValues) {
                    var aKeyValues = [], aValue, i = 0, oPair = [];
                    if (U.Length(sValues) > 0) {
                        aValue = sValues.split(',');
                        if (U.IsSafe(aValue)) {
                            for (; i < aValue.length; i++) {
                                if (U.Length(aValue) > 0) {
                                    // We found a key value pair to specify drop down values
                                    if (U.IndexOf(':', aValue[i]) > 0) {
                                        oPair = aValue[i].split(':');
                                        aKeyValues.push({ "Key": U.Trim(oPair[0]).replace("'", ""), "Value": U.Trim(oPair[1]).replace("'", "") });
                                    }
                                    // Values is used as both key and value
                                    else {
                                        aKeyValues.push({ "Key": U.Trim(aValue[i]).replace("'", ""), "Value": U.Trim(aValue[i]).replace("'", "") });
                                    }
                                }
                            }
                        }
                    }
                    return aKeyValues;
                })(oAttr.hasOwnProperty("values") ? oAttr["values"] : ''),
                i = 0, sSelectString = 'selected="selected"';
            // Add text if any
            sPagerDropdown = sDropdownText;
            // If nothing is defined by user, use default array
            if (!(U.Length(aUserDefinedPageSize) > 0)) {
                aUserDefinedPageSize = aDefaultPagerValues;
            }
            // start Adding values provided by user, if no values, use Default Values
            sPagerDropdown += '<select ' + sAttrJoined + '>';

            // set Internal pager property for drop down values

            for (; i < aUserDefinedPageSize.length; i++) {
                // Object is used so we have key value pair defined
                if (U.IsObject(aUserDefinedPageSize[i])) {
                    sPagerDropdown += '<option value=' + aUserDefinedPageSize[i]["Value"] + ' ' + ((aUserDefinedPageSize[i]["Value"] == oConfig.PageSize) ? sSelectString : "") + '>' + aUserDefinedPageSize[i]["Key"] + '</option>';
                }
                    // otherwise we have an array of values defined i.e default value
                else {
                    sPagerDropdown += '<option value=' + aUserDefinedPageSize[i] + '' + ((aUserDefinedPageSize[i] == oConfig.PageSize) ? sSelectString : "") + '>' + aUserDefinedPageSize[i] + '</option>';
                }
            }
            sPagerDropdown += '</select>';

            return sPagerDropdown;
        },

        _GetTotalResultsHTML = function (oAttr, oPager) {
            var sTotalResult = '', sAttrJoined = U.JoinJSON(oAttr, "=", " ", '');
            sTotalResult = '<span ' + sAttrJoined + '> ' + oConfig.TotalResults + '</span>';
            return sTotalResult;
        },

        _GetTotalPagesHTML = function (oAttr, oPager) {
            var sTotalPages = '', sAttrJoined = U.JoinJSON(oAttr, "=", " ", '');
            sTotalPages = '<span ' + sAttrJoined + '>' + TotalPages + '</span>';
            return sTotalPages;
        },

        _GetTextHTML = function (oAttr, start, end, oPager) {
            var sTextData = '', sAttrJoined = U.JoinJSON(oAttr, "=", " ", ["text"]), sText = (oAttr.hasOwnProperty("text") ? oAttr["text"] : '');
            sTextData = '<span ' + sAttrJoined + '>' + unescape(sText) + '</span>';
            return sTextData;
        },

	    _GetPrevPagesLinkHTML = function (oAttr, start, end, oPager) {
	        if (start != end) {
	            var sPrevLink = '', i = start - 1, sAttrJoined = U.JoinJSON(oAttr, "=", " ", ["text"]), sLastText = (oAttr.hasOwnProperty("text") ? oAttr["text"] : i);
	            if (parseInt(oPager.GetCurrentPage() / oConfig.NumberOfLinks, 10) > 1 || (parseInt(oPager.GetCurrentPage() / oConfig.NumberOfLinks, 10) > 0 && parseInt(oPager.GetCurrentPage() % oConfig.NumberOfLinks, 10) > 0)) {
	                sPrevLink = '<a href="#?' + oConfig.PagingVariable + '=' + i + '" title="Show Previous Pages" ' + sAttrJoined + '>' + sLastText + '</a>';
	            }
	            else {
	                sPrevLink = '<span ' + sAttrJoined + '>&nbsp;</span>';
	            }
	            return sPrevLink;
	        }
	        return '';
	    },

        _GetNextPagesLinkHTML = function (oAttr, start, end, oPager) {
            if (start != end) {
                var sNextLink = '', sAttrJoined = U.JoinJSON(oAttr, "=", " ", ["text"]), i = end + 1, sLastText = (oAttr.hasOwnProperty("text") ? oAttr["text"] : i);
                if (end < TotalPages) {
                    sNextLink = '<a href="#?' + oConfig.PagingVariable + '=' + i + '" title="Show Next Pages" ' + sAttrJoined + '>' + sLastText + '</a>';
                }
                else {
                    sNextLink = '<span ' + sAttrJoined + '>&nbsp;</span>';
                }
                return sNextLink;
            }
            return '';
        },

        _GetCurrentPageHTML = function (oAttr, start, end, oPager) {
            var sCurrentPage = '', sAttrJoined = U.JoinJSON(oAttr, "=", " ", '');
            sCurrentPage = '<span ' + sAttrJoined + '>' + oPager.GetCurrentPage() + '</span>';
            return sCurrentPage;
        },

        _GetPageNavigatorHTML = function (oAttr, start, end, oPager) {
            var sPagenavigator = '', sAttrJoined = U.JoinJSON(oAttr, "=", " ", '');
            sPagenavigator = '<input type="text" value="' + oPager.GetCurrentPage() + '" ' + sAttrJoined + '/> ';
            return sPagenavigator;
        },

	    // Private stack holding object with name of placeholder and function of placeholder to call for pager format
	    PlaceHolders = [],

        // call individual handlers for image, link and drop down
        _HandleLinkClick = function (event, oDomElement, oPager) {
            var parameters = {}, iSelectedPage, sPagingVariable, sHref = oDomElement.getAttribute("href");
            sHref.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (str, key, value) {
                parameters[key] = value;
            });
            sPagingVariable = parameters[oPager.GetPagingVariable()];
            iSelectedPage = U.IsNumber(sPagingVariable) ? parseInt(sPagingVariable, 10) : 1;
            oPager.SetCurrentPage(iSelectedPage).Render();
            event.preventDefault();
            return true; // return true to continue fire public change event
        },

        _HandleImageClick = function (event, oDomElement, oPager) {
            var oDomParentLink = U.Parent(oDomElement, 'A');
            return _HandleLinkClick(event, oDomParentLink, oPager);
        },

        _HandleDropDownChange = function (event, oDomElement, oPager) {
            var iSelectedPageSize = oDomElement.value;
            iSelectedPageSize = U.IsNumber(iSelectedPageSize) ? parseInt(iSelectedPageSize, 10) : oConfig.PageSize;
            oPager.SetPageSize(iSelectedPageSize).SetCurrentPage(1).Render();
            return true; // return true to continue fire public change event
        },

        _HandleNavigatorChange = function (event, oDomElement, oPager) {
            // Handle all the changes done by entering values in textbox
            // Check if event that fired this change is blur event or if it is keydown, then it should be work only for "return" key
            if ((event.type === "keydown" && ((event.keyCode || event.which) === 13)) || event.type === "blur") {
                // Get the value of textbox
                var nEnteredPageNumber = parseInt(oDomElement.value, 10);
                // check if the value entered is signed integer and is within range of current pager
                if (U.IsNumber(nEnteredPageNumber) && nEnteredPageNumber <= TotalPages) {
                    oPager.SetCurrentPage(nEnteredPageNumber).Render();
                    event.preventDefault();
                    return true;
                }
                // return false if not
                return false;
            }
            return false;
        },

	    // Call this function if anything changes in pager and then change pager accordingly, call another function for user hook also, which user can modify
        OnPagerChange = function (event, oPager) {
            var HtmlElement = (event.srcElement) ? event.srcElement : event.target,
                // Map for html element and corresponding handler
                oSourceHandlerMap = {
                    // if any page number is requested
                    "A": _HandleLinkClick,
                    // Considering images are placed inside the links
                    "IMG": _HandleImageClick,
                    // when page size drop down is changed
                    "SELECT": _HandleDropDownChange,
                    // when value is entered in textbox or on blur event
                    "INPUT": _HandleNavigatorChange
                },
                // a flag to track if the page change event needs to be invoked
                // We will set this flag from the output of the corresponding change handler
                bExecuteRequest = false;
            
            if (oSourceHandlerMap.hasOwnProperty(HtmlElement.tagName)) {
                bExecuteRequest = U.IsFunction(oSourceHandlerMap[HtmlElement.tagName]) ? oSourceHandlerMap[HtmlElement.tagName](event, HtmlElement, oPager) : U.Log("No handler attached with " + HtmlElement.tagName);
            }
            if (bExecuteRequest) {
                oPager.OnChangeRequest(event);
            }
        },
      
	    _AttachPagerEventHandlers = function (aContainers, isEventBubbled, oPager) {
	        if (U.IsSafe(aContainers)) {
	            var i = 0, oPagerElements, sNodeName, j = 0, sEventType = 'click';
	            for (; i < aContainers.length; i++) {
	                oPagerElements = aContainers[i];
	                if (U.IsSafe(oPagerElements)) {
	                    var oPagerChildElements = oPagerElements.childNodes;
	                    for (j = 0; j < oPagerChildElements.length; j++) {
	                        var bDoAttach = false;
	                        sNodeName = oPagerChildElements[j].tagName;
	                        //attach event handlers to it
	                        if (sNodeName === "A" || sNodeName === "IMG") {
	                            bDoAttach = true;
	                            sEventType = 'click';
	                        }
	                        else if (sNodeName === "SELECT") {
	                            bDoAttach = true;
	                            sEventType = 'change';
	                        }
	                        else if (sNodeName === "INPUT") {
	                            bDoAttach = true;
	                            // Add one event handler here and add another in next block
	                            oPagerChildElements[j].addEventListener('keydown', function (event) {
	                                // Call OnChangeRequest function of current object
	                                OnPagerChange(event, oPager);
	                            }, isEventBubbled);
	                            sEventType = 'blur';
	                        }
	                        if (bDoAttach) {
	                            oPagerChildElements[j].addEventListener(sEventType, function (event) {
	                                // Call OnChangeRequest function of current object
	                                OnPagerChange(event, oPager);
	                            }, isEventBubbled);
	                        }
	                    }
	                }
	            }
	        }
	    },

        _SetContainerInnerHTML = function (sPagerString, aContainer) {
            if (U.IsSafe(aContainer)) {
                // iterate over all of them and then add that string to inner html of all container
                for (var i = 0; i < aContainer.length; i++) {
                    aContainer[i].innerHTML = sPagerString;
                }
            }
        };

	    // Public methods and properties start from here

	    this.GetPagingVariable = function () {
	        return oConfig.PagingVariable;
	    };

	    /* Apart from calling constructor of Pager class, this needs to be called directly from user code, 
	    * to set different configuration variables and pass changed configuration values, same as in constructor
	    * We will keep passing current pager object to internal functions in order to avoid "Current scope" mismatch
	    */
	    this.SetConfigVariables = function (oUserChangedConfig) {
	        // Merge user defined and default configurations
	        oConfig = U.GetUserDefinedWithDefault(oUserChangedConfig, oConfig);
	        _init(this);
	        return this;
	    };

	    this.GetConfigVariable = function () {
	        return oConfig;
	    };

	    this.GetCurrentPage = function () {
	        if (U.IsNumber(CurrentPage)) {
	            var currentNumber = parseInt(CurrentPage, 10);
	            return (!isNaN(currentNumber) ? currentNumber : DefaultConfig.CurrentPage);
	        }
	        return null;
	    };

	    this.SetCurrentPage = function (iPageNum) {
	        if (U.IsNumber(iPageNum)) {
	            CurrentPage = iPageNum;
	            oConfig.CurrentPage = iPageNum;
	            return this; // return an object from here, to allow method chaining
	        }
	        else {
	            throw "Page number passed " + iPageNum + " is not a number";
	        }
	    };

	    this.SetPageSize = function (iPageSize) {
	        if (U.IsNumber(iPageSize)) {
	            oConfig.PageSize = PageSize = iPageSize;
	            TotalPages = Math.ceil(IndexLimit / PageSize);
	            if (this.GetCurrentPage() > TotalPages) {
	                this.SetCurrentPage((TotalPages === 0) ? 1 : TotalPages);
	            }
	            return this; // return an object from here, to allow method chaining
	        }
	        else {
	            throw "Page size passed " + iPageSize + " is not a number";
	        }
	    };

	    this.GetPageSize = function () {
	        if (U.IsNumber(PageSize)) {
	            var currentNumber = parseInt(PageSize, 10);
	            return (!isNaN(currentNumber) ? currentNumber : 1);
	        }
	        return null;
	    };


	    // Public methods to hook and override
	    this.OnChangeRequest = function (event) {
	        var currentState = 'pageSize=' + this.GetPageSize() + '&' + this.GetPagingVariable() + '=' + this.GetCurrentPage();
	        return currentState;
	    };

	    this.GetTotalResults = function () {
	        return parseInt(oConfig.TotalResults, 10);
	    };

	    this.GetTotalPages = function () {
	        return TotalPages;
	    };

	    // Unique Id for each pager. This is only used to expose current pager id to user, another private variable is used as unique id which user cannot modify
	    this.Id = Id;

	    // Hash to map Function and Placeholder used to generate HTML, We made this public so that others can add their own functions to call and their own placeholders
	    this.PlaceHolderFunction = {
	        "First": _GetFirstLinkHTML,
	        "Previous": _GetPreviousLinkHTML,
	        "PageNumbers": _GetPageNumbersHTML,
	        "Next": _GetNextLinkHTML,
	        "Last": _GetLastLinkHTML,
	        "PagerDropDown": _GetPageSizeDropdownHTML,
	        "TotalResults": _GetTotalResultsHTML,
	        "TotalPages": _GetTotalPagesHTML,
	        "ShowText": _GetTextHTML,
	        "PrevPages": _GetPrevPagesLinkHTML,
	        "NextPages": _GetNextPagesLinkHTML,
	        "CurrentPage": _GetCurrentPageHTML,
            "PageNavigator":_GetPageNavigatorHTML
	    };

	    // Add event handlers to call before start generating HTML for each place holder
	    this.OnFirst = this.OnPrevious = this.OnPageNumbers = this.OnNext =
            this.OnLast = this.OnPagerDropDown = this.OnTotalResults = this.OnTotalPages =
            this.OnShowText = this.OnPrevPages = this.OnNextPages = this.OnCurrentPage =
            this.OnPageNavigator = null;

	    // Generates Pager and adds it to the array of HTML elements or to a given element Id
	    this.Render = function () {
	        var nOffset = parseInt(this.GetCurrentPage() % oConfig.NumberOfLinks, 10);
	        var nAddExtra = 1;
	        if (nOffset === 0) {
	            nOffset = oConfig.NumberOfLinks;
	        }
	        var start = this.GetCurrentPage() - nOffset + nAddExtra, key = '', i = 0,
            end = start + oConfig.NumberOfLinks - 1, PagerString = '', PlaceHolderSettings = {};

	        // Add all Placeholders to stack of objects to use them later to generate HTML
	        PlaceHolders = _ParsePagerFormat(oConfig.PagerFormat);
	        for (; i < PlaceHolders.length; i++) {
	            PlaceHolderSettings = PlaceHolders[i];
	            if (PlaceHolderSettings.hasOwnProperty("PlaceHolderName") && PlaceHolderSettings.hasOwnProperty("Attributes")) {
	                // We found placeholder that has an associated function to generate html
	                if (PlaceHolderSettings["PlaceHolderName"] in this.PlaceHolderFunction) {
	                    var oAttr = U.QueryStringToJSON(PlaceHolderSettings["Attributes"]),
                            // We have defined associated function names starting with On, along with place holder name
	                        sEventName = "On" + PlaceHolderSettings["PlaceHolderName"];
	                    // Call associated event before generating the HTML for that element
	                    if (this.hasOwnProperty(sEventName) && U.IsFunction(this[sEventName])) {
	                        oAttr = this[sEventName](oAttr, this);
	                    }
	                    // Call associated function and pass attributes as parameter to this function, and add returned string to Pager String
	                    PagerString += this.PlaceHolderFunction[PlaceHolderSettings["PlaceHolderName"]](oAttr, start, end, this);
	                }
	                    // Add name as it is, if we don't have any associated function
	                else {
	                    PagerString += PlaceHolderSettings["PlaceHolderName"];
	                }
	            }
	        }

	        // Fill all containers
	        _SetContainerInnerHTML(PagerString, this.aPagingContainers);

	        // Attach event handlers
	        _AttachPagerEventHandlers(this.aPagingContainers, false, this);

	        Pagers[Id] = { "Configuration": oConfig, "PagerObject": this };

	        return this; // Support method chaining
	    };

	    this.Destroy = function () {
	        _SetContainerInnerHTML('', this.aPagingContainers);
	    };

	    // Call init
	    _init(this);

	    return this;
	};

    // Define Public methods and properties
    PublicObject.GetPager = _GetPager;
    PublicObject.Pagers = Pagers;

    return PublicObject;
})();