# client and server template

## This template consists of a React UI that connects to an Express server running on Node.js (tested on v16.15.1 and v17.9.1) powered by MongoDB (tested on v5.0.6) running on Docker.

### First run:

```
git clone https://github.com/greenshield/template.git
cd template
npm install
```

### Then start a local instance of MongoDB (tested on v5.0.6 and v6.0.0) or start an instance of MongoDB (tested on v5.0.6) using Docker by running:

`docker run -it -d -p 27017:27017 --name mongodb mongo`

### Then launch an instance of Redis using Docker by running:

`docker run -p 6379:6379 --name template -d redis`

### Then start the backend server and the React development server:

```
npm run dev
npm start
```

### Then visit:

`http://localhost:3000/`

### If everything is configured correctly, you should see the Sign In screen.

### **Options**<br />

Use `npm run dev` to start the backend server for development using `.env.development` for the environment variables.

Use `npm run server` to start the backend server for production using `.env` for the environment variables.

> **Note**<br />Running _any_ React app in development mode by using `npm start` or viewing the app in a browser with the developer console open will significatnly affect the performance of _some_ render-intensive portions of the UI (such as data tables, responsive resizing, theme switching, etc). You can compile the UI for production using `npm run build` and serve those static files through a web server (such as nginx or Apache) to achieve maximum performance. The performance difference between development and production mode for _all_ React apps is significant and noticeable.

## An `nginx` server/host configuration is included if you need to use this template on a live domain name.

### Configurations for both port 443 (SSL) and port 80 (non-SSL) are included.

### Make sure to replace your domain name on the two lines that read:

```
server_name domain.com www.domain.com;
```

### Also be sure to replace the SSL certificate and key on the following lines:

```
ssl_certificate /server/template/cert.pem;
ssl_certificate_key /server/template/key.pem;
```

### The nginx configuration assumes that you have installed the template at the following path: `/server/template`, so your directiory structure should look like this:

```
/server/template
/server/template/src
/server/template/server
/server/template/package.json
...
```
