
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
//import RequirementsWorkspace from './requirements.jsx';


// Define HomePage Component
class RequirementsRow extends Component {

  constructor(props) {
    // Initialize parent props
    super(props);

    let verifyMethod = '';
    if (this.props.data.custom.hasOwnProperty('requirements')) {
      if (this.props.data.custom.requirements.hasOwnProperty('verifyMethod')) {
        verifyMethod = this.props.data.custom.requirements.verifyMethod;
      }
    }

    let initTime = new Date();

    this.state = {
      project: this.props.project,
      reqID: this.props.data.id,
      reqName: this.props.data.name,
      reqText: this.props.data.documentation,
      reqVerifyMethod: verifyMethod,
      lastChanges: initTime,
      lastSave: initTime,
      originalCellColor: null,
      error: null
    }

    this.saveChanges = this.saveChanges.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleOnFocus = this.handleOnFocus.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
    this.deleteRequirement = this.deleteRequirement.bind(this);

  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
      lastChanges: new Date()
    });
  }

  handleOnFocus(event) {
    if (this.state.originalCellColor === null) {
      this.setState({
        originalCellColor: event.target.parentElement.style['background']
      })
    }
    event.target.parentElement.style['background'] = '#FFF9C4';
  }

  handleOnBlur(event) {
    event.target.parentElement.style['background'] = this.state.originalCellColor;
  }

  transformID(_id) {
    return _id.toUpperCase().replace(/_/g, '.')
  }

  saveChanges() {
    if (this.state.lastChanges > this.state.lastSave) {
      // Let user know save is happening
      let msg = (
        <Badge color="primary">
          Saving changes ...
        </Badge>
      )
      this.props.setMsgContent(msg)

      // Generate the new custom data object
      let patchCustomData = this.props.data.custom;
      patchCustomData['requirements'] = {};
      patchCustomData['requirements']['verifyMethod'] = this.state.reqVerifyMethod;

      // Generate the PATCH API url
      let oid = this.state.project.org;
      let pid = this.state.project.id;
      let url = `/api/orgs/${oid}/projects/${pid}/branches/master`;
      url = `${url}/elements/${this.state.reqID}`;

      // Patch the element
      $.ajax({
        method: 'PATCH',
        url: url,
        data: JSON.stringify({
          name: this.state.reqName,
          documentation: this.state.reqText,
          custom: patchCustomData
        }),
        contentType: 'application/json',
        statusCode: {
          200: (data) => {
            this.setState({requirements: data});
            this.setState({lastSave: new Date()})
            setTimeout(() => {
              this.props.setMsgContent('')
            }, 1000);
          },
          401: (err) => { window.location.reload() }
        },
        error: (err) => {
          this.setState({ error: err.responseJSON.description });
          let msg = (
            <Badge color="danger">
              {err.responseJSON.description}
            </Badge>
          )
          this.props.setMsgContent(msg)
        }
      });
    }
  }

  deleteRequirement(event) {
    console.log('Delete requirement. ')
    console.log(this.state.reqID)

    let msg = (
      <Badge color="danger">
        Deleting requirement ...
      </Badge>
    )
    this.props.setMsgContent(msg)

    // Generate delete URL
    let oid = this.state.project.org;
    let pid = this.state.project.id;
    let url = `/api/orgs/${oid}/projects/${pid}/branches/master`;
    url = `${url}/elements/${this.state.reqID}`;

    $.ajax({
      method: 'DELETE',
      url: url,
      statusCode: {
        200: (data) => {
          setTimeout(() => {
            this.props.setMsgContent('')
          }, 1000);
          this.props.unmount(this.state.reqID);
        },
        401: (err) => { window.location.reload() }
      },
      error: (err) => {
        this.setState({ error: err.responseJSON.description });
        let msg = (
          <Badge color="danger">
            {err.responseJSON.description}
          </Badge>
        )
        this.props.setMsgContent(msg)
      }
    });

  }

  componentDidMount() {
    setInterval(this.saveChanges, 5000);
  }

  render() {
    return (
      <tr key={`key-${this.state.reqID}`}>
        <th scope="row">{this.transformID(this.state.reqID)}</th>
        <td>
          <Input
            bsSize='sm'
            type='text'
            name='reqName'
            id={'requirement-' + this.state.reqID + '-name'}
            placeholder='Name'
            value={this.state.reqName || ''}
            onChange={this.handleChange}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur} />
        </td>
        <td>
          <Input
            bsSize='sm'
            type='text'
            name='reqText'
            id={'requirement-' + this.state.reqID + '-text'}
            placeholder='Text'
            value={this.state.reqText || ''}
            onChange={this.handleChange}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur} />
        </td>
        <td>
          <Input
            bsSize='sm'
            type='text'
            name='reqVerifyMethod'
            id={'requirement-' + this.state.reqID + '-name'}
            placeholder='A, I, D, or T'
            value={this.state.reqVerifyMethod || ''}
            onChange={this.handleChange}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur} />
        </td>
        <td>
          <Button className='btn'
                  size='sm'
                  style={{
                    padding: '1px 4px',
                    width: '25px',
                    marginRight: '5px',
                    border: '1px solid transparent'
                  }}
                  outline
                  color="danger"
                  onClick={this.deleteRequirement}>
            <i className="fas fa-trash"></i>
          </Button>
        </td>
      </tr>
    )
  }

}

module.exports = RequirementsRow;
