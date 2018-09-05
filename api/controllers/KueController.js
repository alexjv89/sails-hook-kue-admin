/**
 * KueController
 * this controller shows things that are in the queue
 * @description :: Server-side logic for managing kues
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var kue = require( 'kue' );
var async = require('async');
 // create our job queue

var queue = kue.createQueue({
	prefix: 'q',
	redis: sails.config.redis_kue
});
var hook_view_dir = '/../node_modules/sails-hook-kue-admin/views';

module.exports = {
	index:function(req,res){
		var job_types=['index_urls','crawl_url_twitter','send_email','getUrlsFromGoogleSearch','runSpider'];
		var job_stats=[];
		async.eachLimit(job_types,1,function(job_type,next){
			async.auto({
				inActiveCount:function(callback){
					queue.inactiveCount(job_type,callback);
				},
				completeCount:function(callback){
					queue.completeCount(job_type,callback);
				},
				failedCount:function(callback){
					queue.failedCount(job_type,callback);
				},
				delayedCount:function(callback){
					queue.delayedCount(job_type,callback);
				},
				activeCount:function(callback){
					queue.activeCount(job_type,callback);
				},
			},function(err,results){
				var js={
					job_type:job_type,
					inActiveCount:results.inActiveCount,
					completeCount:results.completeCount,
					failedCount:results.failedCount,
					delayedCount:results.delayedCount,
					activeCount:results.activeCount
				}
				job_stats.push(js);
				next(err);
			});
		},function(err,results){
			if(err)
				throw err;
			async.auto({
				inActiveCount:function(callback){
					queue.inactiveCount(callback);
				},
				completeCount:function(callback){
					queue.completeCount(callback);
				},
				failedCount:function(callback){
					queue.failedCount(callback);
				},
				delayedCount:function(callback){
					queue.delayedCount(callback);
				},
				activeCount:function(callback){
					queue.activeCount(callback);
				},
			},function(err,results){
				var locals={
					job_stats:job_stats,
					overall_stats:results,
				}
				res.view(hook_view_dir+'/kue/index',locals);
			})
		});
		
	},
	listItemsInKue:function(req,res){
		var n = req.query.n?req.query.n:30;
		var page = req.query.page?req.query.page:1;
		var state = req.params.state?req.params.state:'active'
		var order_by=req.query.order_by?req.query.order_by:'asc';
		var start = (page-1)*n;
		var end = page*n-1;
		if(state!='active'&&state!='failed'&&state!='inactive'&&state!='complete'&&state!='delayed')
			return res.send('invalid state');
		if(req.query.job_type){
			kue.Job.rangeByType( req.query.job_type, req.params.state, start, end, order_by, function( err, jobs ) {
				jobs.forEach(function(job){
					job.created_at=GeneralService.timeAgo(parseInt(job.created_at));
					job.updated_at=GeneralService.timeAgo(parseInt(job.updated_at));
				})
				res.view(hook_view_dir+'/kue/list_items',{jobs:jobs});
				// res.send({jobs:jobs});
			  // you have an array of maximum n Job objects here
			});	
		}else{

			kue.Job.rangeByState( req.params.state, start, end, order_by, function( err, jobs ) {
				jobs.forEach(function(job){
					job.created_at=GeneralService.timeAgo(parseInt(job.created_at));
					job.updated_at=GeneralService.timeAgo(parseInt(job.updated_at));
				})
				res.view(hook_view_dir+'/kue/list_items',{jobs:jobs});
				// res.send({jobs:jobs});
			  // you have an array of maximum n Job objects here
			});
		}
	},
	retryJob:function(req,res){
		var job_id=req.body.job_id?req.body.job_id:'';
		console.log(job_id);
		if(job_id=='')
			return res.send(400,'bad request');
		kue.Job.get( job_id, function( err, job ) {
			if(err)
				return res.json(500,err);
			// console.log(job);
			console.log('making the job inactive now');
			job.inactive();
			res.send(200,'ok')
		});
		
	}
};
