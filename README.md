# Admin for kue

Kue from automattic is a nice queueing library for nodejs. I use this extensively accross multiple projects but personal and professional. The library comes with a server to monitor and act on items in the queue. In my opinion this server is unstable and is build as a single page app. Also I need to run a seperate server to visualize the state of the queue. Since kue uses redis as a store, AWS redis is not available outside AWS zone. This means running a local server to monitor the queue is a pain. 

This hook adds controllers/services and views needed to provide you with a kue admin interface within your main app. 

## Installing the hook
npm install sails-hook-kue-admin

modify routes
modify policies to control access