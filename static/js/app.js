"use strict";

// Form 
var mountNode = $('#content');
var stockForm = React.createClass({displayName: "stockForm",

    handleSubmit: function(e) {
        e.preventDefault();
        var stockX = React.findDOMNode(this.refs.stockX).value.trim();
        var stockY = React.findDOMNode(this.refs.stockY).value.trim();
        var d = new Date();
        $.ajax({
            url: '/start',
            type: 'POST',
            data: JSON.stringify({
                stockX: stockX, stockY: stockY, year: d.getFullYear().toString(), 
                month: d.getMonth().toString(), date: d.getDate().toString()
            }),
            contentType: 'application/json',
            dataType: 'json',
            cache: false,
            success: function(data) {

                $("#correlation").html(data.correlation);
                $("#covariance").html(data.covariance);
                $("#chartName").html(stockX.toUpperCase());
                $("#chartName2").html(stockY.toUpperCase());
                $("#correlationGraph svg").empty();
                $("#chart").empty();
                $("#chart2").empty();

                nv.addGraph(function() {
                    var chart = nv.models.scatterChart()
                        .showDistX(true)
                        .showDistY(true)
                        .clipVoronoi(false)
                        .useVoronoi(true)
                        .interactive(true)
                        .showLegend(false)
                        .color(d3.scale.category10().range())
                        .duration(300)
                        .width(600)
                    ;

                    chart.tooltip.enabled(true);

                    chart.tooltip.contentGenerator(function(key) {
                        return key.point.x + ', ' + key.point.y; 
                    });

                    chart.dispatch.on('renderEnd', function(){
                        console.log('render complete');
                    });

                    chart.xAxis.tickFormat(d3.format('.02f'));
                    chart.yAxis.tickFormat(d3.format('.02f'));

                    var scatterdata = [ 
                        {
                            key    : "Group 0",
                            values : []//{x:"",y:""}
                        }
                    ];

                    d3.csv("/getScatter", function (error, csv) {
                        scatterdata[0].values = csv.map(function(d) 
                            { 
                            d.x = +d.xchange;  
                            d.y = +d.ychange;  
                            return d;  
                            });

                    d3.select('#correlationGraph svg')
                        .datum(scatterdata)
                        .call(chart);

                    nv.utils.windowResize(chart.update);
                    return chart;
                    });
                });
                
                var parseDate = d3.time.format("%Y-%m-%d").parse;
                d3.csv("/getCSV", function(err, data)  {
                    data.forEach(function(d, i)  {
                        d.date = new Date(parseDate(d.date).getTime());
                        d.open = +d.Open;
                        d.high = +d.High;
                        d.low = +d.Low;
                        d.close = +d.Close;
                        d.volume = +d.Volume;
                        // console.log(d);
                    });
                    React.render(React.createElement(CandleStickChartWithMACDIndicator, {data: data.reverse()}), document.getElementById("chart"));
                });

                d3.csv("/getCSV2", function(err, data)  {
                    data.forEach(function(d, i)  {
                        d.date = new Date(parseDate(d.date).getTime());
                        d.open = +d.Open;
                        d.high = +d.High;
                        d.low = +d.Low;
                        d.close = +d.Close;
                        d.volume = +d.Volume;
                        // console.log(d);
                    });
                    React.render(React.createElement(CandleStickChartWithMACDIndicator, {data: data.reverse()}), document.getElementById("chart2"));
                });
            },
            error: function(xhr, status, err) {
                console.error('/start', status, err.toString());
            }
        });
    },

    render: function() {
        return (
            React.createElement("div", {className: "inputForm", onSubmit: this.handleSubmit}, 
            React.createElement("form", {className: "form"}, 
                React.createElement("h3", {className: "form-heading"}, "Add items"), 
                React.createElement("div", {className: "form-group"}, 
                        React.createElement("input", {type: "text", className: "form-control", placeholder: "X - Axis", ref: "stockX", required: true, autofocus: true})
                ), 
                React.createElement("div", {className: "form-group"}, 
                        React.createElement("input", {type: "text", className: "form-control", placeholder: "Y - Axis", ref: "stockY", required: true, autofocus: true})
                ), 
                React.createElement("button", {type: "submit", value: "Post", className: "btn btn-lg btn-success btn-block"}, 
                    React.createElement("span", {className: "glyphicon glyphicon-pencil"}), " Draw correlation"
                )
            )
            )
        );
    }
});


React.render(
    React.createElement(stockForm, null),
    document.getElementById('formTemplate')
);

// Graphs
var scatterPlot = React.createClass({displayName: "scatterPlot",
    render: function() {
        return (
            React.createElement("div", null)

        );
    }
});

var ChartCanvas = ReStock.ChartCanvas
    , XAxis = ReStock.XAxis
    , YAxis = ReStock.YAxis
    , CandlestickSeries = ReStock.CandlestickSeries
    , DataTransform = ReStock.DataTransform
    , Chart = ReStock.Chart
    , DataSeries = ReStock.DataSeries
    , ChartWidthMixin = ReStock.helper.ChartWidthMixin
    , HistogramSeries = ReStock.HistogramSeries
    , EventCapture = ReStock.EventCapture
    , MouseCoordinates = ReStock.MouseCoordinates
    , CrossHair = ReStock.CrossHair
    , TooltipContainer = ReStock.TooltipContainer
    , OHLCTooltip = ReStock.OHLCTooltip
    , OverlaySeries = ReStock.OverlaySeries
    , LineSeries = ReStock.LineSeries
    , MovingAverageTooltip = ReStock.MovingAverageTooltip
    , CurrentCoordinate = ReStock.CurrentCoordinate
    , AreaSeries = ReStock.AreaSeries
    , EdgeContainer = ReStock.EdgeContainer
    , EdgeIndicator = ReStock.EdgeIndicator
    , MACDSeries = ReStock.MACDSeries
    , MACDIndicator = ReStock.indicator.MACD
    , MACDTooltip = ReStock.tooltip.MACDTooltip
;


var CandleStickChartWithMACDIndicator = React.createClass({displayName: "CandleStickChartWithMACDIndicator",
    mixins: [ChartWidthMixin],
    render:function() {
        if (this.state === null || !this.state.width) return React.createElement("div", null);

        var dateFormat = d3.time.format("%Y-%m-%d");

        return (
            React.createElement(ChartCanvas, {width: this.state.width, height: 600, 
                margin: {left: 70, right: 70, top:20, bottom: 30}, data: this.props.data, interval: "D", 
                initialDisplay: 200, type: "svg"}, 
                React.createElement(DataTransform, {transformType: "stockscale"}, 
                    React.createElement(Chart, {id: 1, yMousePointerDisplayLocation: "right", height: 390, 
                            yMousePointerDisplayFormat: function(y)  {return y.toFixed(2);}, padding: { top: 10, right: 0, bottom: 20, left: 0}}, 
                        React.createElement(YAxis, {axisAt: "right", orient: "right", ticks: 5}), 
                        React.createElement(XAxis, {axisAt: "bottom", orient: "bottom", noTicks: true}), 
                        React.createElement(DataSeries, {yAccessor: CandlestickSeries.yAccessor}, 
                            React.createElement(CandlestickSeries, null), 
                            React.createElement(OverlaySeries, {id: 0, type: "ema", options: { period: 26}}, 
                                React.createElement(LineSeries, null)
                            ), 
                            React.createElement(OverlaySeries, {id: 1, type: "ema", options: { period: 12}}, 
                                React.createElement(LineSeries, null)
                            )
                        )
                    ), 
                    React.createElement(CurrentCoordinate, {forChart: 1, forOverlay: 0}), 
                    React.createElement(CurrentCoordinate, {forChart: 1, forOverlay: 1}), 
                    React.createElement(Chart, {id: 2, yMousePointerDisplayLocation: "left", yMousePointerDisplayFormat: d3.format(".4s"), 
                            height: 150, origin: function(w, h)  {return [0, h - 310];}}, 
                        React.createElement(YAxis, {axisAt: "left", orient: "left", ticks: 5, tickFormat: d3.format("s")}), 
                        React.createElement(DataSeries, {yAccessor: function(d)  {return d.volume;}}, 
                            React.createElement(HistogramSeries, {className: function(d)  {return d.close > d.open ? 'up' : 'down';}}), 
                            React.createElement(OverlaySeries, {id: 3, type: "sma", options: { period: 10, pluck:'volume'}}, 
                                React.createElement(AreaSeries, null)
                            )
                        )
                    ), 
                    React.createElement(CurrentCoordinate, {forChart: 2, forOverlay: 3}), 
                    React.createElement(CurrentCoordinate, {forChart: 2}), 
                    React.createElement(EdgeContainer, null, 
                        React.createElement(EdgeIndicator, {className: "horizontal", itemType: "last", orient: "right", 
                            edgeAt: "right", forChart: 1, forOverlay: 0}), 
                        React.createElement(EdgeIndicator, {className: "horizontal", itemType: "last", orient: "right", 
                            edgeAt: "right", forChart: 1, forOverlay: 1}), 
                        React.createElement(EdgeIndicator, {className: "horizontal", itemType: "first", orient: "left", 
                            edgeAt: "left", forChart: 1, forOverlay: 0}), 
                        React.createElement(EdgeIndicator, {className: "horizontal", itemType: "first", orient: "left", 
                            edgeAt: "left", forChart: 1, forOverlay: 1})
                    ), 
                    React.createElement(Chart, {id: 3, yMousePointerDisplayLocation: "right", yMousePointerDisplayFormat: function(y)  {return y.toFixed(2);}, 
                            height: 140, origin: function(w, h)  {return [0, h - 150];}, padding: { top: 10, right: 0, bottom: 10, left: 0}
                            }, 
                        React.createElement(XAxis, {axisAt: 150, orient: "bottom"}), 
                        React.createElement(YAxis, {axisAt: "right", orient: "right", ticks: 2}), 
                        React.createElement(DataSeries, {indicator: MACDIndicator, options: { fast: 12, slow: 26, signal: 9}}, 
                            React.createElement(MACDSeries, null)
                        )
                    ), 
                    React.createElement(MouseCoordinates, {xDisplayFormat: dateFormat, type: "crosshair"}), 
                    React.createElement(EventCapture, {mouseMove: true, zoom: true, pan: true, mainChart: 1, defaultFocus: false}), 
                    React.createElement(TooltipContainer, null, 
                        React.createElement(OHLCTooltip, {forChart: 1, origin: [-40, -10]}), 
                        React.createElement(MovingAverageTooltip, {forChart: 1, onClick: function(e)  {return console.log(e);}, origin: [-38, 5]}), 
                        React.createElement(MACDTooltip, {forChart: 3, origin: function(w, h)  {return [-38, h - 140];}})
                    )
                )
            )
        );
    }
});

// <MACDTooltip forChart={3} origin={(w, h) => [-38, h - 140]}/>