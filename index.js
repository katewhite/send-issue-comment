const { Toolkit } = require( 'actions-toolkit' );
const { XMLHttpRequest } = require( 'xmlhttprequest' );


Toolkit.run( async ( tools ) => {
  try {
    const { comment, issue, sender } = tools.context.payload;
    const { body, html_url, created_at } = comment;
    const { title, labels } = issue;
    const { login } = sender;

    var labelNames = '';
    for (var i = 0; i < labels.length; i++) { 
      labelNames += labels[i].name + ";";
    }

    if (body.includes('+1') && labelNames.includes('feature request')) {
      let ticketNumber = null;
      // Get and format HS ticket threads if a link exists
      if (body.includes('secure.helpscout.net')) {
        tools.log('contains hs link');
        let pattern = /(?<url>https:\/\/secure.helpscout.net.+\/(?<id>.*)\?)/
        let { groups: { url, id } } = string.match(pattern);
      }

      tools.log('URL and ID:');
      tools.log(url);
      tools.log(id);

      // Get HS ticket threads
      var getTicketThreads = new Promise( async( resolve, reject ) => {
        try {
          var request = new XMLHttpRequest();
          var url = `https://api.helpscout.net/v2/conversations/${ id }/threads`;

          request.open('GET', url, true);

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
        tools.log.success(
          `Got threads for ticket '${ ticketNumber }'`
        );
        tools.log.success(result);
      }, function(err) {
        tools.exit.failure( err );
      });

      // Send to Zapier
      var sendComment = new Promise( async( resolve, reject ) => {
        try {
          var request = new XMLHttpRequest();

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
      var labelString = labels.toString();
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
