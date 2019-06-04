/**
 * app.js
 *
 */

// Node modules
const path = require('path');

// NPM Modules
const express = require('express');
const plugin = express();

// MBEE Modules
const utils = M.require('lib.utils');
const {authenticate} = M.require('lib.auth');
const ProjectController = M.require('controllers.project-controller');

plugin.set('view engine', `ejs`);
plugin.set('views', path.join(__dirname, 'views'));
plugin.set('layout', `${M.root}/app/views/layout.ejs`);

async function addLinkToProjects() {
  try {
    let projects = await ProjectController.find({_id: 'admin', admin: true}, null);
    projects.forEach(project => {
      if (!project.custom.hasOwnProperty('integrations')) {
        project.custom.integrations = []
      }
      else if (!Array.isArray(project.custom.integrations)) {
        project.custom.integrations = []
      }

      // Check if project already has plugin link
      let hasLink = false
      project.custom.integrations.forEach(intLink => {
        if (intLink.name === 'requirements') {
          M.log.verbose(`Project [${project.id}] already has requirements link.`)
          hasLink = true;
        }
      })

      // If the project doesn't have the link, add it
      if (!hasLink) {
        M.log.verbose(`Adding requirements link to project [${project.id}].`)
        let orgID = utils.parseID(project.id)[0];
        let projID = utils.parseID(project.id)[1];
        project.custom.integrations.push({
          name: 'requirements',
          title: 'Requirements',
          url: `/plugins/requirements/${orgID}/${projID}`
        });
        project.save();
      }
    })
  }
  catch (err) {
    M.log.debug('Something failed.')
    M.log.error(err)
  }
}

/*-------------------( Main )-------------------*/

addLinkToProjects()


// Define an authenticated route
//plugin.get('/', authenticate, (req, res) => res.redirect('/home'));


plugin.get('/:orgid/:projectid', authenticate, (req, res) => {
    return utils.render(req, res, 'home', {
    title: 'Requirements Tool | MBEE'
  });
})


module.exports = plugin;
