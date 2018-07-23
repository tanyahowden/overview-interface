
///////////////////////////////////////////////////////////////////////
//
// Module: toolTips_v001
//
// Author: Mike Chantler
//
// What it does:
//	This JavaScript module implements a tool tips in d3
//
//
// Version history
//	v001	22/12/2016	mjc	Created.
//
///////////////////////////////////////////////////////////////////////

"use strict"; //This catches acidental global declarations


function getToolTipObj(targetDOMelement) {

	var toolTipObject = {}; //The main object to be returned to the caller

	//=================== CONSTRUCTOR CODE =========================
	var div = d3.select(targetDOMelement).append("div")
		.classed("tooltipClass", true)
		.style("opacity", 0);

	//=================== PUBLIC FUNCTIONS =========================
	//
	// Here we attach functions (methods) to the return obj
	// so that they can be used by the caller
	//

	toolTipObject.show = function (html, dx, dy, anchor) {
		div.transition().duration(200)
			.style("opacity", 1.0);
		div.html(html);
		var w = div.node().getBoundingClientRect().width;
		switch(anchor){
			case "left":
				dx -= 0;
				break;
			case "middle":
				dx -= w/2;
				break;
			case "right":
				dx -= w;
				break;
			default:
				dx -= 0;
				break;
		}
		div.style("left", (d3.event.pageX + dx) + "px")
			.style("top", (d3.event.pageY + dy) + "px");
		return toolTipObject; //allows chaining
	};

	toolTipObject.hide = function () {
		div.transition().duration(500)
			.style("opacity", 0);
		return toolTipObject; //allows chaining
	};

	toolTipObject.background = function (background) {
		div.style("background", background);
		return toolTipObject; //allows chaining
	};

	toolTipObject.height = function (height) {
		div.style("height", 500);
		return toolTipObject; //allows chaining
	};





	//=================== PRIVATE VARIABLES ====================================


	//=================== PRIVATE FUNCTIONS ====================================




	//================== IMPORTANT do not delete ==================================
	return toolTipObject; // return the main object to the caller to create an instance of the 'class'

} //End of hexmap() declaration
