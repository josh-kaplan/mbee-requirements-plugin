

/* eslint-disable no-unused-vars */

// React Modules
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { Button, Badge } from 'reactstrap';
import { Input } from 'reactstrap';

// MBEE Components
//const M_COMPONENTS = '../../../app/ui/components';
//import Sidebar from '../../../app/ui/components/general/sidebar/sidebar.jsx';
//import SidebarLink from '../../../app/ui/components/general/sidebar/sidebar-link.jsx';
//import SidebarHeader from '../../../app/ui/components/general/sidebar/sidebar-header.jsx';
//import List from '../general/list/list.jsx';
//import OrgList from '../home-views/org-list.jsx';
//import Create from '../shared-views/create.jsx';
//import Delete from '../shared-views/delete.jsx';

// Plugin Components
import RequirementRow from './requirement-row.jsx';

/**
 * Defines the RequirementsWorkspace component which consists of the control
 * toolbar and the requirements table.
 */
// Define HomePage Component
class RequirementsWorkspace extends Component {

  /**
   * Initializes the requirements workspace. Sets parent props, initializes the
   * state, and binds component methods.
   */
  constructor(props) {
    super(props);

    this.state = {
      project: this.props.project,
      requirements: null,
      messageContent: '',
      error: null
    }

    this.saveChanges = this.saveChanges.bind(this);
    this.setMessageContent = this.setMessageContent.bind(this);
    this.addRequirement = this.addRequirement.bind(this);
    this.unmountRequirement = this.unmountRequirement.bind(this);
  }

  /**
   * Defines the component behavior once the component is mounted.
   */
  componentDidMount() {
    let org = this.state.project.org;
    let project = this.state.project.id;

    let url = `/api/orgs/${org}/projects/${project}/branches/master`;
    url += '/elements?type=Requirement'

    $.ajax({
      method: 'GET',
      url: url,
      statusCode: {
        200: (data) => {
          this.setState({requirements: data})
        },
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

  /**
   * Unmounts a requirement row from the table. This function is passed into
   * the RequirementRow component and is called by that component when the
   * component is deleted.
   */
  unmountRequirement(_id) {
    let reqs = this.state.requirements.filter(r => r.id !== _id);
    this.setState({requirements: reqs});
  }

  /**
   * This helper function is used to set the message content in the toolbar.
   * This function is passed to the RequirementRow objects to allow them to
   * display messages on the toolbar.
   */
  setMessageContent(content) {
    this.setState({messageContent: content})
  }

  /**
   * TODO - This function will be used to save all requirements.
   */
  saveChanges() {
    console.log(this.state.requirements)
  }

  /**
   * This function is called when the "add requirement" button is clicked.
   */
  addRequirement() {
    // Inform user that a requirement is being added.
    this.setMessageContent(
      <Badge color="primary">
        Adding new element ...
      </Badge>
    )

    // Initialize a default new requirement ID.
    let newReqID = 'req-1_1';

    // If requirements are already defined,
    // parse ID of last requirement to generate the new ID
    let reqs = this.state.requirements;
    if (reqs !== null && reqs.length > 0) {
      let lastReq = this.state.requirements.slice(-1)[0];
      let prefix = lastReq.id.split('_').slice(0, -1);
      let suffix = lastReq.id.split('_').slice(-1);
      newReqID = `${prefix.join('_')}_${Number(suffix) + 1}`
    }

    // Define the new requirement object
    let newReq = {
      id: newReqID,
      name: '',
      documentation: '',
      type: 'Requirement',
      parent: 'holding_bin',
      custom: {
        requirements: {
          verifyMethod: ''
        }
      }
    };

    // Generate the POST API url
    let oid = this.state.project.org;
    let pid = this.state.project.id;
    let url = `/api/orgs/${oid}/projects/${pid}/branches/master`;
    url = `${url}/elements/${newReq.id}`;

    // POST the new element to the model
    $.ajax({
      method: 'POST',
      url: url,
      data: JSON.stringify(newReq),
      contentType: 'application/json',
      statusCode: {
        200: (data) => {
          let reqs = this.state.requirements || [];
          reqs.push(data);
          this.setState({requirements: reqs});
          setTimeout(() => {
            this.setMessageContent('')
          }, 1000);
        },
        401: (err) => { window.location.reload() }
      },
      error: (err) => {
        this.setState({ error: err.responseJSON.description });
        this.setMessageContent(
          <Badge color="danger">
            {err.responseJSON.description}
          </Badge>
        )
      }
    });
  }


  /**
   * This function renders the requirements workspace.
   */
  render() {
    // Initialize an empty table.
    let tableBody = ('');

    // If there are requirements, create RequirementRows in the table body.
    if (this.state.requirements !== null) {
      tableBody = this.state.requirements.map(req => {
        return (<RequirementRow key={'key-' + req.id}
                                project={this.props.project}
                                data={req}
                                setMsgContent={this.setMessageContent}
                                unmount={this.unmountRequirement}/>)
      })
    }

    // Defines a style for toolbar buttons
    // TODO - move this to CSS
    let toolbarButtonStyle = {
      padding: '1px 4px',
      width: '25px',
      marginRight: '5px',
      border: '1px solid transparent'
    }

    return (
      <div className="container-fluid">
      <div className="workspace-toolbar">
        <span id="toolbar-message-area">
          {this.state.messageContent}
        </span>
        <span id="toolbar-buttons-area">
          <Button className='btn'
                  style={toolbarButtonStyle}
                  size='sm'
                  outline
                  color="success"
                  onClick={this.addRequirement}>
            <i className="fas fa-plus"></i>
          </Button>
          <Button className='btn'
                  style={toolbarButtonStyle}
                  size='sm'
                  outline
                  color="primary"
                  onClick={this.saveChanges}>
            <i className="fas fa-save"></i>
          </Button>
          <Button className='btn'
                  style={toolbarButtonStyle}
                  size='sm'
                  outline
                  color="secondary"
                  onClick={() => console.log('Button clicked.')}>
            <i className="fas fa-times"></i>
          </Button>
        </span>
      </div>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Text</th>
            <th>Verify Method</th>
            <th>Controls</th>
          </tr>
        </thead>
        <tbody>
          {tableBody}
        </tbody>
      </table>
      </div>
    )
  }
}

// Export the component
module.exports = RequirementsWorkspace;
