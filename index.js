const { Toolkit } = require( 'actions-toolkit' );
const { XMLHttpRequest } = require( 'xmlhttprequest' );


Toolkit.run( async ( tools ) => {
  try {
    const { comment, issue, sender } = tools.context.payload;
    const { body, html_url, created_at } = comment;
    const { title, labels } = issue;
    const { login } = sender;

    let labelNames = '';
    for (let i = 0; i < labels.length; i++) { 
      labelNames += labels[i].name + ";";
    }
    let threadsContent = null;
    if (body.includes('+1') && labelNames.includes('feature request')) {
      let ticketNumber = null;
      let hsToken = null;
      // Get and format HS ticket threads if a link exists
      if (body.includes('secure.helpscout.net')) {
        tools.log('contains hs link');
        let pattern = /(?<url>https:\/\/secure.helpscout.net\/conversation\/(?<id>.*)\/.*)/;
        let { groups: { url, id } } = body.match(pattern);
        tools.log('URL and ID:');
        tools.log(url);
        tools.log(id);

        // Get HS access token
        let getHSToken = new Promise( async( resolve, reject ) => {
          try {
            let request = new XMLHttpRequest();
            let url = `https://api.helpscout.net/v2/oauth2/token`;
            var data = {
              "grant_type": "client_credentials",
              "client_id": "0def26e02fe841fbbbe1dff415284eb8",
              "client_secret": "da7db41c06814699a0f8f1c9354aa57c"
            };

            request.open('POST', url, true);

            // Send request
            request.send(JSON.stringify(data));

            resolve();
          }
          catch( error ){
            reject( error );
          }
        });

        // Wait for completion
        getHSToken.then(function(result) {
          tools.log('TOKEN:');
          tools.log(result);
          hsToken = result;
        }, function(err) {
          tools.exit.failure( err );
        });

        // Get HS ticket threads
        let getTicketThreads = new Promise( async( resolve, reject ) => {
          try {
            let request = new XMLHttpRequest();
            let url = `https://api.helpscout.net/v2/conversations/${ id }/threads`;

            request.open('GET', url, true);
            request.setRequestHeader(`Authorization: Bearer ${ hsToken }`);

            // Send request
            request.send();

            resolve();
          }
          catch( error ){
            reject( error );
          }
        });

        // Wait for completion
        getTicketThreads.then(function(result) {
          tools.log(
            `Got threads for ticket '${ id }'`
          );
          tools.log(result);

          // Build the threads HTML
          threadsContent = '';
          let { threads } = result;
          for (let j = 0; j < threads.length; j++) { 
            threadsContent += 
            '<hr><strong>From: </strong>' + threads[j].createdBy.email +
            '<p>' + threads[j].body + '</p>';
          }

        }, function(err) {
          tools.exit.failure( err );
        });
      }

      // Send to Zapier
      let sendComment = new Promise( async( resolve, reject ) => {
        try {
          let request = new XMLHttpRequest();

          request.open('POST', 'https://hooks.zapier.com/hooks/catch/3679287/oon4u7z/', true);

          const data = {
            body,
            html_url,
            created_at,
            title,
            login
          }

          // Send request
          request.send(JSON.stringify(data));

          resolve();
        }
        catch( error ){
          reject( error );
        }
      });

      // Wait for completion
      sendComment.then(function(result) {
        tools.log.success(
          `Sent new issue comment for '${ issue.title }' to Zapier.`
        );
      }, function(err) {
        tools.exit.failure( err );
      });
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
  secrets: [ 'GITHUB_TOKEN' ],
})



// ID: 0def26e02fe841fbbbe1dff415284eb8
// Secret: da7db41c06814699a0f8f1c9354aa57c

// curl -X POST https://api.helpscout.net/v2/oauth2/token \
//     --data "grant_type=client_credentials" \
//     --data "client_id=0def26e02fe841fbbbe1dff415284eb8" \
//     --data "client_secret=da7db41c06814699a0f8f1c9354aa57c"

// curl -X GET https://api.helpscout.net/v2/conversations/85065 -H "Authorization: Bearer 806c10f97cb6435eab6cdaf8c973246c"


