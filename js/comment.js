
var Comment = Backbone.Model.extend({
	name:'comment',
	

	displayName:function(){
		var comment =this.get('comment');
		var atPeople=this.get('Person');
		for(var key in atPeople){
			var personAt=personCollection.get(atPeople[key]);
			comment+=' @'+personAt.displayName();
		}

		return comment;
	}
});


	
var CommentCollection = Backbone.Collection.extend({
	model : Comment,
	comparator:function(model){
		return -1*model.get('id');
	}
});
var commentCollection = new CommentCollection();



var CommentView = Backbone.View.extend({
  

  initialize: function(){
		this.commentPerson=personCollection.get(this.model.get('person_id'))
		this.isUserComment=this.commentPerson.id==currentUser.id;
        this.render();
		
  },

	events:{
		'click .delete':'delete'
	},

  render: function() {

	var dataObj = {};
	dataObj.comment= this.model.get('comment');
	dataObj.user=this.commentPerson.displayName();
	if(this.model.get('created')){
		dataObj.date=displayDateFromDatetime(this.model.get('created'));
	}else{
		dataObj.date='Just now';
	}
	var template = '<div class="alert alert-info" style="margin-bottom:5px; position:relative;"> <div style="position:absolute; right:20px; top:2px;"> <button type="button" class="close delete">X</button> </div> <div class="commentTop"> <a class="commentUser showUserData hoverClick" > <%= user %> </a> <span class="pull-right"> <%= date %> </span> </div> <div class="commmentComment"> <%= comment %> </div> </div>'
    var html = $(_.template( template, dataObj  ) );
	
    if(!this.isUserComment){
    	html.remove('.delete');
    }

    $(this.el).html(html);
	
    return this;
  },

	

	'delete':function(){
		
		$(this.el).animate({
		    height: '0'
		  }, 500, function() {
		    $(this).remove();
		  });
		this.model.destroy();
		commentCollection.remove(this.model);

	},

	getUserHtml:function(id){
		return this.commentPerson.displayName();
	}


});

var ThreadView= Backbone.View.extend({
	  commentsLoaded:true,
	
		events:{
			'click .commentsClicked': 'commentsClicked'
		},
	
	  initialize: function(){
	  		var self =this
			//this.popoverHtml=$(_.template($('#comment_comment_template').html(),{}));
			//this.commentsCollection= new CommentCollection();
			this.comments=commentCollection.filter(function(model){
				return model.get('object')==self.options.objectName && model.get('object_id')==self.options.objectId
			}).sort()
 

			this.render();

	  },
	
	  render: function() {
		var self=this;
		var klass= 'label-info';
		var count = _.size(this.comments)>0? _.size(this.comments): ''

		$(this.el).html('<span class="commentsClicked label '+klass+'" style="cursor:pointer; margin-left:5px;"><i class="icon-comment icon-white"></i>'+count+'</span>');

		

	    return this;
	  },

	
		commentsClicked: function(){
			var popoverHtml=$('<div><div class="upperComment"></div><div class="lowerComment"></div></div>');
			
			
			//console.log(popoverHtml)
			$(this.el).popover({title:'Comments',
					content:popoverHtml,
					trigger:'manual',
					width:300,
					placement: 'comment',
					addclosebutton:true
				}).popover('show');

			
			var commentsView = new CommentsView({el:popoverHtml.find('.upperComment'),
															objectName:this.options.objectName,
															objectId:this.options.objectId})

			var createCommentView = new CreateCommentView({el:popoverHtml.find('.lowerComment'),
															objectName:this.options.objectName,
															objectId:this.options.objectId,
															callback:function(){
																commentsView.populateComments();
																commentsView.render();
															}
														})


		}
});

var CreateCommentView =Backbone.View.extend({
	events:{
		'click .sendComment': 'sendComment'
	},
	initialize: function(){
			this.render();
	  },
	render:function(){
		var template='<div> <div class="well" style="margin-bottom:0px; padding-bottom:0px; padding-top:10px;"> <div class="atSelector"></div> <textarea class="commentInput" style="width:100%"></textarea> <br/> <input class="sendComment btn btn-mini btn-primary" type="button" value="Add comment" /> </div> </div> ';
		var html=$(template,{});
		//this.atSelector= new AtSelector({el:html.find('.atSelector')});
		$(this.el).html(html)
		
	},
	sendComment:function(){

		//var atPeople=this.atSelector.val();
		var commentText=$(this.el).find('.commentInput').val()

		var self=this;
		var newComment= new Comment();
		newComment.set({
			object_id: this.options.objectId,
			person_id: currentUser.id,
			comment: commentText,
			object: this.options.objectName
			//Person:atPeople
		});
		commentCollection.add(newComment)

		newComment.save(null,{error:function(response,model){
			alert('Comment save error');
			commentCollection.remove(newComment);
			if(self.options.callback){
				self.options.callback();
			}
		}});

		if(self.options.callback){
			self.options.callback();
		}
	}
})

var CommentBoxView= Backbone.View.extend({
	events:{
		'click .showPopover':'showPopover'
	},
	initialize:function(){
		this.render();
	},

	render:function(){
		var html=$('<div><div class="upperComment"></div><div class="lowerComment"><button class="btn btn-mini btn-primary showPopover">Add comment</button></div></div>');
			
		this.commentsView = new CommentsView({el:html.find('.upperComment'),
											objectName:this.options.objectName,
											objectId:this.options.objectId})
		
		$(this.el).html(html)
	},

	showPopover:function(){
		
		var self=this
		var popoverHtml=$('<div></div>')		
		//console.log(popoverHtml)
		var popoverElement=$(this.el).find('.showPopover')

		//console.log(popoverElement.data('popover'));
		popoverElement.removeData('popover')

		var popover = popoverElement.popover({title:'Comments',
				content:popoverHtml,
				trigger:'manual',
				width:300,
				placement: 'comment',
				addclosebutton:true
			}).popover('show');

		var createCommentView = new CreateCommentView({el:popoverHtml,
														objectName:this.options.objectName,
														objectId:this.options.objectId,
														callback:function(){
															self.commentsView.populateComments();
															self.commentsView.render();
															popover.popover('hide')
															popoverElement.removeData('popover')
														}
													})
	}

	
})

var CommentsView= Backbone.View.extend({

	initialize: function(){
			this.populateComments();

			this.render();
	  },
	populateComments:function(){
		var self=this;
		this.comments=commentCollection.filter(function(model){
			return model.get('object')==self.options.objectName && model.get('object_id')==self.options.objectId
		}).sort()
	},
	render:function(){
		
		var html=$('<div  style="min-width:250px; max-height:300px; overflow-y:scroll"></div>')
		
		for(var i in this.comments){
			var holder= $('<div></div>')
			var commentView= new CommentView({el:holder,
											  model:this.comments[i]
											})
			html.append(holder)
		}

		if(_.size(this.comments)==0){
			html.css('overflow-y','hidden')
			html.append('<div >No comments</div>')
		}

		$(this.el).html(html)
	}
});


var AtSelector= Backbone.View.extend({
	events:{

		/*'click .addAt': 'addAt',*/
		'change .peopleDropdown': 'addAt',
		'click .removePerson' :'removePerson'
	},
	
	val:function(){

		var val=[];
		$(this.el).find('.person').each(function(index,element){
			
			var value= parseInt($(element).attr('data-personId'),10);
			
			if(value>0 && val.indexOf(value)==-1 ){
				val.push(value);
			}
			
		});


		return val;
	},
	
	initialize: function(){
			this.render();
	  },
	render:function(){
		
		var html=$(_.template($('#comment_at_template').html(),{}));
		html.find('.selectHolder').append(this.createPeopleSelector());
		$(this.el).html(html);
	},
	
	addAt:function(){

		var personId=$(this.el).find('.peopleDropdown').val();
		var html =$('<span class="person label label-info" data-personId="'+personId+'" style="margin-left:5px;">'+personCollection.get(personId).displayName()+'<span class="removePerson" style="cursor:pointer;">&nbsp;-&nbsp;</span></span>');
		$(this.el).find('.peopleHolder').append(html);
		$(this.el).find('.peopleDropdown').val('');
		this.delegateEvents();
	},

	removePerson:function(event){
		$(event.target).parent().remove();
	},
	
	createPeopleSelector:function(){
		var select=$('<select style="width:150px" class="peopleDropdown"></select>');
		var activePeople= getActiveModelsFromCollection(personCollection);
		select.append('<option value="-2">Select a person</option>');
		for(var key in activePeople){
			var model =activePeople[key];
			select.append('<option value="'+model.id+'">'+model.displayName()+'</option>');
		}
		//select.append('<option value="-1">Remove</option>');
		return select;
	}

});


var CommentTableCellView=Backbone.View.extend({
	tHead:'<tr><th>Message</th><th>From</th><th>Object</th><th>Date</th></tr>',
	initialize: function(){
			this.render();
	  },

	render:function(){
		//console.log(this.model.get('object'));
		var object = window[this.model.get('object').toLowerCase()+'Collection'].get(this.model.get('object_id'));
		
		var objectLink = object.makeInternalconsole.log(objectLink)
		var dataObj={
			message:this.model.displayName(),
			from: personCollection.get(this.model.get('person_id')).displayName(),
			date: displayDateFromDatetime(this.model.get('created')),
			object :objectLink
		};
		var html=$(_.template($('#comment_row_template').html(),dataObj));
		
		$(this.el).html(html);
	}

});