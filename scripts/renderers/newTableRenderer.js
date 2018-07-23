"use strict"

function getNewTableRenderer(targetDOMElement){
  var tableOb={};

  tableOb.render = function(topicId){
		render(topicId);
		return tableOb;
	};

  var rowMaxWidth = 750,
		rowMinHeight = 30,
		nRows = 10,
		nRowsArray = [],
		tablePaddingHor = 5;
	// data vars
	var loadedDataset = {},
		accessors = [],
		docLink = null,
		topicId = null;

  function render(id){
    rowMinHeight=30;

    d3.select(targetDOMElement).select("table").remove();

    var table = d3.select(targetDOMElement).append("table")
        .style("font-family", "'Open Sans', sans-serif")
        .style("width", rowMaxWidth+"px")
              .style("font-size", "12px")
        .style("border-collapse", "collapse")
        .style("margin", "0 "+tablePaddingHor+"px"),
      theads = table.append("thead"),
      tbody = table.append("tbody");

    table.style("width", rowMaxWidth+"px");
    var papersWeWant = topicDetailed[id];

    theads.append("th")
      .text("Conference Year");

    theads.append("th")
      .text("Paper Number")

    theads.append("th")
      .text("Relevance to Topic");

    theads.append("th")
      .text("Location of Topic within Paper");

    d3.selectAll("th")
      .each(styleCell);

    for(var i = 0 ; i < papersWeWant.length ; i++){
      renderTableRow(papersWeWant[i],tbody,id);
    }
    // renderTableRow(papersWeWant[0], tbody, id);

    tbody.selectAll("tr")
      .on("mouseover", function(d){
        d3.select(this)
          .style("background-color", "#F0F0F0");
      })
      .on("mouseout", function(){
        d3.select(this)
          .style("background-color", "#FFFFFF")
      })
  }

  function renderTableRow(currPaper, tbody, id){
    var current=paperDetailed[currPaper];

    rowMinHeight=160;

    var currRow = tbody.append("tr");

    var confYear ="20"+current["name"].substring(12).substring(0,2);
    currRow.append("td").text(confYear);

    var paperNumber = current["name"].substring(15).slice(0,-4);
    paperNumber = paperNumber.substr(0, 5) + " " + paperNumber.substr(5);
    paperNumber=paperNumber.charAt(0).toUpperCase() + paperNumber.slice(1);
    currRow.append("td").text(paperNumber);

    var relevance= ((current["distribution"][id] / 20)*100).toFixed(2).toString() + "%";
    currRow.append("td").text(relevance);

    var svg = currRow.append("td")
          .append("svg")
          .attr("width","180px")
          .attr("height","180px");

    svg.append("circle")
      .attr("r","70px")
      .attr("transform","translate("+180/2+","+200/2+")")
      .style("fill","none")
      .style("stroke","black")
      .style("stroke-width","1px");

    for(var i = 0 ; i < current["sequence"].length ; i++){
      if(current["sequence"][i] == id){
        //then we want to draw a path at the index times eighteen
        var endAngle = (i+1) * 18;
        var startAngle = endAngle-18;

        var thisArc = d3.arc()
					.innerRadius(65)
			    .outerRadius(75)
			    .startAngle((startAngle * Math.PI)/180)
			    .endAngle((endAngle * Math.PI)/180);

        svg.append("path")
					.attr("d",thisArc)
					.attr("transform","translate("+180/2+","+200/2+")")
					.attr("fill","#D65076");
      }
    }

    svg.append("line")
      .attr("x1",0)
      .attr("y1",-60)
      .attr("x2",0)
      .attr("y2",-90)
      .attr('stroke',"black")
      .attr('stroke-width',"2px")
      .attr("transform","translate("+180/2+","+200/2+")");

    svg.append("text")
      .attr("transform","translate("+180/2+","+200/2+")")
      .text("START")
      .style("font-size","9.5px")
      .attr("y",-80)
      .attr("x",8);

    svg.append("text")
      .attr("transform","translate("+180/2+","+200/2+")")
      .text("END")
      .style("font-size","9.5px")
      .attr("y",-80)
      .attr("x",-28);

    d3.selectAll("td").each(styleCell);
  }

  function styleCell(d){
    d3.select(this)
      .attr("height",rowMinHeight)
      .style("padding", "5px 10px")
      .style("text-align", "left")
      .style("border","1px solid #dddddd")
      .style("font-size","14px");
  }

  return tableOb;
}
