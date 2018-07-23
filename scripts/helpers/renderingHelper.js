var csvData;

function renderColours(colour){
  var filename ="resources/data/inferredDocs/"+colour+".csv";

  var buttons = document.getElementsByTagName("button");
  for(var i = 0 ; i < buttons.length ; i++){
    buttons[i].removeAttribute('id');
  }

  switch(colour){
    case 'red':
      document.getElementsByClassName('button')[0].setAttribute('id','activeButton');
      // currColourArr=["rgb(188,37,0,0)","rgb(188,37,0,25)","rgb(188,37,0,50)","rgb(188,37,0,75)","rgb(188,37,0,100)"];
      break;
    case 'blue':
      document.getElementsByClassName('button')[1].setAttribute('id','activeButton');
      // currColourArr=["rgb(91,94,166,0)","rgb(91,94,166,25)","rgb(91,94,166,50)","rgb(91,94,166,75)","rgb(91,94,166,100)"];
      break;
    case 'green':
      document.getElementsByClassName('button')[2].setAttribute('id','activeButton');
      // currColourArr=["rgb(0,152,116,0)","rgb(0,152,116,25)","rgb(0,152,116,50)","rgb(0,152,116,75)","rgb(0,152,116,100)"];
      break;
    case 'yellow':
      document.getElementsByClassName('button')[3].setAttribute('id','activeButton');
      // currColourArr=["rgb(239,192,79,0)","rgb(239,192,79,25)","rgb(239,192,79,50)","rgb(239,192,79,75)","rgb(239,192,79,100)"];
      break;
    case 'purple':
      document.getElementsByClassName('button')[4].setAttribute('id','activeButton');
      // currColourArr=["rgb(111,65,129,0)","rgb(111,65,129,25)","rgb(111,65,129,50)","rgb(111,65,129,75)","rgb(111,65,129,100)"];
      break;
    case 'orange':
      document.getElementsByClassName('button')[5].setAttribute('id','activeButton');
      // currColourArr=["rgb(221,65,36,0)","rgb(221,65,36,25)","rgb(221,65,36,50)","rgb(221,65,36,75)","rgb(221,65,36,100)"];
      break;
  }

  d3.csv(filename,function(error,data){
    if(error){
      console.log("ERROR LOADING CSV DATA");
    }

    csvData=data[0];
    csvData = csvData[Object.keys(csvData)[0]].split("	");
    csvData = csvData.slice(2,csvData.length);
    renderHex();
  })
}

function renderHex(){
  var newBindingData = [];
  for(var i = 0 ; i < csvData.length ; i++){
    newBindingData.push({"conceptId":i, "simVal":csvData[i]});
  }

  hexmap.hexColor(newBindingData,'rgb(214,79,118)');
}
