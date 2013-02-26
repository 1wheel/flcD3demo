var format = d3.time.format("%Y-%m-%d"),
	histogramChart = dc.barChart("#histogram"),
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
	
	volume = cases.dimension(function(d){return d3.time.year(d.filed);});
	volumeGroup = volume.group().reduceSum(function(d){return 1;});

	bars = volume.group().all();
	histogramChart.width(1100)
        .height(230)
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .dimension(volume)
        .group(volumeGroup)
        .elasticY(true)
        .centerBar(false)
        .gap(1)
        .round(dc.round.floor)
        .xUnits(d3.time.years)
	    .x(d3.time.scale().domain([d3.time.year.round(bars[0].key), d3.time.year.round(bars[bars.length-1].key)]))
        .renderHorizontalGridLines(false)
        .yAxis().tickFormat(d3.format("d"));

	dc.dataTable("#data-table")
	    .dimension(volume)
	    .group(function(d) {return 1;})
	    .size(10)
	    .columns([
	        function(d) { return '<a href="http://www.federallitigationclearinghouse.com/php/casePage.php?caseTrackNo=' + d.flcNum + '">' + d.flcNum + '</a>'; },
	        function(d) { return d.name; },
	        function(d) { return d.court; },
	        function(d) { return d.pJudge; },
	        function(d) { return d.rJudge; },
	        function(d) { return d.nature; },
	        function(d) { return d.statute; },
	        function(d) { return d.disposition; },
	        function(d) { return d3.time.format("%Y-%M-%d")(d.filed); },
	        function(d) { return d3.time.format("%Y-%M-%d")(d.terminated); }
	    ])
	    .order(d3.ascending);

	//several pie charts are being drawn; this function is used
    function addPieChart(id, key, colors){
		tempNature = cases.dimension(function(d){return d[key];});
		var natureKeys = [];
		tempNature.group().top(4).forEach(function(d){natureKeys.push(d.key);});

		console.log(natureKeys);
	    all = cases.groupAll(),
		nature = cases.dimension(function(d){
			return (natureKeys.indexOf(d[key]) != -1) ? d[key] : "Other";
		});
		if (nature.group().all().length > natureKeys.length){
			natureKeys.push("Other");
		}
		natures = nature.group();
		natureGroup = nature.group().reduceSum(function(d){return 1;});

	    addBlocks(id + 'Blocks', colors, natureKeys);

	    return dc.pieChart("#" + id)
			.width(200)
	        .height(200)
	        .transitionDuration(200)
	        .radius(100)
	        .innerRadius(70)
	        .dimension(nature)
	        .group(natureGroup)
	        .colors(colors)
	        .colorDomain([0,5])
	        .colorAccessor(function(d){
	        	console.log(natureKeys);
	        	console.log(d.data.key);
	        	console.log(colors[natureKeys.indexOf(d.data.key)]);
	        	return natureKeys.indexOf(d.data.key);
	        })
	        .label(function(d){return d.data.value;});
	}
	naturePieChart = addPieChart('naturePie', 'nature', colors);
	pJudgePieChart = addPieChart('pJudgePie', 'pJudge', colors);
	courtPieChart = addPieChart('courtPie', 'court', colors);
	dispositionPieChart = addPieChart('dispositionPie', 'disposition', colors);

	dc.renderAll();
});

//creates legend
function addBlocks(divId, colors, names){
	var html = '<div class = "legendSpace"></div>';
	var test = document.getElementById("widthTest");
	for (var i = 0; i < names.length; i++){
		html = html + '<div class = "legendLine">'
		html = html + '<div class = "colorBlock" style = "background-color:' + colors[i] + ';"></div>';
		html = html + shortenString(names[i], 300) + '</div>';
	}
	document.getElementById(divId).innerHTML = html;
}

function shortenString(str, width){
	var shortened = false;
	var printStr = str;
	while (textWidth(printStr + (shortened ? '...' : '')) > width){
		shortened = true;
		printStr = printStr.slice(0,-1);
	}
	return printStr + (shortened ? '...' : '');
}

function textWidth(str){
	document.getElementById("widthTest").innerHTML = str;
	return document.getElementById("widthTest").clientWidth;
}
