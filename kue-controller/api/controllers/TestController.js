/**
 * MainController
 *
 * @description :: Server-side logic for managing mains
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const fs = require('fs');
const async = require('async');


module.exports = {
	testKuePage:function(req,res){
		TestService.printTest();
		// console.log(sails.services);
		// Cache.findOne({key:"landing_page_stats"}).exec(function(err,result){
		// 	if(err)
		// 		throw err;
			var locals={
				// stats:result.value
			}
			sails.hooks.views.render('/../api/hooks/kue-controller/views/sample',{},function(err,html){
				
				console.log(__dirname);
				console.log(err);
				console.log(html);
				res.send(html);
			});
		
		// res.send('this is from test kue controller');
			// res.view('sample',locals);
		// });
	}
};


//

