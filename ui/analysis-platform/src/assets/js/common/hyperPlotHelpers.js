
import Plotly from 'plotly.js-dist'

export default {

  config(){

    var plotlyConfiguration = {};
    plotlyConfiguration.displaylogo = false;
    plotlyConfiguration.responsive = true;
    plotlyConfiguration.modeBarButtonsToRemove = ['sendDataToCloud', 'toImage']

    return plotlyConfiguration;
  },

  update( component, call, fields){

    if( !component.drawing ){

      component.drawing = true;

      setTimeout( function() {

        component[call]( component );

        const nFields = fields.length;
        var dataUpdate = [];

        var field_ii;
        var data_ii;

        for( var ii = 0; ii < nFields; ii++){

          field_ii = fields[ii];
          data_ii = component[ field_ii ];

          dataUpdate.push( data_ii );
        };

        var update = {};
        update.z = dataUpdate;
        update.reversescale = component.invert.value;

        Plotly.restyle( component.hyperspectralGraph, update)
        .then( function(result) {
          component.drawing = false;
        });
      }.bind( component ), 0)
    };
  },

};
