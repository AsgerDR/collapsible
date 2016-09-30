/*
 * Collapsible widget
 * https://github.com/filamentgroup/collapsible
 * Copyright (c) 2014 Filament Group, Inc.
 * Licensed under the MIT, GPL licenses.
 */

;(function ($, window, document, undefined) {

	// Defaults
	var pluginName = "collapsible";
	var idInt = 0;
	// overrideable defaults
	var defaults = {
		pluginClass: pluginName,
		collapsedClass: pluginName + "-collapsed",
		expandedClass: pluginName + "-expanded", // NOTE: don't use this class for showing/hiding collapsible-content. Instead, use it for expanded visual exceptions.
		headerClass: pluginName + "-header",
		contentClass: pluginName + "-content",
		enhancedClass: pluginName + "-enhanced",
		instructions: "Use space or enter key to expand menu content.",
		collapsed: false
	};

	// plugin constructor
	function Plugin(element, options) {
		this.element = $( element );
		var self = this,
			dataOptions = {};

		// Allow data-attr option setting
		if( this.element.is( "[data-config]" ) ){
			for( var option in defaults ){
					if( defaults.hasOwnProperty( option) ){
					var value = self.element.attr( "data-" + option.replace( /[A-Z]/g, function( c ) {
									return "-" + c.toLowerCase();
								}));

					if ( value !== undefined ) {
						if( value === "true" || value === "false" ){
							dataOptions[ option ] = value === "true";
						}
						else {
							dataOptions[ option ] = value;
						}
					}
				}
			}
		}



		this.options = $.extend( {}, defaults, dataOptions, options );

		// allow the collapsedClass to set the option if specified
		if( this.element.is( "." + this.options.collapsedClass ) ){
			this.options.collapsed= true;
		}

		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	Plugin.prototype = {
		init: function () {
			this.header = this.element.children().filter( "." + this.options.headerClass );
			if( !this.header.length ){
				this.header = this.element.children().eq( 0 );
			}
			this.content = this.element.children().filter( "." + this.options.contentClass );
			if( !this.content.length ){
				this.content = this.header.next();
			}
			this._addAttributes();
			this._bindEvents();
			idInt++;
			this.element.data( pluginName, this );
			this.element.trigger( "init" );
		},

		_addAttributes: function(){
			this.element
				.addClass( this.options.pluginClass )
				.addClass( this.options.enhancedClass );

			this.header.addClass( this.options.headerClass );

			if( this.options.instructions ){
				this.header.attr( "aria-label", this.options.instructions );
			}

			this.header.attr( "role", "button" );

			this.header.attr( "tabindex", "0" );

			this.content.addClass( this.options.contentClass );

		},

		_bindEvents: function(){
			var self = this;

			this.header
				// use the tappy plugin if it's available
				// tap can't be namespaced yet without special events api: https://github.com/filamentgroup/tappy/issues/22
				.bind( ( window.tappy ? "tap" : "click" ), function( e ){
					self.toggle( e.target );
					e.preventDefault();
				})
				.bind( "keydown." + pluginName, function( e ){
					if( e.which === 13 || e.which === 32 ){
						self.toggle( e.target );
						e.preventDefault();
					}
				});

			if( this.options.collapsed ){
				this._collapse();
			}
			else {
				this._expand();
			}
		},

		collapsed: false,

		// used internally to expand without triggering events (for init)
		_expand: function() {
			this.element.removeClass( this.options.collapsedClass );
			this.element.addClass( this.options.expandedClass );
			this.element.attr( "aria-expanded", "true" );
			this.collapsed = false;
		},

		expand: function () {
			var self = $( this ).data( pluginName ) || this;
			self._expand();
			self.element.trigger( "expand" );
		},

		// used internally to expand without triggering events (for init)
		_collapse: function() {
			this.element.addClass( this.options.collapsedClass );
			this.element.removeClass( this.options.expandedClass );
			this.element.attr( "aria-expanded", "false" );
			this.collapsed = true;
		},

		collapse: function() {
			var self = $( this ).data( pluginName ) || this;
			self._collapse();
			self.element.trigger( "collapse" );
		},

		toggle: function(){
			if(  this.collapsed ){
				this.expand();
			} else {
				this.collapse();
			}
		},

		focusable: "a, input, textarea, select, button, [tabindex='0']"



	};

	// lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[ pluginName ] = function (options) {
		return this.each(function () {
			if ( !$( this ).data( pluginName ) ) {
				new Plugin( this, options );
			}
		});
	};

	// Simple auto-init by selector that runs when the dom is ready. Trigger "enhance" if desirable.
	$( document ).bind( "enhance", function( e ){
		var selector = "." + pluginName;
		$( $( e.target ).is( selector ) && e.target ).add( selector, e.target ).filter( selector )[ pluginName ]();
	});

})(jQuery, window, document);
