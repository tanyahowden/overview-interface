
///////////////////////////////////////////////////////////////////////
//
// Module: wordcloudRenderer_v001
//
// Author: Pierre Le Bras
//
// What it does:
//	This JavaScript module implements a wordcloud Renderer in D3.js
//	It adds an svg to the target DOM element where it renders the wordcloud
//
// Dependencies
//	D3.js v4, d3-cloud
//
// Version history
//	v001	09/01/2017	PLeBras	Created.
//
///////////////////////////////////////////////////////////////////////

"use strict" //This catches acidental global declarations


function getWordcloudRenderer(targetDOMElement){

	var wordcloudObject = {}; //The main object to be returned to the caller

	// ==================== PUBLIC FUNCTIONS ====================
	//
	// Here we attach functions (methods) to the return obj
	// so that they can be used by the caller
	//

	wordcloudObject.render = function(topicId) {
		render(loadedDataset, topicId);
		return wordcloudObject; //allows chaining
	}

	wordcloudObject.hide = function(){
		hide();
		return wordcloudObject; //allows chaining
	}

	wordcloudObject.loadDataset = function(d){
		loadedDataset = d;
		makeTextScale(loadedDataset);
		return wordcloudObject; //allows chaining
	}

	wordcloudObject.loadAndRenderDataset = function(d, topicId){
		wordcloudObject.loadDataset(d);
		render(loadedDataset, topicId);
		return wordcloudObject; //allows chaining
	}

	wordcloudObject.setWidth = function(w){
		svgWidth = w;
		update();
		return wordcloudObject; //allows chaining
	}

	wordcloudObject.setHeight = function(h){
		svgHeight = h;
		update();
		return wordcloudObject; //allows chaining
	}

	// ==================== PRIVATE VARIABLES ====================
	// Width and height of svg canvas
	var svgWidth = 400,
		svgHeight = 200;

	var textColor = "#464647",
		textWeight = "normal";

	var loadedDataset = [];
	var wordcloudTextScale = d3.scaleLinear();

    var loadingImg = d3.select(targetDOMElement).append("img")
        .attr("src", "resources/img/ring-alt.gif")
        .attr("width", "60px")
        .style("visibility", "hidden")
		.style("position", "absolute");
    var reloadTimeoutFunc = null;

	var svg = d3.select(targetDOMElement)
		.append("svg")
		.attr("width", svgWidth)
		.attr("height", svgHeight);

	var wordcloud = svg.append("g")
		.attr("transform", "translate("+(svgWidth/2)+","+(svgHeight/2)+")");

	var texts = null;

	var topicId = null;

	// ==================== PRIVATE FUNCTIONS ====================

	function update(){
        svg.attr("width", svgWidth)
			.attr("height", svgHeight);
		if(topicId != null){
			render(loadedDataset, topicId);
		}
	}

	function makeTextScale(loadedDataset){
		var wordWeights = [];
		loadedDataset.forEach(function(topic){
			topic.labels.forEach(function(word){
				wordWeights.push(word.weight);
			})
		});
		wordcloudTextScale.domain(d3.extent(wordWeights))
			.range([20,80]);
	}

	function render(dataset, tId){
		clearTimeout(reloadTimeoutFunc);
		if(dataset.length > 0){

			loadingImg.remove();

            var selectedTopic = dataset.find(function(topic){
                return topic.conceptId === tId;
            });
            if(typeof selectedTopic !== "undefined"){
                svg.attr("width", svgWidth)
                    .attr("height", svgHeight);

                wordcloud.attr("transform", "translate("+(svgWidth/2)+","+(svgHeight/2)+")");

                var textData = selectedTopic.labels.map(function(word){
                    return {text:word.label, size:word.weight};
                });

								// console.log(textData);
								var newTextData = textData.slice(0,15);
								// console.log(newTextData);

                GUP_texts(newTextData);



                topicId = tId;
            }
        } else {
            loadingImg.style("visibility", "visible")
                .style("margin-left", (svgWidth/2-30)+"px");
            reloadTimeoutFunc = setTimeout(render,1000, loadedDataset, tId);
		}
	}

	function GUP_texts(textData){
		// if(texts != null){
		// 	texts.remove();
		// 	texts = null;
		// }

		function draw(words){
			texts = wordcloud.selectAll("text").data(words);
			texts.exit().remove();
			texts.enter().append("text")
				.merge(texts)
				.style("font-size", function(d){
					return d.size+"px";
				})
				.style("fill", textColor)
				.attr("transform", function(d){
					return "translate("+[d.x,d.y]+")rotate("+d.rotate+")";
				})
				.attr("text-anchor","middle")
				.style('font-family',"'Open Sans', sans-serif")
				.style("font-weight", textWeight)
				.text(function(d){ return d.text; })
				.classed('noselect', true);
			texts = wordcloud.selectAll("text")
		}

		d3.layout.cloud()
			.size([svgWidth, svgHeight])
			.words(textData)
			.rotate(0)
			.fontSize(function(d){
				return wordcloudTextScale(d.size)
			})
			.text(function(d){
				return d.text;
			})
			.spiral("rectangular")
			.padding(7)
			.font("'Open Sans', sans-serif")
			.random(function(){return 0.5;})
			.on("end", draw)
			.start();

		centerWordcloud();


	}

	function centerWordcloud(){
        var groupW = wordcloud.node().getBBox().width,
            groupH = wordcloud.node().getBBox().height,
            groupX = wordcloud.node().getBBox().x,
            groupY = wordcloud.node().getBBox().y;

        var dx = groupX + (groupW/2),
			dy = groupY + (groupH/2);

        wordcloud.attr("transform", "translate("+(svgWidth/2-dx)+","+(svgHeight/2-dy)+")");
	}

	function hide(){
		texts.remove();
		texts = null;
		topicId = null;
	}

	//================== IMPORTANT do not delete ==================================
	return wordcloudObject; // return the main object to the caller to create an instance of the 'class'
}
