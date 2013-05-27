/**
 * Main search page handler.
 * Connects to the page, form & buttons. Deals with launching searches.
 * @param results_handler: an alternative result handler.
 */
function SearchPage(results_handler) {

	//hold the tab object
	this._tab = null;

	//hold signals for the page
	this._signals = new Array();

	//hold status message for the page
	this._prompt = null;

	// Hold the list of search providers
	this._providers = new Array();

	// Hold a list of the current async searching providers
	this._async_results = new Array();

	this._results = results_handler || new SearchResults();

	this._root = getElement('search-page');

	this._inited = false;

	this.init = function() {
		if (this._inited)
			return;

		this._tab = new Tab( "Search" );
		connect( this._tab, "onfocus", bind(this._onfocus, this) );
		connect( this._tab, "onblur", bind(this._onblur, this) );
		connect( this._tab, "onclickclose", bind(this._close, this) );

		tabbar.add_tab(this._tab);

		this._signals.push(connect( "search-clear-results", "onclick", bind(this._clear, this) ));
		this._signals.push(connect( "search-form", "onsubmit", bind(this._search, this) ));
		this._signals.push(connect( "search-close", "onclick", bind(this._close, this) ));

		this._inited = true;

		this.clear_results();
		tabbar.switch_to(this._tab);
	}

	this._onfocus = function() {
		showElement(this._root);
	}

	this._onblur = function() {
		hideElement(this._root);
	}

	this._clear = function(ev) {
		this.clear_results();
	}

	this.clear_results = function() {
		this._results.clear();
	}

	this.cancel_searches = function() {
		for (var i=0; i < this._async_results.length; i++) {
			var provider = this._async_results[i];
			provider.cancel_current();
		}
		this._async_results = new Array();
	}

	this.mark_complete = function(provider) {
		// Ruddy IE 8 doesn't support indexOf
		var index = findValue(this._async_results, provider);
		this._async_results.splice(index, 1);
	}

	this._search = function(ev) {
		kill_event(ev);
		var query = getElement('search-query').value;
		this.search(query);
	}

	this.search = function(query) {
		this.cancel_searches();
		this.clear_results();
		for (var i=0; i < this._providers.length; i++) {
			var provider = this._providers[i];
			var async = provider.search(this, query);
			if (async) {
				this._async_results.push(provider);
			}
		}
	}

	this.add_result = function(section, result) {
		this._results.add(section, result);
	}

	this.add_provider = function(provider) {
		this._providers.push(provider);
	}

	this._close = function() {
		if (!this._inited)
			return;

		this._clear();

		this._tab.close();

		if( this._prompt != null ) {
			this._prompt.close();
			this._prompt = null;
		}

		for (var i = 0; i < this._signals.length; i++) {
			disconnect(this._signals[i]);
		}
		this._signals = new Array();

		this._inited = false;
	}
}

function SearchResults(root) {
	this._root = root || getElement('search-results');

	this.clear = function() {
		replaceChildNodes(this._root);
	}

	this.add = function(section, result) {
		logDebug("Adding result '" + result + "' in section '" + section + "'.");
	}
}

function MockProvider() {
	this.search = function(page, query) {
		page.add_result('Mock', 'foo ' + query + ' bar');
		return false;
	}
}
