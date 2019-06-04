/**
 * app.jsx
 */

/* Modified ESLint rules for React. */
/* eslint-disable no-unused-vars */

// React Modules
import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import ReactDOM from 'react-dom';

// MBEE Components
const M_COMPONENTS = '../../../app/ui/components';
import Sidebar from '../../../app/ui/components/general/sidebar/sidebar.jsx';
import SidebarLink from '../../../app/ui/components/general/sidebar/sidebar-link.jsx';
import SidebarHeader from '../../../app/ui/components/general/sidebar/sidebar-header.jsx';
//import List from '../general/list/list.jsx';
//import OrgList from '../home-views/org-list.jsx';
//import Create from '../shared-views/create.jsx';
//import Delete from '../shared-views/delete.jsx';

// Plugin Components
import RequirementsWorkspace from './requirements.jsx';
import SettingsModal from './settings.jsx';

// Define HomePage Component
class ReqApp extends Component {

  constructor(props) {
    // Initialize parent props
    super(props);

    this.state = {
      org: null,
      project: null,
      data: null,
      error: null,
      settings: false
    }

    this.handleSettingsToggle = this.handleSettingsToggle.bind(this);
  }

  handleSettingsToggle() {
    console.log(this.state.settings)
    this.setState({settings: !this.state.settings})
  }

  componentDidMount() {
    // Parse the current URL
    let org = window.location.pathname.split('/').slice(-2)[0];
    let proj = window.location.pathname.split('/').slice(-2)[1];

    this.setState({
      org: org,
      project: proj
    })

    $.ajax({
      method: 'GET',
      url: `/api/orgs/${org}/projects/${proj}`,
      statusCode: {
        200: (data) => { this.setState({ data: data }) },
        401: (err) => { window.location.reload() },
        403: (err) => {
          this.setState({ error: err.responseJSON.description });
        },
        404: (err) => {
          this.setState({ error: err.responseJSON.description });
        }
      }
    });
  }

  render() {
    // If org or project are null, render a 404
    if (this.state.org === null || this.state.project === null) {
      return (<div>404 Page Not Found</div>)
    }

    // Initialize variables
    let title;
    let displayPlugins = false;
    const plugins = [];

    // Verify if project exists
    if (this.state.data) {
      // Set the title for sidebar
      title = <h2> {this.state.data.name}</h2>;

      // Verify if plugins in project
      if (this.state.data.custom.integrations) {
        displayPlugins = true;
        plugins.push(<SidebarHeader title='Integrations'/>);
        this.state.data.custom.integrations.forEach((plugin) => {
          let icon = 'layer-group';
          let newTab = false;

          if (!plugin.hasOwnProperty('name') || !plugin.hasOwnProperty('url')) {
            return;
          }
          if (plugin.hasOwnProperty('icon')) {
            icon = plugin.icon;
          }
          if (plugin.hasOwnProperty('openNewTab')) {
            newTab = this.state.data.custom.integrations.openNewTab;
          }

          plugins.push(<SidebarLink id={`sidebar-${plugin.name}`}
                                    title={plugin.title}
                                    icon={`fas fa-${icon}`}
                                    openNewTab={newTab}
                                    href={`${plugin.url}`}/>);
        });
      }
    }

    let settingsModal = <SettingsModal isOpen={false} toggle={this.handleSettingsToggle}/>
    if (this.state.settings) {
      settingsModal = <SettingsModal isOpen={true} toggle={this.handleSettingsToggle}/>
    }

    let body = (<p>Loading ...</p>);
    if (this.state.data !== null ) {
      body = (<RequirementsWorkspace project={this.state.data}/>);
    }

    return (
      <div id="container">
        <Sidebar title={title}>
          {(displayPlugins) ? (<SidebarHeader title='Dashboard'/>) : ''}
          <SidebarLink id='Home'
                       title='Home'
                       icon='fas fa-home'
                       href={`/${this.state.org}/${this.state.project}`}/>
          <SidebarLink id='Elements'
                       title='Model'
                       icon='fas fa-sitemap'
                       href={`/${this.state.org}/${this.state.project}/elements`}/>
          <SidebarLink id='Search'
                       title='Search'
                       icon='fas fa-search'
                       href={`/${this.state.org}/${this.state.project}/search`}/>
          <SidebarLink id='Members'
                       title='Members'
                       icon='fas fa-users'
                       href={`/${this.state.org}/${this.state.project}/users`}/>
          {(displayPlugins) ? (plugins) : '' }
        </Sidebar>

        <div id="workspace">
          <div id="workspace-header" className="workspace-header">
            <h2 id="workspace-title" className="workspace-title">Requirements</h2>
            <div className='workspace-header-button'>
              <Button className='btn'
                      outline
                      color="secondary"
                      onClick={this.handleSettingsToggle}>
                <i className="fas fa-cog"></i>
              </Button>
            </div>
          </div>
          <div id="workspace-body">
            { body }
          </div>
        </div>
        <SettingsModal isOpen={this.state.settings}
                       toggle={this.handleSettingsToggle}
                       data={this.state.data}/>
      </div>
    );
  }

}

ReactDOM.render(<ReqApp />, document.getElementById('main'));
