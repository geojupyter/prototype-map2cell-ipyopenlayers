// Copyright (c) QuantStack
// Distributed under the terms of the Modified BSD License.
import { DOMWidgetModel, ISerializers } from '@jupyter-widgets/base';
import { BaseControlModel, BaseControlView } from './basecontrol';
import Control from 'ol/control/Control.js';
import Draw from 'ol/interaction/Draw.js';
import { Vector } from 'ol/layer';
import Feature from 'ol/Feature.js';
import Geometry from 'ol/geom/Geometry.js';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON';

import 'ol/ol.css';
import '../css/widget.css';
import { MODULE_NAME, MODULE_VERSION } from './version';
import { MapView } from './widget';

class DrawAndExportControl extends Control {
  drawMode: boolean;
  vectorSource: VectorSource;
  vectorLayer: Vector<Feature<Geometry>>;
  drawInteraction: Draw;

  /**
   * @param {Object} [opts] Control options.
   */
  constructor(opts: any) {
    const options = opts || {};

    const drawToggleButton = document.createElement('button');
    drawToggleButton.innerHTML = '✏️';

    // new element for the dropdown `typeDropdown`

    const exportButton = document.createElement('button');
    exportButton.innerHTML = '💾';

    const element = document.createElement('div');
    element.className = 'draw-and-export-group ol-unselectable ol-control';
    element.appendChild(drawToggleButton);
    element.appendChild(exportButton);

    super({
      element: element,
      target: options.target,
    });

    drawToggleButton.addEventListener('click', this.handleToggleDrawMode.bind(this), false);
    exportButton.addEventListener('click', this.handleCodeExport.bind(this), false);

    this.drawMode = false;
  }

  handleCodeExport() {

    console.log('export clicked');

    const notebook = MapView.tracker?.currentWidget?.content;
      if (!notebook?.model) {
        console.debug("No Notebook moodel found");
        return;
      }

    const exportedFeatures = new GeoJSON().writeFeatures(this.vectorSource.getFeatures());

    let exportScriptSource = '';

    exportScriptSource = `
import shapely
import matplotlib.pyplot as plt

exported_shapely = shapely.from_geojson("""${exportedFeatures}""")
plt.scatter(
    shapely.get_coordinates(exported_shapely)[:, 0],
    shapely.get_coordinates(exported_shapely)[:, 1],
)
plt.show()
print("generated on ${new Date().toISOString()}")
      `;


    notebook.model.sharedModel.insertCell(
      notebook.activeCellIndex + 1,
      {
        cell_type: 'code',
        source: exportScriptSource,
        metadata: {}
      }
    );

    return;



  }

  handleToggleDrawMode() {
    if (this.drawMode) {
      this.disableDrawMode();
    } else {
      this.enableDrawMode();  // pass that argument `typeDropdown.value` into function
    }
  }

  enableDrawMode() {  // Add an argument of `type: "Polygon" | "Point" | "Line"`
    if (!!this.drawMode) return;


    console.debug("Enabling draw mode");
    console.debug(this.getMap());
    console.debug(this.vectorLayer);
    console.debug(this.drawInteraction);

    this.vectorSource = new VectorSource();
    this.vectorLayer = new Vector({ source: this.vectorSource, zIndex: 1000 });
    this.drawInteraction = new Draw({
      source: this.vectorSource,
      // vary type on the type argument
      // OR instead of taking an argument, directly access `this.typeDropdown.value`
      // **The latter is preferred**.
      type: "Point",
    })

    this.getMap()!.addLayer(this.vectorLayer);
    this.getMap()!.addInteraction(this.drawInteraction);

    this.drawMode = true;
  }

  disableDrawMode() {
    if (!this.drawMode) return;

    console.debug("Disabling draw mode");
    console.debug(this.getMap());
    console.debug(this.vectorLayer);
    console.debug(this.drawInteraction);

    this.getMap()!.removeLayer(this.vectorLayer);
    this.getMap()!.removeInteraction(this.drawInteraction);

    this.drawMode = false;
  }
}

export class DrawAndExportModel extends BaseControlModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: DrawAndExportModel.model_name,
      _model_module: DrawAndExportModel.model_module,
      _model_module_version: DrawAndExportModel.model_module_version,
      _view_name: DrawAndExportModel.view_name,
      _view_module: DrawAndExportModel.view_module,
      _view_module_version: DrawAndExportModel.view_module_version,
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    // Ajoutez ici tous les sérialiseurs supplémentaires
  };

  static model_name = 'DrawAndExportModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'DrawAndExportView';
  static view_module = MODULE_NAME;
  static view_module_version = MODULE_VERSION;
}
export class DrawAndExportView extends BaseControlView {
  createObj() {
    this.obj = new DrawAndExportControl({});
  }
}
