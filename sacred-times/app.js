/*
	Sacred Times

	Copyright (c) 2018 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



var LANG = {} ,
	page = {} ,
	config = {
		mode: 'solar' ,
		fixedDateTime: null ,
		displaySeconds: false ,
		lang: 'fr'
	} ;



// We MUST add that BEFORE ready
domKit.appendJs( "lang/" + config.lang + ".js" ) ;

domKit.ready( () => {
	loadConfig() ;
	
	// Always reset to NOW
	config.fixedDateTime = null ;
	
	page.refreshTimer = null ;
	page.lastHourMin = null ;
	page.$bigTime = document.querySelector( 'big-time' ) ;
	page.$tinyDate = document.querySelector( 'tiny-date' ) ;
	page.$events = document.querySelector( 'events' ) ;
	page.$planet = document.querySelector( 'planet' ) ;

	page.$legalModeButton = document.querySelector( 'item.legal' ) ;
	page.$legalModeButton.addEventListener( 'click' , switchToLegalMode ) ;
	page.$solarModeButton = document.querySelector( 'item.solar' ) ;
	page.$solarModeButton.addEventListener( 'click' , switchToSolarMode ) ;
	page.$lunisolarModeButton = document.querySelector( 'item.lunisolar' ) ;
	page.$lunisolarModeButton.addEventListener( 'click' , switchToLuniSolarMode ) ;
	
	page.$backwardDay = document.querySelector( 'timeleap.backward.day' ) ;
	page.$backwardDay.addEventListener( 'click' , event => {
		if ( ! config.fixedDateTime ) {
			config.fixedDateTime = SacredTimes.moment() ;
		}
		
		if ( event.detail === 3 ) {
			config.fixedDateTime.add( 1 , "hour" ) ;
			config.fixedDateTime.subtract( 1 , "minute" ) ;
		}
		else if ( event.detail === 2 ) {
			config.fixedDateTime.add( 1 , "day" ) ;
			config.fixedDateTime.subtract( 1 , "hour" ) ;
		}
		else {
			config.fixedDateTime.subtract( 1 , "day" ) ;
		}
		
		debouncedFullRefresh() ;

	} ) ;

	page.$backwardMonth = document.querySelector( 'timeleap.backward.month' ) ;
	page.$backwardMonth.addEventListener( 'click' , event => {
		if ( ! config.fixedDateTime ) {
			config.fixedDateTime = SacredTimes.moment() ;
		}
		
		if ( event.detail === 2 ) {
			config.fixedDateTime.add( 1 , "month" ) ;
			config.fixedDateTime.subtract( 14 , "day" ) ;
		}
		else {
			config.fixedDateTime.subtract( 1 , "month" ) ;
		}
		
		debouncedFullRefresh() ;
	} ) ;

	page.$backwardYear = document.querySelector( 'timeleap.backward.year' ) ;
	page.$backwardYear.addEventListener( 'click' , event => {
		if ( ! config.fixedDateTime ) {
			config.fixedDateTime = SacredTimes.moment() ;
		}
		
		if ( event.detail === 3 ) {
			config.fixedDateTime.subtract( 90 , "year" ) ;
		}
		else if ( event.detail === 2 ) {
			config.fixedDateTime.subtract( 9 , "year" ) ;
		}
		else {
			config.fixedDateTime.subtract( 1 , "year" ) ;
		}
		
		debouncedFullRefresh() ;
	} ) ;

	page.$forwardDay = document.querySelector( 'timeleap.forward.day' ) ;
	page.$forwardDay.addEventListener( 'click' , event => {
		if ( ! config.fixedDateTime ) {
			config.fixedDateTime = SacredTimes.moment() ;
		}
		
		if ( event.detail === 3 ) {
			config.fixedDateTime.subtract( 1 , "hour" ) ;
			config.fixedDateTime.add( 1 , "minute" ) ;
		}
		else if ( event.detail === 2 ) {
			config.fixedDateTime.subtract( 1 , "day" ) ;
			config.fixedDateTime.add( 1 , "hour" ) ;
		}
		else {
			config.fixedDateTime.add( 1 , "day" ) ;
		}
		
		debouncedFullRefresh() ;
	} ) ;
	
	page.$forwardMonth = document.querySelector( 'timeleap.forward.month' ) ;
	page.$forwardMonth.addEventListener( 'click' , event => {
		if ( ! config.fixedDateTime ) {
			config.fixedDateTime = SacredTimes.moment() ;
		}
		
		if ( event.detail === 2 ) {
			config.fixedDateTime.subtract( 1 , "month" ) ;
			config.fixedDateTime.add( 14 , "day" ) ;
		}
		else {
			config.fixedDateTime.add( 1 , "month" ) ;
		}
		
		debouncedFullRefresh() ;
	} ) ;
	
	page.$forwardYear = document.querySelector( 'timeleap.forward.year' ) ;
	page.$forwardYear.addEventListener( 'click' , event => {
		if ( ! config.fixedDateTime ) {
			config.fixedDateTime = SacredTimes.moment() ;
		}
		
		if ( event.detail === 3 ) {
			config.fixedDateTime.add( 90 , "year" ) ;
		}
		else if ( event.detail === 2 ) {
			config.fixedDateTime.add( 9 , "year" ) ;
		}
		else {
			config.fixedDateTime.add( 1 , "year" ) ;
		}
		
		debouncedFullRefresh() ;
	} ) ;
	
	page.moon = new SvgPhase( {
		container: page.$planet ,
		imageUrl: "images/moon.png" ,
		imageScaleX: 1.02 ,
		imageScaleY: 1.02 ,
		shadowLight: 0 ,
		planetLight: 0.4 ,
		phase: 0.5
	} ) ;
	
	page.$bigTime.addEventListener( 'click' , event => {
		config.fixedDateTime = null ;
		fullRefresh() ;
	} ) ;
	
	page.$tinyDate.addEventListener( 'click' , event => {
		config.fixedDateTime = null ;
		fullRefresh() ;
	} ) ;

	switchToMode( config.mode ) ;
	
	refresh() ;
} ) ;



function refresh() {
	if ( page.refreshTimer ) {
		clearTimeout( page.refreshTimer ) ;
		page.refreshTimer = null ;
	}
	
	var dateTime = config.fixedDateTime || new Date() ;
	
	var sacredTimes = new SacredTimes( dateTime ) ,
		dateTime = getModeDateTime( sacredTimes ) ,
		currentHourMin = dateTime.format( 'HH:mm' ) ;
	
	if ( config.displaySeconds ) {
		page.$bigTime.textContent = dateTime.format( 'HH:mm:ss' ) ;
	}
	else {
		page.$bigTime.textContent = dateTime.format( 'HH:mm' ) ;
	}
	
	if ( currentHourMin !== page.lastHourMin ) {
		refreshMinutely( sacredTimes ) ;
		page.lastHourMin = currentHourMin
	}
	
	page.refreshTimer = setTimeout( refresh , 1000 ) ;
}



function refreshMinutely( sacredTimes ) {
	var dateTime = getModeDateTime( sacredTimes ) ;
	
	//page.$tinyDate.textContent = SacredTimes.moment( dateTime ).locale( config.lang ).format( _( '_fullDateFormat' ) ) ;
	page.$tinyDate.textContent = dateTime.locale( config.lang ).format( _( '_fullDateFormat' ) ) ;
	
	var moonPhase = sacredTimes.getMoonPhase() ;
	//console.log( moonPhase ) ;
	page.moon.updatePhase( moonPhase.phase ) ;
	
	populateEvents( sacredTimes.getUpcomingEvents( config.mode ) ) ;
}



function fullRefresh() {
	page.lastHourMin = null ;   // Force refresh all
	refresh() ;
}



function debouncedFullRefresh() {
	page.lastHourMin = null ;   // Force refresh all

	if ( page.refreshTimer ) {
		clearTimeout( page.refreshTimer ) ;
		page.refreshTimer = null ;
	}

	page.refreshTimer = setTimeout( refresh , 250 ) ;
}	



function getModeDateTime( sacredTimes ) {
	if ( config.mode === 'legal' ) { return sacredTimes.getLegalDateTime() ; }
	if ( config.mode === 'solar' ) { return sacredTimes.getSolarDateTime() ; }
	if ( config.mode === 'lunisolar' ) { return sacredTimes.getLuniSolarDateTime() ; }
}



function populateEvents( events ) {
	domKit.removeAllTags( page.$events , 'p' ) ;
	
	events.forEach( event => {
		var $p = document.createElement( 'p' ) ;
		$p.textContent = _( event.name ) + ': ' + event.date.locale( config.lang ).format( _( '_middleDateTimeFormat' ) ) ;
		
		if ( event.isMajor ) { $p.classList.add( 'major' ) ; }
		//else if ( ! event.isUpcoming ) { $p.classList.add( 'past' ) ; }
		
		page.$events.appendChild( $p ) ;
	} ) ;
}



function switchToMode( mode ) {
	switch ( mode ) {
		case 'legal': return switchToLegalMode() ;
		case 'solar': return switchToSolarMode() ;
		case 'lunisolar': return switchToLuniSolarMode() ;
		default: return switchToLegalMode() ;
	}
}

function switchToLegalMode() {
	config.mode = 'legal' ;
	turnOffButtons() ;
	page.$legalModeButton.classList.add( 'active' ) ;
	fullRefresh() ;
	saveConfig() ;
}

function switchToSolarMode() {
	config.mode = 'solar' ;
	turnOffButtons() ;
	page.$solarModeButton.classList.add( 'active' ) ;
	fullRefresh() ;
	saveConfig() ;
}

function switchToLuniSolarMode() {
	config.mode = 'lunisolar' ;
	turnOffButtons() ;
	page.$lunisolarModeButton.classList.add( 'active' ) ;
	fullRefresh() ;
	saveConfig() ;
}

function turnOffButtons() {
	page.$legalModeButton.classList.remove( 'active' ) ;
	page.$solarModeButton.classList.remove( 'active' ) ;
	page.$lunisolarModeButton.classList.remove( 'active' ) ;
}



// LocalStorage save
function saveConfig() {
	localStorage.setItem( 'config' , JSON.stringify( config ) ) ;
}

// LocalStorage load
function loadConfig() {
	Object.assign( config , JSON.parse( localStorage.getItem( 'config' ) ) ) ;
}



function _( key ) {
	return ( LANG[ config.lang ] && LANG[ config.lang ][ key ] ) || LANG.default[ key ] || key ;
}

