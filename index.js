const { Toolkit } = require( 'actions-toolkit' );
const { XMLHttpRequest } = require( 'xmlhttprequest' );
const FormData = require('form-data');
const axios = require('axios');


Toolkit.run( async ( tools ) => {
  try {
    const { comment, issue, sender } = tools.context.payload;
    const { body, html_url, created_at } = comment;
    const { title, labels } = issue;
    const { login } = sender;

    const HS_APP_ID = process.env.HS_APP_ID;
    const HS_APP_SECRET = process.env.HS_APP_SECRET;

    let labelNames = '';
    for (let i = 0; i < labels.length; i++) { 
      labelNames += labels[i].name + ";";
    }
    let threadsContent = null;
    if (body.includes('+1') && labelNames.includes('feature request')) {
      let ticketNumber = null;
      let hsToken = null;
      
      let sendComment = function(response) {
        return new Promise((resolve, reject) => {
          // Build the threads HTML
          threadsContent = '';
          let threads = result._embedded.threads;
          let customerName = `${ result._embedded.threads[0].customer.first } ${ result._embedded.threads[0].customer.last }`;
          let customerEmail = result._embedded.threads[0].customer.email;
          for (let j = 0; j < threads.length; j++) { 
            threadsContent += 
            '<br><hr><br><strong>From: </strong>' + threads[j].createdBy.email +
            '<p>' + threads[j].body + '</p>';
          }

          // Send comment
          axios.post('https://hooks.zapier.com/hooks/catch/3679287/oon4u7z/', {
            body,
            html_url,
            created_at,
            title,
            login, 
            threadsContent,
            customerName,
            customerEmail
          })
          .then(function (response) {
            tools.log('SEND COMMENT RESPONSE:');
            tools.log(response);
            resolve();
          })
          .catch(function (error) {
            reject(error);
          });
        });
      };

      // Get and format HS ticket threads if a link exists
      if (body.includes('secure.helpscout.net')) {
        tools.log('contains hs link');
        let pattern = /(?<url>https:\/\/secure.helpscout.net\/conversation\/(?<id>.*)\/.*)/;
        let { groups: { url, id } } = body.match(pattern);

        let getToken = function(response) {
          return new Promise((resolve, reject) => {
            // Get HS access token
            axios.post('https://api.helpscout.net/v2/oauth2/token', {
              grant_type: "client_credentials", 
              client_id: HS_APP_ID,
              client_secret: HS_APP_SECRET
            })
            .then(function (response) {
              resolve(response);
            })
            .catch(function (error) {
              reject(error);
            });
          });
        };

        let getTicketThreads = function(response) {
          return new Promise((resolve, reject) => {
            // Get ticket threads
            let url = `https://api.helpscout.net/v2/conversations/${ id }/threads`;
            let authString = `Bearer ${ response.data.access_token }`;
            axios.get(url, {headers: { "Authorization": authString }})
            .then(function (response) {
              tools.log('THREADS RESPONSE JSON:');
              tools.log(response.data._embedded.threads);
              resolve(response.data._embedded.threads);
            })
            .catch(function (error) {
              reject(error);
            });
          });
        };
        
        getToken().then(getTicketThreads).then(sendComment).then(function(result) {
          tools.log.success(
            `Sent new issue comment for '${ issue.title }' to Zapier.`
          );
        }, function(err) {
          tools.exit.failure( err );
        });;
      } else {
        sendComment.then(function(result) {
          tools.log.success(
            `Sent new issue comment for '${ issue.title }' to Zapier.`
          );
        }, function(err) {
          tools.exit.failure( err );
        });
      } 
    } else {
      let labelString = labels.toString();
      tools.exit.neutral( `New comment for '${ issue.title }' does not contain '+1' or the issue is not a feature request. Comment: '${ body }' -- Labels: ${ labelNames }'` );
    }
  }
  catch( error ){
    tools.exit.failure( error );
  }
}, {
  event: [ 'issue_comment' ],
  secrets: [ 'HS_APP_ID', 'HS_APP_SECRET' ],
})






