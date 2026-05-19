// Copyright (c) QuantStack
// Distributed under the terms of the Modified BSD License.

import { Application, IPlugin } from '@lumino/application';

import { Widget } from '@lumino/widgets';

import { IJupyterWidgetRegistry } from '@jupyter-widgets/base';
import { INotebookTracker } from '@jupyterlab/notebook';
import { IChatTracker } from '@jupyter/chat';

import * as widgetExports from './widget';

import { MODULE_NAME, MODULE_VERSION } from './version';

const EXTENSION_ID = 'ipyopenlayers:plugin';

/**
 * The example plugin.
 */
const examplePlugin: IPlugin<Application<Widget>, void> = {
  id: EXTENSION_ID,
  requires: [IJupyterWidgetRegistry, INotebookTracker, IChatTracker],
  activate: activateWidgetExtension,
  autoStart: true,
} as unknown as IPlugin<Application<Widget>, void>;
// the "as unknown as ..." typecast above is solely to support JupyterLab 1
// and 2 in the same codebase and should be removed when we migrate to Lumino.

export default examplePlugin;

/**
 * Activate the widget extension.
 */
function activateWidgetExtension(
  app: Application<Widget>,
  registry: IJupyterWidgetRegistry,
  notebookTracker: INotebookTracker,
  chatTracker: IChatTracker,
): void {
  // Instead of listening for this event, should we pass the tracker & currentWidget
  // in to the registerWidget call and just call this logic onClick?
  window.addEventListener('ipyopenlayers:ai-suggestion-bubble-insert', (event: Event) => {
    const { prompt } = (event as CustomEvent<{ prompt: string }>).detail;
    const chatWidget = chatTracker.currentWidget;
    if (!chatWidget) {
      console.warn("No chat window found");
      return;
    }
    chatWidget.model.input.value = prompt;
    void app.commands.execute('jupyter-ai:focus-chat-input');
  });
  widgetExports.MapView.tracker = notebookTracker;
  registry.registerWidget({
    name: MODULE_NAME,
    version: MODULE_VERSION,
    exports: widgetExports,
  });
}
