var format = d3.time.format("%Y-%m-%d"),
	histogramChart = dc.barChart("#histogram"),
	naturePieChart = dc.pieChart("#naturePie"),
	data,
	cases,
	url = "http://www.federallitigationclearinghouse.com/php/graphQuery.php?action=case_person_party&query=A+C+and+S%2C+Inc.";
	url = "AJames.json",
	colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];

d3.json(url, function(json){
		data = [];
		z = json;
		json.aaData.forEach(function(d){
			var tempCase = {};
			var varNames = ['flcNum', 'name', 'court', 'pJudge', 'rJudge', 'nature', 'statute', 'disposition', 'filed', 'terminated'];
			varNames.forEach(function(varName, i){
				tempCase[varName] =  d[i];
			});
			tempCase.filed = format.parse(tempCase.filed);
			tempCase.terminated = format.parse(tempCase.terminated);
			data.push(tempCase);
		});	
	cases = crossfilter(data);

	var tempNature = cases.dimension(function(d){return d.nature;});
	var natureKeys = [];
	tempNature.group().top(4).forEach(function(d){natureKeys.push(d.key);});

    all = cases.groupAll(),
	nature = cases.dimension(function(d){
		return (natureKeys.indexOf(d.nature) != -1) ? d.nature : "Other";
	});
	natureKeys = fixKeyArray(natureKeys);
	natures = nature.group();
	natureGroup = nature.group().reduceSum(function(d){return 1;});
	volumeByDay = cases.dimension(function(d){return d3.time.year(d.filed);});
	volumeByDayGroup = volumeByDay.group().reduceSum(function(d){return 1;});
	judge = cases.dimension(function(d){return d.judge});
	judges = judge.group();

	histogramChart
		.width(800)
		.height(200)
	    .dimension(volumeByDay) 
	    .group(volumeByDayGroup) 
	    .x(d3.time.scale().domain([new Date(1986, 0, 1), new Date(2003, 11, 31)]))
	    .round(d3.time.month.round)
	    .xUnits(d3.time.months);

    naturePieChart
		.width(200)
        .height(200)
        .transitionDuration(200)
        .radius(100)
        .innerRadius(60)
        .dimension(nature)
        .group(natureGroup)
        .colors(colors)
        .label(function(d){return d.data.value;})
    addBlocks('naturePieBlocks', colors, natureKeys);
	dc.renderAll();
});

//creates legend
function addBlocks(divId, colors, names){
	var html = '<div class = "legendSpace"></div>';
	var test = document.getElementById("widthTest");
	for (var i = 0; i < names.length; i++){
		html = html + '<div class = "legendLine">'
		html = html + '<div class = "colorBlock" style = "background-color:' + colors[i] + ';"></div>';
		html = html + shortenString(names[i], 180) + '</div>';
	}
	document.getElementById(divId).innerHTML = html;
	console.log(html);
}

//returns key array with 'other' 
function fixKeyArray(keys){
	keys.push('Other');
	return keys;
}

function shortenString(str, width){
	var shortened = false;
	var printStr = str;
	while (textWidth(printStr + (shortened ? '...' : '')) > width){
		shortened = true;
		printStr = printStr.slice(0,-1);
		console.log(printStr);
	}
	return printStr + (shortened ? '...' : '');
}

function textWidth(str){
	document.getElementById("widthTest").innerHTML = str;
	return document.getElementById("widthTest").clientWidth;
}
