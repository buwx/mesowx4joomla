var mesowx = mesowx || {};

mesowx.Config = (function() {
    var Config = {};

    /************************************************************
      Basic configuration parameters
     ************************************************************/

    // the Meso entity ID for data configured in the Meso config.json
    Config.entityId = 'weewx_archive';

    // These define the field defaults and are referred to in other places in this configuration
    // Properties:
    //    fieldID = the Meso-defined field ID from the Meso config.json
    //    unit = the unit to display including the label (value will be converted, if necessary)
    //    decimals = the number of decimals to display (rounding, if necessary)
    //    agg = how to aggregate the field (used when charting)
    //    label = the label to use when referencing the field in the UI
    Config.fieldDefaults = {
        'dateTime':         new meso.FieldDef('dateTime',       meso.Unit.s,            0,      meso.Agg.avg),
        'outTemp':          new meso.FieldDef('outTemp',        mesowx.Unit.c,          1,      meso.Agg.avg,   'Temperatur'),
        'dewpoint':         new meso.FieldDef('dewpoint',       mesowx.Unit.c,          1,      meso.Agg.avg,   'Taupunkt'),
        'rain':             new meso.FieldDef('rain',           mesowx.Unit.mm,         2,      meso.Agg.sum,   'Regen'),
        'windSpeed':        new meso.FieldDef('windSpeed',      mesowx.Unit.kph,        1,      meso.Agg.avg,   'Wind'),
        'windDir':          new meso.FieldDef('windDir',        mesowx.Unit.deg,        0,      meso.Agg.avg,   'Windrichtung'),
        'windGust':         new meso.FieldDef('windGust',       mesowx.Unit.kph,        0,      meso.Agg.max,   'Böen'),
        'outHumidity':      new meso.FieldDef('outHumidity',    mesowx.Unit.perc,       1,      meso.Agg.avg,   'Rel. Feuchte'),
        'barometer':        new meso.FieldDef('barometer',      mesowx.Unit.hPa,        1,      meso.Agg.avg,   'Luftdruck')
    };

    // the cardinal direction labels to use (typically used for charts)
    Config.degreeOrdinalLabels = {
        "0"   : "N",
        "90"  : "O",
        "180" : "S",
        "270" : "W"
    };

    // The cardinal direction labels in order starting at 0 degrees, assumes equal separation between ordinals
    // the granularity can be changed (e.g. ["N", "E", "S", "W"] will yeild the label "N" for values between 315-45 degrees, 
    // "E" for 45-135 degrees, etc.)
    Config.windDirOrdinalText = ["N","NNO", "NO","ONO",
                                "O","OSO","SO","SSO",
                                "S","SSW","SW","WSW",
                                "W","WNW","NW","NNW"];

    // global highcharts options
    Config.highchartsOptions = {
        // see http://api.highcharts.com/highstock#global
        global: {
            useUTC: false
        },
        // see http://api.highcharts.com/highstock#lang
        lang: {
			decimalPoint: ",",
			months: ["Januar" , "Februar" , "März" , "April" , "Mai" , "Juni" , "Juli" , "August" , "September" , "Oktober" , "November" , "Dezember"],
			shortMonths: [ "Jan" , "Feb" , "Mar" , "Apr" , "Mai" , "Jun" , "Jul" , "Aug" , "Sep" , "Okt" , "Nov" , "Dez"],
			weekdays: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]
        }
        // theme, see http://api.highcharts.com/highcharts#Highcharts.setOptions
    };


    /************************************************************
      Advanced Configuration parameters
     ************************************************************/

    // Data provider instances
    // raw data provider
    Config.rawDataProvider = new meso.AggregateDataProvider({
        baseUrl: "/charts/meso/data.php?entity_id=" + Config.entityId
    });
    // archive data provider
    Config.archiveDataProvider = new meso.AggregateDataProvider({
        baseUrl: "/charts/meso/data.php?entity_id=" + Config.entityId
    });
    // raw stats data provider
    Config.rawStatsDataProvider = new meso.StatsDataProvider({
        url: "/charts/meso/stats.php",
        entityId: Config.entityId
    });
    // archive stats data provider
    Config.archiveStatsDataProvider = new meso.StatsDataProvider({
        url: "/charts/meso/stats.php",
        entityId: Config.entityId
    });


    // function to use for determining direction labels
    Config.defaultDegreeToCardinalTextConverter = 
            mesowx.Util.createDegreeToCardinalTextConverter(Config.windDirOrdinalText);

    // defaults for chart components (axes, series definitions, chart options, etc)
    Config.chartDefaults = {};

    // The common "bucket" of x-axis definitions, referred to by chart configurations.
    // Refer to http://api.highcharts.com/highstock#xAxis for highStockAxisOptions parameters
    Config.chartDefaults.xAxes = {
        "dateTime" : {
            field: 'dateTime', // the dateTime entity field ID
            highstockAxisOptions : {
                minRange : null //2*60*1000; // 2 minutes
            }
        }
    };

    // The common "bucket" of y-axis definitions, referred to by chart configurations.
    // Refer to http://api.highcharts.com/highstock#yAxis for highStockAxisOptions parameters
    Config.chartDefaults.yAxes = {
        // temp axis
        "temp" : { 
            axisId : "tempAxis",
            unit : Config.fieldDefaults.outTemp.unit,
            highstockAxisOptions : {
                title: {
                    text: 'Temperatur'
                },
                labels: {
					format: '{value}°C',
                    align: 'left',
                    x: 10
                },
                height: '30%',
                offset: 5,
                minorTickInterval: 'auto',
                minorGridLineColor: '#F0F0F0',
                opposite: false
            }
        },
        // barameter axis
        "barometer" : {
            axisId : "barometerAxis",
            unit : Config.fieldDefaults.barometer.unit,
            highstockAxisOptions : {
                title: {
                    text: 'Luftdruck'
                },
                labels: {
					format: '{value}hPa',
                    align: 'right',
                    x: -10
                },
                height: '30%',
                offset: 5,
                opposite: true
            },
        },
        // wind speed axis
        "windSpeed" : {
            axisId : "windSpeedAxis",
            unit : Config.fieldDefaults.windSpeed.unit,
            highstockAxisOptions : {
                title: {
                    text: 'Wind'
                },
                labels: {
					format: '{value}km/h',
                    align: 'left',
                    x: 10
                },
                height : '30%',
                top : '40%',
                offset: 5,
                minorTickInterval: 'auto',
                minorGridLineColor: '#F0F0F0',
                min: 0,
                maxPadding: 0,
                opposite: false
            },
        },
        // wind dir axis
        "windDir" : {
            axisId : "windDirAxis",
            unit : Config.fieldDefaults.windDir.unit,
            highstockAxisOptions : {
                title: {
                    text: 'Richtung'
                },
                labels: {
                    formatter: function() {
                        return Config.degreeOrdinalLabels[this.value.toString()]; 
                    },
                    align: 'right',
                    x: -10
                },
                height : '30%',
                top : '40%',
                offset: 5,
                min: 0,
                max: 360,
                tickInterval: 90,
                opposite: true
            },
        },
        // rain axis
        "rain" : {
            axisId : "rainAxis",
            unit : Config.fieldDefaults.rain.unit,
            highstockAxisOptions : {
                title: {
                    text: 'Niederschlag'
                },
                labels: {
					format: '{value}mm',
                    align: 'left',
                    x: 10
                },
                height : '20%',
                top : '80%',
                offset: 5,
                minorTickInterval: 'auto',
                minorGridLineColor: '#F0F0F0',
                min: 0,
                opposite: false
            },
        },
        // humidity axis
        "humidity" : {
            axisId : "humidityAxis",
            unit : Config.fieldDefaults.outHumidity.unit,
            highstockAxisOptions : {
                title: {
                    text: 'Luftfeuchtigkeit'
                },
                labels: {
					format: '{value}%',
                    align: 'right',
                    x: -10
                },
                height : '20%',
                top : '80%',
                offset: 5,
                min: 0,
                max: 100,
                tickInterval: 25,
                opposite: true
            },
        },
    };

    // The common "bucket" of chart data series definitions, referred to by chart configurations.
    // This is the data that will be displayed on the chart, and is always associated with an
    // axis. Obviously that axis must also be configured on the chart in order to be used.
    // Refer to http://api.highcharts.com/highstock#plotOptions for highStockSeriesOptions parameters
    Config.chartDefaults.series = {
        // out temp
        "outTemp" : {
            fieldDef : Config.fieldDefaults.outTemp,
            axis : 'tempAxis',
            stats : [meso.Stat.min, meso.Stat.max],
            highstockSeriesOptions : {
            },
        },
        // out dewpoint
        "dewpoint" : {
            fieldDef : Config.fieldDefaults.dewpoint,
            axis : 'tempAxis',
            stats : [meso.Stat.min, meso.Stat.max],
            highstockSeriesOptions : {
            }
        },
        // barometer
        "barometer" : {
            fieldDef : Config.fieldDefaults.barometer,
            axis : 'barometerAxis',
            stats : [meso.Stat.min, meso.Stat.max],
            highstockSeriesOptions : {
                color: '#BECC00',
                dashStyle: 'ShortDot',
            }
        },
        // wind speed
        "windSpeed" : {
            fieldDef : Config.fieldDefaults.windSpeed,
            axis : 'windSpeedAxis',
            highstockSeriesOptions : {
            }
        },
        // wind gust speed
        "windGust" : {
            fieldDef : Config.fieldDefaults.windGust,
            axis : 'windSpeedAxis',
            stats : [meso.Stat.max],
            highstockSeriesOptions : {
            }
        },
        // wind dir
        "windDir" : {
            fieldDef : Config.fieldDefaults.windDir,
            axis : 'windDirAxis',
            highstockSeriesOptions : {
                lineWidth: 0,
                marker: {
                    enabled: true,
                    radius: 1
                },
            }
        },
        // rain
        "rain" : {
            fieldDef : Config.fieldDefaults.rain,
            axis : 'rainAxis',
            highstockSeriesOptions : {
                type : 'column',
            }
        },
        // out humidity
        "outHumidity" : {
            fieldDef : Config.fieldDefaults.outHumidity,
            axis : 'humidityAxis',
            stats : [meso.Stat.min, meso.Stat.max],
            highstockSeriesOptions : {
            }
        }
    };

    // RawChart configuraion
    // Displays "raw"/LOOP data.
    Config.rawChartOptions = {
        aggregateDataProvider : Config.rawDataProvider,
        statsDataProvider: Config.rawStatsDataProvider,
        // the x-axis to use
        xAxis : meso.Util.applyDefaults( {
            highstockAxisOptions : {
                // have to set this otherwise the range selector buttons won't be enabled initially
                minRange : 2*1000 // 2 seconds
            }
        }, Config.chartDefaults.xAxes.dateTime ),
        // the y-axis to display
        yAxes : [
            Config.chartDefaults.yAxes.temp,
            Config.chartDefaults.yAxes.barometer,
            Config.chartDefaults.yAxes.windSpeed,
            Config.chartDefaults.yAxes.windDir,
            Config.chartDefaults.yAxes.rain,
            Config.chartDefaults.yAxes.humidity
        ],
        // the data to display (note: the axis of any seires listed here must also be included as a y-axis)
        series : [
            Config.chartDefaults.series.outTemp,
            Config.chartDefaults.series.dewpoint,
            Config.chartDefaults.series.barometer,
            Config.chartDefaults.series.windSpeed,
            Config.chartDefaults.series.windGust,
            Config.chartDefaults.series.windDir,
            Config.chartDefaults.series.rain,
            Config.chartDefaults.series.outHumidity
        ],
        // see http://api.highcharts.com/highstock
        highstockChartOptions : {
            chart : {
                renderTo: 'charts-container', 
            },
            legend : {
                enabled: true,
                borderWidth: 0
            },
            rangeSelector : {
                enabled: true,
                selected : 4,
                buttons: [{
                    type: 'minute',
                    count: 15,
                    text: '15m'
                }, {
                    type: 'hour',
                    count: 1,
                    text: '1h'
                }, {
                    type: 'hour',
                    count: 3,
                    text: '3h'
                }, {
                    type: 'hour',
                    count: 6,
                    text: '6h'
                }, {
                    type: 'hour',
                    count: 12,
                    text: '12h'
                }, {
                    type: 'all',
                    text: '24h'
                }],
                inputEnabled: false // it supports only days
            }
        }
    };

    // ArchiveChart configuraion
    // Displays archive data.
    Config.archiveChartOptions = {
        aggregateDataProvider: Config.archiveDataProvider,
        statsDataProvider: Config.archiveStatsDataProvider,
        // the max range to fetch stats for, tweak as needed, or remove for no limit
        maxStatRange: 120 * 86400000, // 120 days
        xAxis : meso.Util.applyDefaults( {
            highstockAxisOptions : {
                // have to set this otherwise the range selector buttons won't be enabled initially
                minRange : 5*60*1000 // 5 minutes
            }
        }, Config.chartDefaults.xAxes.dateTime ),
        yAxes : [
            Config.chartDefaults.yAxes.temp,
            Config.chartDefaults.yAxes.barometer,
            Config.chartDefaults.yAxes.windSpeed,
            Config.chartDefaults.yAxes.windDir,
            Config.chartDefaults.yAxes.rain,
            Config.chartDefaults.yAxes.humidity,
        ],
        // the data to display (note: the axis of any seires listed here must also be included as a y-axis)
        series : [
            Config.chartDefaults.series.outTemp,
            Config.chartDefaults.series.dewpoint,
            Config.chartDefaults.series.barometer,
            Config.chartDefaults.series.windSpeed,
            Config.chartDefaults.series.windGust,
            Config.chartDefaults.series.windDir,
            Config.chartDefaults.series.rain,
            Config.chartDefaults.series.outHumidity
        ],
        // see http://api.highcharts.com/highstock
        highstockChartOptions : {
            chart : {
                renderTo: 'charts-container', 
            },
            legend : {
                enabled: true,
                borderWidth: 0
            },
            rangeSelector : {
                enabled: true,
                selected : 2,
                buttons: [{
                    type: 'day',
                    count: 1,
                    text: '1d'
                }, {
                    type: 'week',
                    count: 1,
                    text: '1w'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'ytd',
                    text: 'ytd'
                }, {
                    type: 'year',
                    count: 1,
                    text: '1y'
                }, {
                    type: 'all',
                    text: 'all'
                }]
            }
        }
    };

    return Config;
})();
