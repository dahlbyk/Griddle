import _ from 'lodash';
import { buildGriddleReducer, buildGriddleComponents } from './compositionUtils';
import { getColumnProperties } from './columnUtils';
import { getRowProperties } from './rowUtils';

function pluginReducer(acc, plugin) {
  const realPlugin = typeof plugin === 'function' ? plugin(acc) : plugin;
  if (!realPlugin) return acc;

  const {
    reduxMiddleware = [],
  } = realPlugin;

  return {
    ...acc,
    reduxMiddleware: _.flatten([acc.reduxMiddleware, reduxMiddleware]),
  };
}

module.exports = function initializer(defaults) {
  if (!this) throw new Error('this missing!');

  const {
    reducers: dataReducers,
    components,
    settingsComponentObjects,
    selectors,
    styleConfig: defaultStyleConfig,
    ...defaultInitialState
  } = defaults;

  const {
    plugins = [],
    data = [],
    children: rowPropertiesComponent,
    events: userEvents = {},
    styleConfig: userStyleConfig = {},
    components: userComponents,
    renderProperties: userRenderProperties = {},
    settingsComponentObjects: userSettingsComponentObjects,
    ...userInitialState
  } = this.props;

  const rowProperties = getRowProperties(rowPropertiesComponent);
  const columnProperties = getColumnProperties(rowPropertiesComponent);

  const withPlugins = plugins.reduce(pluginReducer, { ...defaults });
  const withPluginsAndProps = pluginReducer(withPlugins, this.props);

  // Combine / compose the reducers to make a single, unified reducer
  const reducers = buildGriddleReducer([dataReducers, ...plugins.map(p => p.reducer)]);

  // Combine / Compose the components to make a single component for each component type
  this.components = buildGriddleComponents([
    components,
    ...plugins.map(p => p.components),
    userComponents,
  ]);

  this.settingsComponentObjects = Object.assign(
    { ...settingsComponentObjects },
    ...plugins.map(p => p.settingsComponentObjects),
    userSettingsComponentObjects);

  this.events = Object.assign({}, userEvents, ...plugins.map(p => p.events));

  this.selectors = plugins.reduce(
    (combined, plugin) => ({ ...combined, ...plugin.selectors }),
    { ...selectors });

  const styleConfig = _.merge(
    { ...defaultStyleConfig },
    ...plugins.map(p => p.styleConfig),
    userStyleConfig);


  // TODO: This should also look at the default and plugin initial state objects
  const renderProperties = Object.assign({
    rowProperties,
    columnProperties
  }, ...plugins.map(p => p.renderProperties), userRenderProperties);

  // TODO: Make this its own method
  const initialState = _.merge(
    defaultInitialState,
    ...plugins.map(p => p.initialState),
    userInitialState,
    {
      data,
      renderProperties,
      styleConfig,
    }
  );

  return {
    initialState,
    reducers,
    reduxMiddleware: _.compact(withPluginsAndProps.reduxMiddleware),
  };
};
