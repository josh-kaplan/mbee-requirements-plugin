
/* eslint-disable no-unused-vars */

// React Modules
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { Button, Badge } from 'reactstrap';
import { Input } from 'reactstrap';


/**
 * Defines a RequirementsRow component.
 * This component represents each row in the requirements table.
 */
class RequirementsRow extends Component {

  /**
   * Initializes the component. Sets parent props, nitializes state, binds
   * component methods, etc.
   */
  constructor(props) {
    super(props);

    // Check for verifyMethod in the custom data.
    let verifyMethod = '';
    if (this.props.data.custom.hasOwnProperty('requirements')) {
      if (this.props.data.custom.requirements.hasOwnProperty('verifyMethod')) {
        verifyMethod = this.props.data.custom.requirements.verifyMethod;
      }
    }

    // Init time used for initial value on date fields
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

    // Bind this on component methods
    this.saveChanges = this.saveChanges.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleOnFocus = this.handleOnFocus.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
    this.deleteRequirement = this.deleteRequirement.bind(this);
  }

  /**
   * Handles changes to requirement fields and updates the state accordingly.
   * This function is called on change of requirement fields.
   */
  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
      lastChanges: new Date()
    })
    setTimeout(this.saveChanges, 1000);
  }

  /**
   * Handles onFocus events on row cells.
   * This is used to highlight the selected cell.
   */
  handleOnFocus(event) {
    if (this.state.originalCellColor === null) {
      this.setState({
        originalCellColor: event.target.parentElement.style['background']
      })
    }
    event.target.parentElement.style['background'] = '#FFF9C4';
  }

  /**
   * Handles onBlur events on row cells. This is the "unfocus" event and
   * is used to reset cell color.
   */
  handleOnBlur(event) {
    event.target.parentElement.style['background'] = this.state.originalCellColor;
  }

  /**
   * Handles the prop rendering of our ID format.
   * MBEE IDs must be lowercase and do no allow '.' characters.
   * Our IDs are all lowercase, so toUpperCase() is called on the ID
   * and we use '_' instead of '.'. This replacement is made here for rendering.
   */
  transformID(_id) {
    return _id.toUpperCase().replace(/_/g, '.')
  }

  /**
   * Saves the changes made to the requirement.
   */
  saveChanges() {
    let now = new Date();

    // If the last changes were made less than 1s ago (i.e. user is still
    // typing changes), return and wait for user to stop typing.
    if ((now - this.state.lastChanges) < 1000) {
      console.log('ret 2')
      return;
    }

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

  /**
   * Delete a requirement from the table
   */
  deleteRequirement(event) {
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
          this.props.setMsgContent(
            <Badge color="danger">
              Deleted requirement.
            </Badge>
          )
          setTimeout(() => {
            this.props.setMsgContent('')
          }, 3000);
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

  //componentDidMount() {
  //  setInterval(this.saveChanges, 5000);
  //}

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
            <i className="fas fa-trash-alt"></i>
          </Button>
        </td>
      </tr>
    )
  }

}

module.exports = RequirementsRow;
