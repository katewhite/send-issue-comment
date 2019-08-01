const { Toolkit } = require( 'actions-toolkit' );
const { XMLHttpRequest } = require( 'xmlhttprequest' );


Toolkit.run( async ( tools ) => {
  try {
    const { comment, issue, sender } = tools.context.payload;
    const { body, html_url, created_at } = comment;
    const { title } = issue;
    const { login } = sender;

    

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
        request.send(data);

        resolve();
      }
      catch( error ){
        reject( error );
      }
    });

    // Wait for completion
    sendComment.then(function(result) {
      tools.log.success(
        `Sent new issue comment for ${ issue.title } to Zapier.`
      );
      tools.log.success(result);
    }, function(err) {
      tools.exit.failure( err );
    });


    // if( action !== 'assigned' ){
    //   tools.exit.neutral( `Event ${ action } is not supported by this action.` )
    // }

    // // Get the arguments
    // const projectName = tools.arguments._[ 0 ];
    // const columnName  = tools.arguments._[ 1 ];

    // const secret = process.env.GH_PAT ? process.env.GH_PAT : process.env.GITHUB_TOKEN;

    // // Check if there are existing asignees
    // if( issue.assignee && issue.assignee.length ) {
    //   const assigneeLogins = issue.assignee.map( data => data.login ).join( ', ' );
    //   tools.exit.neutral( `${ assigneeLogins } are already assigned. Leaving ${ issue.title } in current column.` );
    // }

    // // Fetch the column ids and names
    // const { resource } = await tools.github.graphql({
    //   query: `query {
    //     resource( url: "${ issue.html_url }" ) {
    //       ... on Issue {
    //         projectCards {
    //           nodes {
    //             id
    //             column {
    //               name
    //             }
    //           }
    //         }
    //         repository {
    //           projects( search: "${ projectName }", first: 10, states: [OPEN] ) {
    //             nodes {
    //               columns( first: 100 ) {
    //                 nodes {
    //                   id
    //                   name
    //                 }
    //               }
    //             }
    //           }
    //           owner {
    //             ... on Organization {
    //               projects( search: "${ projectName }", first: 10, states: [OPEN] ) {
    //                 nodes {
    //                   columns( first: 100 ) {
    //                     nodes {
    //                       id
    //                       name
    //                     }
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }`,
    //   headers: {
    //     authorization: `token ${ secret }`
    //   }
    // });

    // // Get the card id and the column name
    // const cardId = resource.projectCards.nodes 
    //   && resource.projectCards.nodes[ 0 ]
    //   && resource.projectCards.nodes[ 0 ].id
    //   || null;

    // const currentColumn = resource.projectCards.nodes
    //   && resource.projectCards.nodes[ 0 ]
    //   && resource.projectCards.nodes[ 0 ].column.name
    //   || null;

    // if( cardId === null || currentColumn === null ){
    //   tools.exit.failure( `The issue ${ issue.title } is not in a project.` );
    // }

    // if( currentColumn === columnName ){
    //   tools.exit.neutral( `The issue ${ issue.title } is already in ${ columnName }.` );
    // }

    // // Get an array of all matching projects
    // const repoProjects = resource.repository.projects.nodes || [];
    // const orgProjects = resource.repository.owner
    //   && resource.repository.owner.projects
    //   && resource.repository.owner.projects.nodes
    //   || [];
    
    // // Get the columns with matching names
    // const columns = [ ...repoProjects, ...orgProjects ]
    //   .flatMap( projects => {
    //     return projects.columns.nodes
    //       ? projects.columns.nodes.filter( column => column.name === columnName )
    //       : [];
    //   });

    // // Check we have a valid column ID
    // if( !columns.length ) {
    //   tools.exit.failure( `Could not find "${ projectName }" with "${ columnName }" column` );
    // }

    // // Move the cards to the columns
    // const moveCards = columns.map( column => {
    // return new Promise( async( resolve, reject ) => {
    //   try {
    //     await tools.github.graphql({
    //       query: `mutation {
    //         moveProjectCard( input: { cardId: "${ cardId }", columnId: "${ column.id }" }) {
    //           clientMutationId
    //         }
    //       }`,
    //       headers: {
    //         authorization: `token ${ secret }`
    //       }
    //     });

    //     resolve();
    //   }
    //   catch( error ){
    //     reject( error );
    //   }
    // });

    // // Wait for completion
    // await Promise.all( moveCards ).catch( error => tools.exit.failure( error ) );

    // // Log success message
    // tools.log.success(
    //   `Moved newly assigned issue ${ issue.title } to ${ columnName }.`
    // );
  }
  catch( error ){
    tools.exit.failure( error );
  }
}, {
  event: [ 'issue_comment' ],
  secrets: [ 'GITHUB_TOKEN' ],
})
