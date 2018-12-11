var data = [
  {"Hour":1,"average":5376.7104},
  {"Hour":2,"average":5121.2075},
  {"Hour":3,"average":4949.1258},
  {"Hour":4,"average":4853.5275},
  {"Hour":5,"average":4841.5211},
  {"Hour":6,"average":4988.4847},
  {"Hour":7,"average":5357.4819},
  {"Hour":8,"average":5802.9825},
  {"Hour":9,"average":6165.1113},
  {"Hour":10,"average":6431.9775},
  {"Hour":11,"average":6597.4307},
  {"Hour":12,"average":6701.1854},
  {"Hour":13,"average":6759.3802},
  {"Hour":14,"average":6789.657},
  {"Hour":15,"average":6796.6403},
  {"Hour":16,"average":6822.0937},
  {"Hour":17,"average":6878.9317},
  {"Hour":18,"average":6921.5855},
  {"Hour":19,"average":6811.476},
  {"Hour":20,"average":6690.2026},
  {"Hour":21,"average":6561.4253},
  {"Hour":22,"average":6390.3849},
  {"Hour":23,"average":6099.745},
  {"Hour":24,"average":5733.626}
]

var ƒ = d3.f

var sel = d3.select('#graph').html('')
var c = d3.conventions({
  parentSel: sel, 
  totalWidth: sel.node().offsetWidth - 200, 
  height: 300, 
  width: 600,
  margin: {left: 50, right: 50, top: 30, bottom: 30}
})

c.svg.append('rect').at({width: c.width, height: c.height, opacity: 0});
c.svg.append('text').at({width: c.width, height: c.height})
                    .attr("class", "axis")
                    .text("Hour of the Day")
                    .attr("transform", "translate(" + c.width / 2 + ", " + (c.height + 40) + ")")
                    // .attr("", "middle")
                    // .style("font-size", "15px")
                    // .style("font-weight", "bold");

c.svg.append('text').at({width: c.width, height: c.height})
                    .attr("class", "axis")
                    .text("Load (MWh)")
                    .attr("transform", "rotate(270, 50, 100)")

c.x.domain([1, 24])
c.y.domain([4500, 7000])

c.xAxis.ticks(24).tickFormat(ƒ())
c.yAxis.ticks(5).tickFormat(d => d)

var area = d3.area().x(ƒ('Hour', c.x)).y0(ƒ('average', c.y)).y1(c.height)
var line = d3.area().x(ƒ('Hour', c.x)).y(ƒ('average', c.y))

var clipRect = c.svg
  .append('clipPath#clip')
  .append('rect')
  .at({width: c.x(2) - 2, height: c.height})

var correctSel = c.svg.append('g').attr('clip-path', 'url(#clip)')

correctSel.append('path.area').at({d: area(data)})
correctSel.append('path.line').at({d: line(data)})
yourDataSel = c.svg.append('path.your-line')

c.drawAxis()

yourData = data
  .map(function(d){ return {Hour: d.Hour, average: d.average, defined: 0} })
  .filter(function(d){
    if (d.Hour == 2) d.defined = true
    return d.Hour >= 2
  })

var completed = false

var drag = d3.drag()
  .on('drag', function(){
    var pos = d3.mouse(this)
    var Hour = clamp(2, 24, c.x.invert(pos[0]))
    var average = clamp(0, c.y.domain()[1], c.y.invert(pos[1]))

    yourData.forEach(function(d){
      if (Math.abs(d.Hour - Hour) < .5){
        d.average = average
        d.defined = true
      }
    })

    yourDataSel.at({d: line.defined(ƒ('defined'))(yourData)})

    if (!completed && d3.mean(yourData, ƒ('defined')) == 1){
      completed = true
      clipRect.transition().duration(1500).attr('width', c.x(24));
      d3.select("#after").transition().delay(1500).style("visibility", "visible");
    }
  })

c.svg.call(drag)

function clamp(a, b, c){ return Math.max(a, Math.min(b, c)) }