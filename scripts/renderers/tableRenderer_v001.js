
///////////////////////////////////////////////////////////////////////
//
// Module: tableRenderer_v001
//
// Author: Pierre Le Bras
//
// What it does:
//	This JavaScript module implements a table Renderer in D3.js
//	It adds an table to the target DOM element and display rows based on data
//
// Dependencies
//	D3.js v4
//
// Version history
//	v001	11/01/2017	PLeBras	Created.
//
///////////////////////////////////////////////////////////////////////

"use strict"; //This catches acidental global declarations

// constructor method
function getTableRenderer(targetDOMElement){

	// main object, i.e. "instance" of "class"
	var tableObj = {};

	// =============== PUBLIC VARIABLES ===============
	// =============== PUBLIC FUNCTIONS ===============
	tableObj.render = function(topicId){
		render(loadedDataset, topicId);
		return tableObj;
	};
	tableObj.hide = function(){
		hide();
		return tableObj;
	};
	tableObj.loadDataset = function(d){
		loadedDataset = d;
		//loadingImg.remove();
		return tableObj;
	};
	tableObj.loadDatasetAndRender = function(d, topicId){
		tableObj.loadDataset(d);
		tableObj.render(topicId);
		// paperInteractions();
		return tableObj;
	};
	tableObj.setInfoAccessors = function(a){
		accessors = a;
		update();
		return tableObj;
	};
	tableObj.setWidth = function(w){
		rowMaxWidth = w-tablePaddingHor*2;
		update();
		return tableObj;
	};
	tableObj.setHeight = function(h){
		rowMinHeight = h;
		update();
		return tableObj;
	};
	tableObj.setNRows = function(n){
		nRows = n;
		update();
		return tableObj;
	};
	tableObj.setNRowsArray = function(a){
		nRowsArray = a;
		nRows = a[0];
		update();
		return tableObj;
	};

	// =============== PRIVATE VARIABLES ===============
	// table vars
	var rowMaxWidth = 590,
		rowMinHeight = 40,
		nRows = 10,
		nRowsArray = [],
		tablePaddingHor = 5;
	// data vars
	var loadedDataset = {},
		accessors = [],
		docLink = null,
		topicId = null;
	// DOM elements
		// fixed

    var loadingImg = d3.select(targetDOMElement).append("img")
        .attr("src", "resources/img/ring-alt.gif")
		.attr("width", "60px")
		.style("visibility", "hidden")
        .style("position", "absolute");
    var reloadTimeoutFunc = null;

    var nRowSelectSpan = d3.select(targetDOMElement).append("span")
        .style("margin-left", tablePaddingHor+"px");

	var nRowSelect = null;

	var table = d3.select(targetDOMElement).append("table")
			.style("font-family", "'Open Sans', sans-serif")
			.style("width", rowMaxWidth+"px")
            .style("font-size", "12px")
 			.style("border-collapse", "collapse")
			.style("margin", "0 "+tablePaddingHor+"px"),
		thead = table.append("thead"),
		tbody = table.append("tbody");

		// updated
	var titleRow = null,
		rows = null;

	// =============== PRIVATE FUNCTIONS ===============
	function update(){
        table.style("width", rowMaxWidth+"px");
		if(topicId != null){
			render(loadedDataset, topicId);
			// paperInteractions();
		}
	}

	function render(dataset, tId){
		// console.log("Rendering table");
		clearTimeout(reloadTimeoutFunc);
		if(Object.keys(dataset).length > 0){

			loadingImg.remove();

            table.style("width", rowMaxWidth+"px");

            var selectedTopic = dataset[tId];
						// console.log(selectedTopic);

						var docsData = selectedTopic.sort(function(a,b){
                return d3.descending(a.topicWeight, b.topicWeight);
            }).slice(0, nRows);

						for(var i = 0 ; i < docsData.length ; i++){
							var current = docsData[i]["docInfo"];

							if(!isNaN(current["sourceID"])){
								if(current["sourceID"] == 0){
									current["sourceID"] = "CHI 2018";
								}else if(current["sourceID"] == 1){
									current["sourceID"] = "CHI 2017";
								}else if(current["sourceID"] == 2){
									current["sourceID"] = "CHI 2016";
								}else{
									current["sourceID"] = "CHI 2015";
								}
							}

							if(current["sourceName"].length > 10){
								var newPaperName = current["sourceName"].slice(15,-4);
								newPaperName = newPaperName.charAt(0).toUpperCase() + newPaperName.slice(1);
								newPaperName = newPaperName.slice(0,5)+" "+newPaperName.slice(-(newPaperName.length - 5));
								current["sourceName"]=newPaperName;
							}

						}

            GUP_rows(docsData);

            if(nRowsArray.length == 0){
                nRowSelectSpan.selectAll("span").remove();
                nRowSelect = null;
						}
            // } else if(nRowsArray.length > 0) {
            //     // if(nRowSelect == null){
                //     nRowSelectSpan.append("span").text("Number of grants:");
                //     nRowSelect = nRowSelectSpan.append("span");
                //     //nRowSelectSpan.append("span").text("topics");
								//
                //     nRowSelectSpan.style("font-size", "12px");
                //     nRowSelectSpan.selectAll("span")
                //         .style("padding", "0px 2px");
                // }
                // GUP_nRowsLinks(nRowsArray);
            // }

            topicId = tId;
        } else {
			loadingImg.style("visibility", "visible")
				.style("margin-left", (tablePaddingHor+rowMaxWidth/2-30)+"px");
			reloadTimeoutFunc = setTimeout(render,1000, loadedDataset, tId);
		}
	}

	function GUP_nRowsLinks(nRowsArray){
		var nRowLinks = nRowSelect.selectAll("a").data(nRowsArray);
		nRowLinks.exit().remove();
		nRowLinks.enter().append("a");
		nRowLinks = nRowSelect.selectAll("a");
		nRowLinks
			.style("padding", "0px 3px")
			.style("cursor", "pointer")
			.style("text-decoration", "none")
			.style("color", function(d){
				return (d == nRows) ? "#303030" : "#999999";
			})
			.style("font-weight", function(d){
				return (d == nRows) ? "bold" : "normal";
			})
			.text(function(d){return d;})
			.on("mouseover", function(d){
				if(d != nRows){
					d3.select(this)
						.style("font-weight", "bold");
						//.style("text-decoration", "underline");
				}
			})
			.on("mouseout", function(d){
				if(d != nRows){
					d3.select(this)
						.style("font-weight", "normal")
						.style("text-decoration", "none");
				}
			})
			.on("click", function(d){
				if(d != nRows){
					tableObj.setNRows(d);
				}
			})
	}

	function GUP_rows(docsData){
		if(titleRow == null){
			titleRow = thead.append("tr").each(styleRow);
		}

		// console.log(accessors);

		// var tmp = accessors[2];
		// accessors[2] = accessors[3];
		// accessors[3]=tmp;

		var titleCells = titleRow.selectAll("th")
			.data(accessors.map(function(a){
				// console.log(a);
				if(a.title == "Relevance"){
					return "Relevance to Topic";
				}else if(a.title == "PaperPart"){
					return "Location in Paper";
				}
				return a.title;
			}));
		titleCells.exit().remove();
		titleCells.enter().append("th");
		titleCells = titleRow.selectAll("th");
		titleCells.text(function(d){return d})
			.each(styleCell);

		rowMinHeight = 100;
		// console.log(docsData);
		rows = tbody.selectAll("tr")
			.data(docsData);
		rows.exit().remove();
		rows.enter().append("tr");
		rows = tbody.selectAll("tr");
		rows
			.on("mouseover", function(d){
				d3.select(this)
					.style("background-color", "#F0F0F0");
			})
			.on("mouseout", function(){
				d3.select(this)
					.style("background-color", "#FFFFFF")
			})
			.classed("tableRow",true)
			.each(makeCells).each(styleRow);


		var currpart=[];
		var svg = d3.selectAll(".PaperPart")
			.each(function(d){
				currpart.push(parseInt(d3.select(this)["_groups"][0][0]["innerText"]));
			})
			.text("")
			// .style("text-align","center")
			.append('svg')
			.attr("width","150px");

			svg.append("circle")
			.attr("r","60px")
			.attr("transform","translate("+150/2+","+160/2+")")
			.style("fill","none")
			.style("stroke","black")
			.style("stroke-width","1px")
			.each(function(d,i){
				var current = currpart[i];
				console.log(current);
				var endAngle = current*18;
				var startAngle = endAngle-18;

				var thisArc = d3.arc()
					.innerRadius(55)
			    .outerRadius(65)
			    .startAngle((startAngle * Math.PI)/180)
			    .endAngle((endAngle * Math.PI)/180);

				d3.select(this.parentNode).append("path")
					.attr("d",thisArc)
					.attr("transform","translate("+150/2+","+160/2+")")
					.attr("fill","#D65076");

			});

			svg.append("line")
				.attr("x1",0)
				.attr("y1",-50)
				.attr("x2",0)
				.attr("y2",-70)
				.attr('stroke',"black")
				.attr('stroke-width',"2px")
				.attr("transform","translate("+150/2+","+160/2+")");

			svg.append("text")
				.attr("transform","translate("+150/2+","+160/2+")")
				.text("START")
				.style("font-size","9.5px")
				.attr("y",-68)
				.attr("x",8);

			svg.append("text")
				.attr("transform","translate("+150/2+","+160/2+")")
				.text("END")
				.style("font-size","9.5px")
				.attr("y",-68)
				.attr("x",-28);

		function makeCells(rowData, rowIndex){
			var row = d3.select(this);
			var cells = row.selectAll("td")
				.data(accessors);
			cells.exit().remove();
			cells.enter().append("td");
			cells = row.selectAll("td");
			cells.html(function(d){
				return d.accessor(rowData)
			})
				.each(styleCell)
				// .on("click" , function(d){
				// 	d.click(rowData);
				// })
				.on("mouseover", function(d){
					// paperInteractions(d);
          d3.select(this).style("cursor", "pointer");
					d.mouseover(rowData);
				})
				.on("mouseout", function(d){
                    d3.select(this).style("cursor", "default");
                    d.mouseout(rowData);
				});
		}

		function styleRow(){
			d3.select(this)
				.style("height", rowMinHeight+"px")
				.style("border-bottom", "1px solid #9C9C9E")
		}

		function styleCell(d){
			// console.log(d3.select(this));
			d3.select(this)
				.style("padding", "5px 10px")
				.style("text-align", d.align)
				.style("text-decoration", d.decoration)
				.attr("class",function(d){
					return d.title;
				});
		}

	}

	function hide(){
		titleRow.remove();
		titleRow = null;
		rows.remove();
		rows = null;
		nRowSelectSpan.selectAll("span").remove();
		nRowSelect = null;
		topicId = null;
	}

	// return the main object for instantiation
	return tableObj;
}
