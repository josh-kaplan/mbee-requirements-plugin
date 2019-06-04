
// React Modules
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Form, FormGroup, Col, Input, Label } from 'reactstrap';
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
class SettingsModal extends Component {

  constructor(props) {
    // Initialize parent props
    super(props);

    this.state = {
      settings: this.props.isOpen,
      project: this.props.data,
      error: null
    }

    this.saveSettings = this.saveSettings.bind(this);
  }

  saveSettings() {

  }

  render() {

    /*let reqPkg = null;
    if (this.state.project.custom.hasOwnProperty('requirements')) {
      if (this.state.project.custom.requirements.hasOwnProperty('package') {
        reqPkg =
      }
    }*/
    return (
      <Modal isOpen={this.props.isOpen} toggle={this.props.toggle} size='lg'>
          <ModalHeader toggle={this.props.toggle}>
            Requirements Settings
          </ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup row>
                <Label for="req_pkg" sm={4}>Requirements Package</Label>
                <Col sm={8}>
                  <Input type="text"
                         name="req_pkg"
                         id="req_pkg"
                         placeholder="Enter an element ID where requirements will be contained." />
                </Col>
              </FormGroup>
            </Form>

          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.saveSettings()}>Save</Button>{' '}
            <Button color="secondary" onClick={this.props.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
    )
  }
}

module.exports = SettingsModal;
