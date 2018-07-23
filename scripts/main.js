
///////////////////////////////////////////////////////////////////////
//
// Module: main
//
// Author: Pierre Le Bras
//
// What it does:
//	Setup the different modules on the html page.
//  Setup modules interactions
//  Launch data load and initial display
//
// Dependencies
//	D3.js v4
//
// Version history
//	v001	11/01/2017	PLeBras	Created.
//
///////////////////////////////////////////////////////////////////////

"use strict"; //This catches accidental global declarations

// To be set by html:
var incTable = false,
    hexmapDataUrl = "",
    topicModelDataUrl = "",
    pieDataUrl;
    // tableData;

var hexmapSeletor = "div#hexmapDiv",
    wordcloudSelector = "div#wordcloudDiv",
    tableSelector = "div#tableDiv",
    hexmapTooltipSelector = "div#hexToolTipDiv",
    clickDetailsMessageSelector = "div#detailsMessage";

var hexmapData = [],
    pieData = [],
    tableData=[];

var userUpdateDiv,
    hexmap,
    wordcloud,
    table,
    hexTooltip;

var activeColor ='',
    genericTopicsColour ='',
    activeOrgNGenericData=[],
    activeOrgGenericData=[],
    genericTopicIds =[];

function loadFiles(){
    //load in the two files that we need
    //make global to be used in renderer
    d3.json("resources/data/paperDetails.json",function(error,paperData){
      if(error){
        console.log("ERROR LOADING PAPER DATA");
      }

      paperDetailed=paperData["paper_details"];

      d3.json("resources/data/topicDetails.json",function(error, topicData){
        if(error){
          console.log("ERROR LOADING TOPIC DATA");
        }

        topicDetailed=topicData["topic_details"];
      });
    });
}

function makeAppPage(numTopics){
  loadFiles();
  
  table=getNewTableRenderer("#tableDiv");

  userUpdateDiv = d3.select("body");

  hexTooltip = getToolTipObj(hexmapTooltipSelector);

  wordcloud = getWordcloudRenderer(wordcloudSelector)
      .setWidth(700)
      .setHeight(300);

  hexmap = getHexmapRender(hexmapSeletor, numTopics)
      .hexClickCallback(function(d, i){
          d3.select(clickDetailsMessageSelector).remove();
          wordcloud.render(d.conceptId);
          table.render(d.conceptId);
      })
      .hexMouseoverCallback(function(d){

          d.highlightHex = true;
          hexmap.updateHighlights();
          d.highlightHex = false;
      })
      .hexMouseoutCallback(function(){
          hexmap.updateHighlights();
      })
      .render();
}

function loadDataAndRender(){
    d3.json(hexmapDataUrl, function(error, jsonData) {
        if (error) return userUpdate("Failed attepting to load JSON from :" + hexmapDataUrl);

        hexmapData = jsonData;
        hexmap.loadAndRenderDataset(hexmapData);

        hexmapData.conceptsData.forEach(function(d){
            if(d.clusterId < 0)
                genericTopicIds.push(d.conceptId);
        });

        var ratio = 0.8;

        d3.selectAll(".hexShapeClass")
          .attr("id",function(d){
            // console.log(d);
            return "topic"+d["conceptId"];
          });

        wordcloud.loadDataset(hexmapData.conceptsData);
        wordcloud.setWidth(hexmap.getSvgWidth()*ratio);

        if(incTable){
            // console.log("hello");
            d3.json(topicModelDataUrl, function(error, jsonData){
                if(error) return userUpdate("Failed attepting to load JSON from :" + topicModelDataUrl);

                // tableData=jsonData;

                // d3.json("resources/data/CHI-2018.json", function(error, chiData){
                //   if(error) return userUpdate("Failed attempting to load JSON");
                //   console.log(chiData);
                // })

                // buildSideTable(jsonData);
                // table.loadDataset(jsonData.topicsDocsDistrib);
                //console.log(jsonData.topicsDocsDistrib)
                wordcloud.setWidth(hexmap.getSvgWidth()*ratio);
                // table.setWidth(hexmap.getSvgWidth()*ratio);

                //getPieData
                // d3.json(pieDataUrl, function(error, jsonData){
                //     if(error) return userUpdate("Failed attepting to load JSON from :" + pieDataUrl);
                //     pieData=jsonData;
                    updateHeatMap();
                // });
            });
        }


    })
}

function buildSideTable(jsonData)
{
    var tableElements = [];

    // console.log(jsonData.metadata.columnNames.length);

    for(var i = 0; i < jsonData.metadata.columnNames.length; i++)
    {
        var tableObj = {};
        tableObj.title = jsonData.metadata.columnNames[i];
        tableObj.colNumber = i;
        tableObj.accessor = function(d){return d.docInfo[jsonData.metadata.columns[this.colNumber]]};
        tableObj.mouseover = function(d){};
        tableObj.mouseout = function(d){};
        tableElements.push(tableObj);
    }

    tableObj = {};
    tableObj.title = "Relevance";
    tableObj.accessor = function(d){
        return Math.floor(d.topicWeight*100)+"%"

    };
    tableObj.mouseover = function(d){};
    tableObj.mouseout = function(d){};
    tableElements.push(tableObj);

    tableObj = {};
    tableObj.title = "";
    tableObj.accessor = function(d){
        //If number of words in the document less than 20 show a warning sign
        if(d.wordCount < 20){
            return "<span class='icon-warning'></span>";
        } else { return "";}
    };
    tableObj.mouseover = function(d){
            if(d.wordCount < 20 ) {
                hexTooltip.background("#D65076");
                hexTooltip.show("<b>Warning:</b> Topic contribution derived from only "+d.wordCount+" words.", -5, -15, "right");
            }
        };
    tableObj.mouseout = function(d){
            hexTooltip.hide();
        };
    tableElements.push(tableObj);

    // console.log(tableElements);

    // if(incTable){
    //     table = getTableRenderer(tableSelector)
    //         .setInfoAccessors(tableElements)
    //         .setWidth(700)
    //         .setNRowsArray([10, 20, 50, 100]);
    // }
}


function userUpdate(message){
    userUpdateDiv
        .append("p")
        .text(message);
}

function updateHeatMap(){

    genericTopicsColour ='#5B5EA6';
    activeColor = '#D65076';
    pieData.forEach(function (f) {
        if(!(genericTopicIds.includes(f.conceptId)) ){
            activeOrgNGenericData.push({
                label: "All",
                conceptId: f.conceptId,
                numberOfDocuments: f.topicData[0].numberOfDocuments
            })
        }else{
            activeOrgGenericData.push({
                label: "All",
                conceptId: f.conceptId,
                numberOfDocuments: f.topicData[0].numberOfDocuments
            })
        }

    });

    hexmap
        .hexColor(activeOrgNGenericData, activeColor);
    hexmap
        .hexColor(activeOrgGenericData, genericTopicsColour);

}
