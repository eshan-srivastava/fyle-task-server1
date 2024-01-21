const http = require('http');
const url = require('url');

const githubToken = process.env.TOKEN;
console.log(githubToken);
const server = http.createServer(async (req, res) => {
    const reqUrl = url.parse(req.url, true);
    
    //cors
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Endpoint to fetch GitHub repos
    if (reqUrl.pathname === '/repos' && req.method === 'GET') {
        try {
            const query = reqUrl.query;
            //const username = 'eshan-srivastava'; GITHUB USERNAME
            const userid = query.user;
            const page = parseInt(query.page) || 1;
            const perPage = parseInt(query.perpage) || 10; // Default to 6 repos per page

            // console.log(`${userid} + ${page} + ${perPage}`);
            console.log(`https://api.github.com/user/${userid}/repos?page=${page}&per_page=${perPage}`);

            const response = await fetch(`https://api.github.com/user/${userid}/repos?page=${page}&per_page=${perPage}`, {
                method: 'GET',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            });

            const apiResponse = await response.json(); //parsing
            console.log(apiResponse);
            //clean data
            const extractedData = apiResponse.map(repo => ({
                fork: repo.fork,
                url: repo.html_url,
                topics: repo.topics,
                desc: repo.description, // Assuming this refers to the description field
                name: repo.name
            }));
            
            //pagination
            const parsedLinks = parseLinks(response.headers.get('Link')); // Parse Link headers

            const paginationLinks = {
                next: parsedLinks['next'],
                prev: parsedLinks['prev'],
                last: parsedLinks['last'],
                first: parsedLinks['first']
            };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ data: extractedData, pagination: paginationLinks }));
        } catch (error) {
            console.error(error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
        function parseLinks(linkHeader) {
            if (!linkHeader) return {};
            return linkHeader.split(',').reduce((links, link) => {
                const parts = link.trim().split(';');
                const url = parts[0].replace(/<(.*)>/, '$1');
                const rel = parts[1].split('=')[1].replace(/"/g, '');
                links[rel] = url;
                return links;
            }, {});
        }
    }
    else if (reqUrl.pathname === '/test' && req.method === 'GET'){
        try{
            res.writeHead(200, { 'Content-Type': 'application/json' });
            // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            res.end("your server is online");
        }
        catch(err){
            console.error(err.message);
        }
    }
    //Endpoint to fetch GitHub user's info for populating info card
    else if (reqUrl.pathname === '/user' && req.method === 'GET') {
        try {
            const query = reqUrl.query;
            const username = query.username; // Use query param or default

            // Using Node.js fetch
            const response = await fetch(`https://api.github.com/users/${username}`, {
                method: 'GET'
            });

            const userResponse = await response.json(); // Parse JSON response

            const extracteduserData = {
                login: userResponse.login,
                html_url: userResponse.html_url,
                name: userResponse.name,
                bio: userResponse.bio,
                location: userResponse.location,
                imgurl: userResponse.avatar_url,
                id: userResponse.id
            }

            //   res.setHeader();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            res.end(JSON.stringify(extracteduserData));
        } catch (error) {
            console.error(error); // Log the error for debugging
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid username provided' })); // Specific error message
        }
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// const port = 3000;
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
