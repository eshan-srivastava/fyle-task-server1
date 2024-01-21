# Github Repo View - Assignment
## Server side (Backend - Node.js HTTP)

#### API Routes
1. **/user** - takes 1 parameter that is the username as given by user input in client side
2. **/repos** - takes 3 paramters: userid, page, per_page and leverages github api's pagination to return results 

*Since this is for non-production purposes, cors rules are lenient*
*PORT can be configured as a variable in the file*

#### Steps to run this
The server is in a standalone file, ensure that you hve node.js installed and then run server using
1. node server.js
