import { createStore, combineReducers, bindActionCreators, applyMiddleware } from 'redux';
import { createProvider } from 'react-redux';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import * as dataReducers from './reducers/dataReducer';
import components from './components';
import settingsComponentObjects from './settingsComponentObjects';
import * as selectors from './selectors/dataSelectors';

import init from './utils/initializer';
import { setSortProperties } from './utils/sortUtils';
import * as actions from './actions';

const defaultEvents = {
  ...actions,
  onFilter: actions.setFilter,
  setSortProperties
};


const defaultStyleConfig = {
  icons: {
    TableHeadingCell: {
      sortDescendingIcon: '▼',
      sortAscendingIcon: '▲'
    },
  },
  classNames: {
    Cell: 'griddle-cell',
    Filter: 'griddle-filter',
    Loading: 'griddle-loadingResults',
    NextButton: 'griddle-next-button',
    NoResults: 'griddle-noResults',
    PageDropdown: 'griddle-page-select',
    Pagination: 'griddle-pagination',
    PreviousButton: 'griddle-previous-button',
    Row: 'griddle-row',
    RowDefinition: 'griddle-row-definition',
    Settings: 'griddle-settings',
    SettingsToggle: 'griddle-settings-toggle',
    Table: 'griddle-table',
    TableBody: 'griddle-table-body',
    TableHeading: 'griddle-table-heading',
    TableHeadingCell: 'griddle-table-heading-cell',
    TableHeadingCellAscending: 'griddle-heading-ascending',
    TableHeadingCellDescending: 'griddle-heading-descending',
  },
  styles: {
  }
};

class Griddle extends Component {
  static childContextTypes = {
    components: PropTypes.object.isRequired,
    settingsComponentObjects: PropTypes.object,
    events: PropTypes.object,
    selectors: PropTypes.object,
    storeKey: PropTypes.string,
  }

  constructor(props) {
    super(props);

    const {
      storeKey = 'store',
    } = props;

    const { initialState, reducers, reduxMiddleware } = init.call(this, {
      reducers: dataReducers,
      components,
      settingsComponentObjects,
      selectors,
      styleConfig: defaultStyleConfig,
      pageProperties: {
        currentPage: 1,
        pageSize: 10
      },

      enableSettings: true,
      textProperties: {
        next: 'Next',
        previous: 'Previous',
        settingsToggle: 'Settings'
      },
    });

    this.store = createStore(
      reducers,
      initialState,
      applyMiddleware(...reduxMiddleware)
    );

    this.provider = createProvider(storeKey);
  }

  componentWillReceiveProps(nextProps) {
    const { data, pageProperties, sortProperties } = nextProps;

    this.store.dispatch(actions.updateState({ data, pageProperties, sortProperties }));
  }

  getStoreKey = () => {
    return this.props.storeKey || 'store';
  }

  getChildContext() {
    return {
      components: this.components,
      settingsComponentObjects: this.settingsComponentObjects,
      events: this.events,
      selectors: this.selectors,
      storeKey: this.getStoreKey(),
    };
  }

  render() {
    return (
      <this.provider store={this.store}>
        <this.components.Layout />
      </this.provider>
    )

  }
}

export default Griddle;
