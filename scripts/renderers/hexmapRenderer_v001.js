
///////////////////////////////////////////////////////////////////////
//
// Module: hexmapRenderer_v001
//
// Author: Mike Chantler
//
// What it does:
//	This JavaScript module implements a hexmap Renderer in D3.js
//	It adds an svg to the target DOM element where it renders the hexmap
//
// Dependencies
//	D3.js v3
//
// Version history
//	v001	22/12/2016	mjc	Created.
//	v001	14/01/2016 	PLeBras Modified.
//
///////////////////////////////////////////////////////////////////////

"use strict"; //This catches acidental global declarations


function getHexmapRender(targetDOMElement, numTopics) {

	var hexmapObject = {}; //The main object to be returned to the caller

	//=================== PUBLIC FUNCTIONS =========================
	//
	// Here we attach functions (methods) to the return obj
	// so that they can be used by the caller
	//

	hexmapObject.render = function () {
		render(loadedDataset);
		return hexmapObject; //allows chaining
	};

	hexmapObject.updateHighlights = function () {
		updateHighlights(loadedDataset);
		return hexmapObject; //allows chaining
	};


	hexmapObject.loadDataset = function (d) {
		loadedDataset=d;
		r = determineRr(loadedDataset);
		R = r/Math.cos(30*Math.PI/180);
		addImmediateNeighboursAndBorders (loadedDataset);
		// addTotals (loadedDataset);
		hexes = loadedDataset.hexmapData;
		//Preformat and form arc tooltip text
		// for (var i =0; i< hexes.length; i++){
		// 	hexes[i].docClasses[0].fweightSum = "EU: " + d3.format(",.0f")(hexes[i].docClasses[0].weightSum) + " projects";
		// 	hexes[i].docClasses[1].fweightSum = "UK: " + d3.format(",.0f")(hexes[i].docClasses[1].weightSum) + " projects";
		// 	hexes[i].docClasses[0].fweightedValueSum = "EU: Â£"+d3.format(",.0f")(hexes[i].docClasses[0].weightedValueSum/1000000) + "M";
		// 	hexes[i].docClasses[1].fweightedValueSum = "UK: Â£"+d3.format(",.0f")(hexes[i].docClasses[1].weightedValueSum/1000000) + "M";
		// }


		return hexmapObject; //allows chaining
	};

	hexmapObject.loadAndRenderDataset = function (d) {
		hexmapObject.loadDataset(d);
		render(loadedDataset);
		return hexmapObject; //allows chaining
	};

	hexmapObject.hexClickCallback = function (callback) {
		hexClickCallback=callback;
		return hexmapObject; //allows chaining
	};

	hexmapObject.hexMouseoverCallback = function (callback) {
		hexMouseoverCallback=callback;
		return hexmapObject; //allows chaining
	};

	hexmapObject.hexMouseoutCallback = function (callback) {
		hexMouseoutCallback=callback;
		return hexmapObject; //allows chaining
	};

	hexmapObject.arcMouseoverCallback = function (callback) {
		arcMouseoverCallback=callback;
		return hexmapObject; //allows chaining
	};

	hexmapObject.arcMouseoutCallback = function (callback) {
		arcMouseoutCallback=callback;
		return hexmapObject; //allows chaining
	};

	// =========== Getters ================
	hexmapObject.getSvgWidth = function(){
		return svgWidth;
	};


	//======== Interface configuration and mode =================
	hexmapObject.groupColours = function () {
		hexColourScale = d3.scaleOrdinal(hexFillColours);
		pieOpacity = 0.0;
		blankPies = true;

		render(loadedDataset);
		return hexmapObject; //allows chaining
	};

	hexmapObject.weightedValueSum = function () {
		reorder = false;
		updatePies = true;
		blankPies = false;
		hexColourScale = d3.scaleOrdinal(["white"]);
		pieOpacity = 0.5;
		valueType = "weightedValueSum"; //Cash

		render(loadedDataset);
		return hexmapObject; //allows chaining
	};

	hexmapObject.weightSum = function () {
		reorder = false;
		updatePies = true;
		blankPies = false;
		hexColourScale = d3.scaleOrdinal(["white"]);
		pieOpacity = 0.5;
		valueType = "weightSum"; //project numbers

		render(loadedDataset);
		return hexmapObject; //allows chaining
	};

	hexmapObject.map = function () {
		borderOpacity = 1.0;
		reorder = true;
		updatePies = true;
		hexPositioning = "map";

		render(loadedDataset);
		return hexmapObject; //allows chaining
	};

	hexmapObject.orderByNumbers = function () {
		borderOpacity = 0.0;
		reorder = true;
		updatePies = true;
		valueType = "weightSum";
		hexPositioning = "ordered"

		render(loadedDataset);
		return hexmapObject; //allows chaining
	};

	hexmapObject.orderByFunding = function () {
		borderOpacity = 0.0;
		reorder = true;
		updatePies = true;
		valueType = "weightedValueSum";
		hexPositioning = "ordered";

		render(loadedDataset);
		return hexmapObject; //allows chaining
	};

    hexmapObject.selectHexagon = function(topicId){
    	selectHex(topicId);
    	return hexmapObject;
	};

	hexmapObject.hexColor = function(d ,c , f){
		changeHexColor(d, c , f);
		return hexmapObject;
	};

	//=================== PRIVATE VARIABLES ====================================
	//Width and height of svg canvas
	var svgWidth = 1000,
		svgHeight = 1500;
	var hexClickCallback = null;
	var selectedTopic = null;
	var hexMouseoverCallback = null;
	var hexMouseoutCallback = null;

	var arcMouseoverCallback = null;
	var arcMouseoutCallback = null;

	var valueType = "weightedValueSum";
	var reorder = false;
	var updatePies = true;
	var blankPies = false;
	var borderOpacity = 1.0;
	var hexPositioning = "map";

	var hexFillColours = ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c",
					"#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928"];
	var hexColourScale = d3.scaleOrdinal(hexFillColours);

	var loadedDataset = {};

	var xMapScale = d3.scaleLinear();//has x offset to center hexmap
	var yMapScale = d3.scaleLinear();//has y offset to center hexmap
	var mapScale = d3.scaleLinear(); //relative scale (no offsets)
	var circleScale = d3.scaleSqrt();
	var pieOpacity = 0.3;
	var pieOpacityHighlight = 0.8;
	var hexColorOpacityScale = d3.scaleLinear(); //hex colour opacity scale used for heat map

    var loadingImg = d3.select(targetDOMElement).append("img")
        .attr("src", "resources/img/ring-alt.gif")
        .attr("width", "60px")
        .style("visibility", "hidden")
        .style("position", "absolute");
    var reloadTimeoutFunc = null;

	var zoom = d3.zoom()
		.scaleExtent([1, 8])
		.on("zoom", zoomed);

	//Declare and append SVG element
	var svgTop = d3.select(targetDOMElement)
		.append("svg")
		.attr("width", svgWidth)
		.attr("height", svgHeight);

	var svg = svgTop
		.call(zoom)
		.append("g");

	var r=0, R=0; //radii of hexagons in domain coords
				  //as defined here: https://en.wikipedia.org/wiki/Hexagon
	var hexes;

	function zoomed()
	{
		svg.attr("transform", d3.event.transform);

		var scale = 1;
		if(typeof d3.event.transform !== "undefined")
			scale = d3.event.transform.k;

		if(scale < 1.5)
		{
			d3.selectAll(".wordLevel3").style("display", "inline");
			d3.selectAll(".wordLevel5").style("display", "none");
			d3.selectAll(".wordLevel7").style("display", "none");
		}
		else if(scale < 2.75)
		{
			d3.selectAll(".wordLevel3").style("display", "none");
			d3.selectAll(".wordLevel5").style("display", "inline");
			d3.selectAll(".wordLevel7").style("display", "none");
		}
		else
		{
			d3.selectAll(".wordLevel3").style("display", "none");
			d3.selectAll(".wordLevel5").style("display", "none");
			d3.selectAll(".wordLevel7").style("display", "inline");
		}

		//console.log(scale)
	}

	//=================== PRIVATE FUNCTIONS ====================================

	function determineRr (loadedDataset){
		//Determines hexagon radius 'r' from min distance of neighbours
		var borders = [];
		var hexes = loadedDataset.conceptsData;
		//Find distance between immediate neighbours
		var d2 = 0, dMin2 = 100000000000000000000000000000;
		for (var n =0; n < hexes.length; n++){
			for (var m =n+1; m < hexes.length; m++){
				var dx = hexes[n].hexCoordinates.x -hexes[m].hexCoordinates.x;
				var dy = hexes[n].hexCoordinates.y -hexes[m].hexCoordinates.y;
				d2 = dx*dx + dy*dy;
				if (d2 < dMin2) dMin2 = d2;
			}
		}
		return Math.sqrt(dMin2)/2;
	}

	function addTotals (loadedDataset){
		//Add totals of a hex docClass values (e.g. EU + UK weightsums)
		//to data on each hex
		var hexes = loadedDataset.conceptsData;
		var maxOverHexesWeightSum = 0;
		var maxOverHexesWeightedValueSum = 0;

		for (var n =0; n < hexes.length; n++){
			hexes[n].totals = {};

			//For EACH hex, Add weightSum values from all classes (e.g. EU & UK) together
			var totalWeightSumForHex = hexes[n].docClasses.reduce(function(a, b) {return a.weightSum + b.weightSum;});
			hexes[n].totals.weightSum = totalWeightSumForHex;
			if(totalWeightSumForHex > maxOverHexesWeightSum) maxOverHexesWeightSum = totalWeightSumForHex;

			var totalWeightedValueSumForHex = hexes[n].docClasses.reduce(function(a, b) {return a.weightedValueSum + b.weightedValueSum;});
			hexes[n].totals.weightedValueSum = totalWeightedValueSumForHex;
			if(totalWeightedValueSumForHex > maxOverHexesWeightedValueSum) maxOverHexesWeightedValueSum = totalWeightedValueSumForHex;
		}
		loadedDataset.stats = {};
		loadedDataset.stats.max = {};
		loadedDataset.stats.max.weightSum = maxOverHexesWeightSum;
		loadedDataset.stats.max.weightedValueSum = maxOverHexesWeightedValueSum;

	}

	function addImmediateNeighboursAndBorders (loadedDataset){
		//Function that finds list of immediate hexagon neighbours
		var dMin2 = r*r*4; //squarded distance between immediate neighbours
		var hexes = loadedDataset.conceptsData;
		function addNeighbour(relativePosition, n, i, dx, dy){
			if (hexes[n].clusterId != hexes[m].clusterId)
				{hexes[n].borders.push(i);}

			hexes[n].neighbours[i] = {};
			hexes[n].neighbours[i].type = relativePosition;
			hexes[n].neighbours[i].conceptId = hexes[m].conceptId;
			hexes[n].neighbours[i].dx = dx;
			hexes[n].neighbours[i].dy = dy;
			hexes[n].neighbours[i].d2 = d2;
			hexes[n].neighbours[i].sideNo = i;
		}

		for (var n =0; n < hexes.length; n++){
			hexes[n].neighbours=[];
			hexes[n].borders=[];
			for (var m =0; m < hexes.length; m++){
				var dx = hexes[m].hexCoordinates.x -hexes[n].hexCoordinates.x;
				var dy = hexes[m].hexCoordinates.y -hexes[n].hexCoordinates.y;
				var d2 = dx*dx + dy*dy;

				if (d2 < 1.1*dMin2 && n != m) {
					if (dx > 1.8*r)          addNeighbour("horiz-right", n, 1, dx, dy);
					else if (dx < -1.8*r)    addNeighbour("horiz-left",  n, 4, dx, dy);
					else if (dx > 0 && dy < 0) addNeighbour("upper-right", n, 0, dx, dy);
					else if (dx > 0 && dy > 0) addNeighbour("lower-right", n, 2, dx, dy);
					else if (dx < 0 && dy < 0) addNeighbour("upper-left",  n, 5, dx, dy);
					else if (dx < 0 && dy > 0) addNeighbour("lower-left",  n, 3, dx, dy);
				}
			}

			for (var i = 0; i <6; i++){
				if (!hexes[n].neighbours[i]) hexes[n].borders.push(i);
			}
		}
	}

	function render (dataset) {
		clearTimeout(reloadTimeoutFunc);
		if(Object.keys(dataset).length > 0){

			loadingImg.remove();
            updateScalesAndSvgSize(dataset);
            GUP_hexes(dataset);
        } else {
            loadingImg.style("visibility", "visible")
                .style("margin-left", (svgWidth/2-30)+"px");
            reloadTimeoutFunc = setTimeout(render,1000, loadedDataset);
		}
    }

	function updateScalesAndSvgSize(loadedDataset){
		//Domain calculations assuming pointy top hexagons
		//r, R as defined in https://en.wikipedia.org/wiki/Hexagon

		var xMax=d3.max(loadedDataset.conceptsData, function(d) { return Number(d.hexCoordinates.x); });
		var xMin=d3.min(loadedDataset.conceptsData, function(d) { return Number(d.hexCoordinates.x); });
		var yMax=d3.max(loadedDataset.conceptsData, function(d) { return Number(d.hexCoordinates.y); });
		var yMin=d3.min(loadedDataset.conceptsData, function(d) { return Number(d.hexCoordinates.y); });

		var nRows = 1 + (yMax - yMin)/(1.5*R);
		var nCols = 1 + (xMax - xMin)/(2*r);

		//Add on extra "1/2" hexagons
		xMax = xMax + r;
		xMin = xMin - r;
		yMax = yMax + R;
		yMin = yMin - R;

		var border = 10;
		//Adjust size of svg to fit aspect ratio of hexmap
		if ((yMax-yMin)/(svgHeight - 2*border) < (xMax-xMin)/(svgWidth - 2*border)){
			//svg width is limiting factor so will scale
			//to fit svg width and reduce svg height accordingly
			svgHeight = (svgWidth - 2*border)*(yMax-yMin)/(xMax-xMin);
			svgHeight += 2*border;
			svgTop.attr("height", svgHeight);
		} else{
			//Vice versa
			svgWidth = (svgHeight - 2*border)*(xMax-xMin)/(yMax-yMin);
			svgWidth += 2*border;
			svgTop.attr("width", svgWidth);
		}

		//set up scales for positioning hex on svg
		xMapScale
			.domain([xMin,xMax])
			.range([border, svgWidth-border]);
		yMapScale
			.domain([yMin,yMax])
			.range([border, svgHeight-border]);
		//set up scales for drawing stuff inside the hex
		mapScale
			.domain([0,1000])
			.range([0, xMapScale(1000)-xMapScale(0)]);
		//set up scale for drawing cicles inside hex
		circleScale
			.range([0, mapScale(r)]);

		svgTop	.append("svg:image")
			.attr('x', svgWidth - 75)
			.attr('y', 11)
			.attr('width', 64)
			.attr('height', 64)
			.attr("xlink:href", "resources/img/HexReset.png")
			.classed("resetMouseOut", true)
			.on("mousedown", function(d, i) {
				//svgTop.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
				zoom.transform(svgTop, d3.zoomIdentity);
				zoomed();
			})
			.on("mouseover", function (d) {
				d3.select(this).classed("resetMouseOut", false);
				d3.select(this).classed("resetMouseOver", true);
			})
			.on("mouseout", function (d) {
				d3.select(this).classed("resetMouseOut", true);
				d3.select(this).classed("resetMouseOver", false);
			});

		svgTop.append("svg:image")
			.attr("x",svgWidth-75)
			.attr("y",80)
			.classed("resetMouseOut",true)
			.attr("height",64)
			.attr("width",64)
			.attr("xlink:href","resources/img/zoomIn.png")
			.on("click",function(d,i){
				zoom.scaleBy(svgTop, 2);
			})
			.on("mouseover",function(d){
				d3.select(this).classed("resetMouseOut", false);
				d3.select(this).classed("resetMouseOver", true);
			})
			.on("mouseout", function (d) {
				d3.select(this).classed("resetMouseOut", true);
				d3.select(this).classed("resetMouseOver", false);
			});

		svgTop.append("svg:image")
			.attr("x",svgWidth-75)
			.attr("y",150)
			.classed("resetMouseOut",true)
			.attr("height",64)
			.attr("width",64)
			.attr("xlink:href","resources/img/zoomOut.png")
			.on("click",function(d,i){
				zoom.scaleBy(svgTop,0.5);
			})
			.on("mouseover",function(d){
				d3.select(this).classed("resetMouseOut", false);
				d3.select(this).classed("resetMouseOver", true);
			})
			.on("mouseout", function (d) {
				d3.select(this).classed("resetMouseOut", true);
				d3.select(this).classed("resetMouseOver", false);
			});
	}

	function keyDesignator(d,i){
		return d.conceptId;
	}

	function borderPath(center, R, rotation, nSides, sides){
		//Returns svg path data to provide border at the 'sides' of a regular polygon
		//centre = [x, y] center of shapes
		//R = larger radius (c.f. r the inner radius)
		//rotation = how much to rotate whole shape (e.g. for flat topped hex use Math.PI/6 )
		//nSides = number of sides of the basic shape = 6 for hexagon
		//sides = array of sides that you want to draw e.g. [0,1,2,3,4,5] for full hex

		var path = "";
		var dAngle = 2*Math.PI/nSides;
		for (var i = 0; i < sides.length; i++){
			var angle = rotation + sides[i]*dAngle;
			var x1 = center[0]+(Math.sin(angle)*R);
			var y1 = center[1]-(Math.cos(angle)*R);
			angle += dAngle;
			var x2 = center[0]+(Math.sin(angle)*R);
			var y2 = center[1]-(Math.cos(angle)*R);
			path += "M " + x1 + " " + y1 + " L "  + x2 + " " + y2 + " ";
		}
		return path
	}


	function polygon_path(center, R, rotation, nSides){
		//Returns closed polygon path
		//centre = [x, y] center of shapes
		//R = larger radius (c.f. r the inner radius)
		//rotation = how much to rotate whole shape (e.g. for flat topped hex use Math.PI/6 )

		var path = "";
		var dAngle = 2*Math.PI/nSides;
		for (var i = 0; i < 6+1; i++){
			var angle = rotation + i*dAngle;
			var x1 = center[0]+(Math.sin(angle)*R);
			var y1 = center[1]-(Math.cos(angle)*R);

			if (i == 0) path += " M " + x1 + " " + y1 ;
			else path += " L " + x1 + " " + y1 + " ";
		}
		return path
	}

	function polygon(center, scale, rotation, numberOfPoints){
		// Returns polygon points string
		// centre = [x, y] center of shapes
		// scale = larger radius (c.f. r the inner radius)
		// rotation = how much to rotate whole polygon (e.g. for flat topped hex use Math.PI/6 )
		// numberOfPoints = number of points for the polygon

		var points = [];
		for(var i = 0; i < numberOfPoints; i++){
            var x1 = center[0]+(Math.sin(2*Math.PI*i/numberOfPoints)*scale);
            var y1 = center[1]-(Math.cos(2*Math.PI*i/numberOfPoints)*scale);
            var x = ((x1-center[0])*Math.cos(rotation))-((y1-center[1])*Math.sin(rotation))+center[0];
            var y = ((y1-center[1])*Math.cos(rotation))+((x1-center[0])*Math.sin(rotation))+center[1];
            points.push([x,y])
        }
        return points.join(" ");
	}


	function GUP_hexes(loadedDataset){
		var hexesPerRow = Math.floor(svgWidth/mapScale(2*r)) - 1;

		//=========== Hex groups =============
		//Bind data to hexGroups
		var hexGrpSelection = svg
			.selectAll("g.HexGrpClass")
			.data(loadedDataset.conceptsData, keyDesignator);

		//ENTER and position hexes
		var hexGrpEnter = hexGrpSelection.enter().append("g")
			.classed("HexGrpClass", true)
			.attr("transform", hexPosition)
			.on("mousedown", function(d, i){
				selectHex(d.conceptId);

				//hexClickCallback(d, i)
            })
			.on("mouseover", hexMouseoverCallback)
			.on("mouseout", hexMouseoutCallback);

		//UPDATE to ordered layout
		if (reorder){
			hexGrpSelection
				.sort (function(a,b){return d3.descending(a.totals[valueType], b.totals[valueType])})
				.transition()
				.duration(2000)
				.attr("transform", hexPosition);
		}

		function hexPosition(d,i){
			if (hexPositioning == "ordered"){
				var row = Math.floor(i/hexesPerRow);
				var col = i%hexesPerRow+1;
				return "translate(" + mapScale(col*2.15*r ) + "," + mapScale((row+0.5)*2.15*R) + ")";
			} else if (hexPositioning == "map") {
				return "translate(" + xMapScale(d.hexCoordinates.x) + "," + yMapScale(d.hexCoordinates.y) + ")";
			}
		}

		//=========== hexagon shapes =============
		var Rpixels = yMapScale(R)-yMapScale(0);

		hexGrpEnter
			.append("polygon")
				.classed("hexShapeClass", true)

				//.style("fill", "white")
				// .style("fill", function(d){return hexColourScale(d.clusterAgglomerative)})
				.attr("points", function(){
                    return polygon([0,0], Rpixels, 0, 6);
                });

		//UPDATE hexagon shapes
		hexGrpSelection.selectAll("polygon.hexShapeClass")
			// .style("fill", function(d){return hexColourScale(d.clusterAgglomerative)});

/*		hexGrpSelection.selectAll("path.hexShapeClass").filter(function(d){return d.highlightHex})
			.style("stroke", "black")
			.style("opacity",1.0)
			.attr("d", function(){
                    return polygon([0,0], Rpixels*1.2, 0, 6);
                });

		hexGrpSelection.selectAll("path.hexShapeClass").filter(function(d){return !d.highlightHex})
			.style("stroke", "black")
			.style("opacity",1.0)
			.attr("d", function(){
                    return polygon([0,0], Rpixels, 0, 6);
                });;*/

		//=========== Borders =============
		hexGrpEnter
			.filter(function (d) {
				return d.clusterId >= 0;
			})
			.append("path")
			.classed("hexborderClass", true)
			.style("opacity",function (){return borderOpacity})
			.attr("d", function(d) {
				return borderPath([0,0], Rpixels, 0, 6, d.borders);
			});

		hexGrpSelection.selectAll("path.hexborderClass")
			.transition().delay(function (){return 1500*borderOpacity}).duration(500)
			.style("opacity",function (){return borderOpacity});

		// //=========== Pie charts =============
		// // The data binding and flow is described at http://stackoverflow.com/questions/32312872/updating-nested-data
		// //Set up helpers
		// var pie = d3.pie()
		// 	.value(function(d){return d[valueType]})
		// 	.sort(null); //set sort behaviour to default!
		// circleScale.domain([0,loadedDataset.stats.max[valueType]]);
		// var arc = d3.arc().innerRadius(0);
		//
		// //Add groups for pie chart arcs to main hex group
		// hexGrpEnter
		// 	.append("g")
		// 		.style("visibility", function (){return "visible"})
		// 		.attr("class", "docClassArcs");
		//
		// //Bind arcs (paths) to data in next level of data hierarchy
		// var piechartArcsSelection = svg
		// 	.selectAll("g.HexGrpClass").selectAll("g.docClassArcs")
		// 	.selectAll("path")
		// 	.data(
		// 		function(d,i){
		// 			// 'd' above refers to a topic (an element of the conceptsData array)
		// 			// We now have to generate a new array of arc data (one d_arc array element per arc)
		// 			// where we store start angle, end angle etc.
		// 			var totalValueOfTopic = d.totals[valueType];
		// 			var arcStartEndAnglesEtc = pie(d.docClasses);
		// 			//Add total of arc values into each 'd_arc' so that we know the 'size' of the pie chart arcs
		// 			return arcStartEndAnglesEtc.map(function(d_arc){
		// 				d_arc.arcRadius = totalValueOfTopic;
		// 				d_arc.parentDatum = d;
		// 				return d_arc
		// 			});
		// 		},
		// 		function (d){ //specify the keyDesignator
		// 			return d.data.docClassId;
		// 		}
		// 	);
		//
		//
		// var piechartArcsEnter = piechartArcsSelection
		// 	.enter()
		// 		.append("path")
		// 			.on("mouseover", function (d_arc,i){
		// 				d3.select(this)
		// 					.style("opacity", pieOpacityHighlight)
		// 					.style("stroke", "black");
		// 				arcMouseoverCallback.call(this, d_arc,i, d_arc.data["f"+valueType], valueType, d_arc.parentDatum)
		// 			})
		// 			.on("mouseout", function(d_arc, i){
         //                d3.select(this)
		// 					.style("opacity", pieOpacity)
         //                	.style("stroke", "none");
		// 				arcMouseoutCallback(d_arc, i)
		// 			})
		// 			.classed("EuClass", function(d_arc,i){return d_arc.data.docClassId=="EU"})
		// 			.classed("UkClass", function(d_arc,i){return d_arc.data.docClassId=="UK"})
		// 			.attr("d", function(d_arc, i){arc.outerRadius(circleScale(d_arc.arcRadius)); return arc(d_arc);})
		// 			.style("opacity", pieOpacity);
		//
		// if (updatePies){
		// 	piechartArcsSelection
		// 		.attr("d", function(d_arc){	arc.outerRadius(circleScale(d_arc.arcRadius)); return arc(d_arc); })
		// 		//.style("opacity", 1.0)
		// 		.transition().duration(500)
		// 			.style("opacity", pieOpacity)
		// }
		//
		// // if (blankPies) piechartArcsSelection.transition().duration(500).style("opacity", 0.0);
		//
		// /*piechartArcsSelection
		// 	.filter(function(d_arc){return d_arc.parentDatum.highlightHex})
		// 		.style("stroke", function(d_arc){ return "black"})*/

		//=========== highlight hexagon shapes =============
		hexGrpEnter
			.append("polygon")
				.classed("hexHighlightClass", true)
				.attr("points", function(){
            return polygon([0,0], Rpixels, 0, 6);
      });

		var highlight = hexGrpEnter
            .append('g')
            .style('stroke-opacity', '0')
            .classed('hexHighlighted', true);

        highlight
            .append('line')
            .attr("x1", -Rpixels / 2)
            .attr("x2", Rpixels / 2)
            .attr("y1", 2)
            .attr("y2", 2)
            .attr('stroke', '#333333')
            .attr('stroke-width', '1')
            .attr('transform', "translate(0, " + (Rpixels / 1.65) + ")");

        highlight
            .append('line')
            .attr("x1", -Rpixels / 2)
            .attr("x2", Rpixels / 2)
            .attr("y1", -2)
            .attr("y2", -2)
            .attr('stroke', '#333333')
            .attr('stroke-width', '1')
            .attr('transform', "translate(0, -" + (Rpixels / 1.65) + ")");

		//=========== Topic Text =============
		//ENTER text
		var textGroup = hexGrpEnter
			.append("g")
			.classed("textGroup", true)
			.attr("transform", function(d) {
				if(numTopics < 50)
				{
					return "scale(1.1, 1.1)";
				}
				else if(numTopics < 80)
				{
					return "scale(1, 1)";
				}
				else if(numTopics < 100)
				{
					return "scale(0.70, 0.70)";
				}
			});
		// console.log(numTopics)
		var word3 = textGroup
			.append("g")
			.classed("wordLevel3", true);

		word3
			.append('text')
			.classed ("topicText1Class", true)
			.text(function(d,i){return d.labels[0].label});

		word3
			.append('text')
			.attr("y", -20)
			.classed ("topicText2Class", true)
			.text(function(d,i){return d.labels[1].label});

		word3
			.append('text')
			.attr("y", +20)
			.classed ("topicText2Class", true)
			.text(function(d,i){return d.labels[2].label});

		var word5 = textGroup
			.append("g")
			.classed("wordLevel5", true);

		word5
			.append('text')
			.classed ("topicText2Class", true)
			.text(function(d,i){return d.labels[0].label});

		word5
			.append('text')
			.attr("y", -13)
			.classed ("topicText3Class", true)
			.text(function(d,i){return d.labels[1].label});

		word5
			.append('text')
			.attr("y", +13)
			.classed ("topicText3Class", true)
			.text(function(d,i){return d.labels[2].label});

		word5
			.append('text')
			.attr("y", -24)
			.classed ("topicText4Class", true)
			.text(function(d,i){return d.labels[3].label});

		word5
			.append('text')
			.attr("y", +24)
			.classed ("topicText4Class", true)
			.text(function(d,i){return d.labels[4].label});

		var word7 = textGroup
			.append("g")
			.classed("wordLevel7", true);

		word7
			.append('text')
			.classed ("topicText3Class", true)
			.text(function(d,i){return d.labels[0].label});

		word7
			.append('text')
			.attr("y", -10)
			.classed ("topicText4Class", true)
			.text(function(d,i){return d.labels[1].label});

		word7
			.append('text')
			.attr("y", +10)
			.classed ("topicText4Class", true)
			.text(function(d,i){return d.labels[2].label});

		word7
			.append('text')
			.attr("y", -18)
			.classed ("topicText5Class", true)
			.text(function(d,i){return d.labels[3].label});

		word7
			.append('text')
			.attr("y", +18)
			.classed ("topicText5Class", true)
			.text(function(d,i){return d.labels[4].label});

		word7
			.append('text')
			.attr("y", -24)
			.classed ("topicText6Class", true)
			.text(function(d,i){return d.labels[5].label});

		word7
			.append('text')
			.attr("y", +24)
			.classed ("topicText6Class", true)
			.text(function(d,i){return d.labels[6].label});

	}

	function updateHighlights(loadedDataset){
		var hexGrpSelection = svg
			.selectAll("g.HexGrpClass")
			.data(loadedDataset.conceptsData, keyDesignator);

		hexGrpSelection.selectAll("polygon.hexHighlightClass")
			.filter(function(d){return !d.highlightHex})
				.style("opacity", 0.0);

		hexGrpSelection.selectAll("polygon.hexHighlightClass")
			.filter(function(d){return d.highlightHex})
				.style("opacity", 1.0);
	}

	function selectHex(conceptId){
        svg.selectAll("g.HexGrpClass").selectAll("polygon.hexShapeClass")
			.classed('hexShapeSelect', false);

			svg.selectAll("g.HexGrpClass").selectAll("g.hexHighlighted")
				.style("stroke-opacity",0);

            // .style("fill", "#ffffff");
      //   svg.selectAll("g.HexGrpClass")
			// .filter(function(d){return d.conceptId === conceptId})
			// .selectAll("path.hexHighlightClass")
			// 	.style("stroke","blue");

			svg.selectAll("g.HexGrpClass")
				.filter(function(d){return d.conceptId == conceptId})
				.selectAll("g.hexHighlighted")
				.style("stroke-opacity",1);

			svg.selectAll("g.HexGrpClass")
				.filter(function(d){return d.conceptId == conceptId})
			.selectAll("polygon.hexShapeClass")
            // .classed('hexShapeSelect', true)
           	// .style("fill", "#7A7A7C")
			.each(hexClickCallback);

	}

	function changeHexColor(dataset, color) {
		// console.log("CHANGE HEX COLOUR");
		// maxdomain is replaced with MaxValue of non-generic topics
		var maxDomain = d3.max(dataset, function(d) {return Number(d.simVal); });

		// console.log(dataset)
		// console.log(maxDomain);

		hexColorOpacityScale
			.domain([0,maxDomain])
			.range(['0.0', '0.9']);

		dataset.forEach(function(f) {
			setColor(f.conceptId, color, Number(f.simVal) < Number(maxDomain) ? hexColorOpacityScale(f.simVal) : 0.9);
		});

		function setColor(tId, cl, opacity) {
			svg.selectAll("g.HexGrpClass")
				.filter(function(d){return d.conceptId === tId})
				.selectAll("polygon.hexShapeClass")
				.style('fill', cl)
				.style('opacity', opacity);
		}
	}

	//================== IMPORTANT do not delete ==================================
	return hexmapObject; // return the main object to the caller to create an instance of the 'class'

} //End of hexmap() declaration
