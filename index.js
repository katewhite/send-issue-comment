const { Toolkit } = require( 'actions-toolkit' );
const { XMLHttpRequest } = require( 'xmlhttprequest' );


Toolkit.run( async ( tools ) => {
  try {
    const { comment, issue, sender } = tools.context.payload;
    const { body, html_url, created_at } = comment;
    const { title, labels } = issue;
    const { login } = sender;

    tools.log(labels);
    if (body.includes('+1') && labels.includes('feature request')) {
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
      tools.exit.neutral( `New comment for '${ issue.title }' does not contain '+1' or the issue is not a feature request. Comment: '${ body }' -- Labels: ${ labels }'` );
    }
  }
  catch( error ){
    tools.exit.failure( error );
  }
}, {
  event: [ 'issue_comment' ],
  secrets: [ 'GITHUB_TOKEN' ],
})
