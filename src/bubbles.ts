import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { IToolbarWidgetRegistry, ToolbarButton } from '@jupyterlab/apputils';
const bubblesPlugin: JupyterFrontEndPlugin<void> = {
  id: 'ipyopenlayers:bubbles',
  autoStart: true,
  requires: [IToolbarWidgetRegistry],
  activate: (_app: JupyterFrontEnd, toolbarRegistry: IToolbarWidgetRegistry) => {
    // load a dummy button with the thought bubble emoji as symbol that does nothing when clicked to cell toolbar registry at  build time, as described in https://jupyterlab.readthedocs.io/en/stable/extension/extension_points.html#toolbar-registry
    toolbarRegistry.addFactory('Cell', 'bubble1', (cell: any) => {
      const item = cell.model?.metadata?.['bubbles']?.[0];
      const btn = new ToolbarButton({
        label: item ? item.label : '💭',
        onClick: () => { console.log(item.prompt);
          window.dispatchEvent(
            new CustomEvent('ipyopenlayers:ai-suggestion-bubble-insert', {
              detail: { prompt: item.prompt },
            })
          );
        },
        tooltip: item ? item.prompt : '',
      });
      if (!item) { btn.hide(); }
      return btn;
    });
    toolbarRegistry.addFactory('Cell', 'bubble2', (cell: any) => {
      const item = cell.model?.metadata?.['bubbles']?.[1];
      const btn = new ToolbarButton({
        label: item ? item.label : '💭',
        onClick: () => { console.log(item.prompt);
          window.dispatchEvent(
            new CustomEvent('ipyopenlayers:ai-suggestion-bubble-insert', {
              detail: { prompt: item.prompt },
            })
          );
        },
        tooltip: item ? item.prompt : '',
      });
      if (!item) { btn.hide(); }
      return btn;
    });
    toolbarRegistry.addFactory('Cell', 'bubble3', (cell: any) => {
      const item = cell.model?.metadata?.['bubbles']?.[2];
      const btn = new ToolbarButton({
        label: item ? item.label : '💭',
        onClick: () => { console.log(item.prompt);
          window.dispatchEvent(
            new CustomEvent('ipyopenlayers:ai-suggestion-bubble-insert', {
              detail: { prompt: item.prompt },
            })
          );
        },
        tooltip: item ? item.prompt : '',
      });
      if (!item) { btn.hide(); }
      return btn;
    });
  },
};

export default bubblesPlugin;




//notes:
//-added "schemaDir": "schema", to package.json
//-added a bubbles item to /schema directory
//-added a /schema directory
