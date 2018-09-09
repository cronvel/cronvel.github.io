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

"use strict";

function SvgPhase(options) {
	options = options || {};

	this.$container = options.container || document.body;
	this.$svg = null;
	this.$shadowPath = null;
	this.$image = null;

	this.imageUrl = options.imageUrl || null;
	this.imageScaleX = options.imageScaleX || 1;
	this.imageScaleY = options.imageScaleY || 1;
	this.phase = options.phase || 0;
	this.shadowLight = options.shadowLight || 0;
	this.planetLight = options.planetLight || 0;

	this.create();
	this.drawShadowPath();
}

SvgPhase.prototype.create = function () {
	this.$svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	this.$svg.setAttribute("viewBox", "-55 -55 110 110");

	if (this.imageUrl) {
		this.$image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
		this.$image.setAttribute("href", this.imageUrl);
		this.$image.setAttribute("x", -50 * this.imageScaleX);
		this.$image.setAttribute("y", -50 * this.imageScaleY);
		this.$image.setAttribute("width", 100 * this.imageScaleX);
		this.$image.setAttribute("height", 100 * this.imageScaleY);
	} else {
		this.$image = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		this.$image.setAttribute("cx", "0");
		this.$image.setAttribute("cy", "0");
		this.$image.setAttribute("r", "50");
		this.$image.setAttribute("fill", "white");
		this.$image.setAttribute("stroke", "black");
		this.$image.setAttribute("stroke-width", "1");
	}

	this.$svg.appendChild(this.$image);

	this.$shadowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	this.$shadowPath.setAttribute("fill", "black");
	this.$shadowPath.setAttribute("stroke", "none");
	this.$svg.appendChild(this.$shadowPath);

	this.$container.appendChild(this.$svg);
};

SvgPhase.prototype.drawShadowPath = function () {
	var innerRadius,
	    clockwise,
	    commands = [],
	    shadowLight;

	commands.push("M 0,-50");

	if (this.phase <= 0.5) {
		commands.push("A 50 50 0 0 0 0,50");
		innerRadius = Math.abs(50 * Math.cos(2 * this.phase * Math.PI));
		clockwise = this.phase > 0.25 ? 1 : 0;
		commands.push("A " + innerRadius + " 50 0 0 " + clockwise + " 0,-50");
	} else {
		commands.push("A 50 50 0 0 1 0,50");
		innerRadius = Math.abs(50 * Math.cos(2 * this.phase * Math.PI));
		clockwise = this.phase > 0.75 ? 1 : 0;
		commands.push("A " + innerRadius + " 50 0 0 " + clockwise + " 0,-50");
	}

	this.$shadowPath.setAttribute("d", commands.join(' '));

	shadowLight = this.shadowLight;

	if (this.planetLight) {
		shadowLight = Math.min(1, shadowLight + this.planetLight * (1 - Math.sin(this.phase * Math.PI)));
	}

	this.$shadowPath.setAttribute("fill-opacity", 1 - shadowLight);
};

SvgPhase.prototype.updatePhase = function (phase) {
	this.phase = phase;
	this.drawShadowPath();
};