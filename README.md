#object-comment
==============

A backbone component to have user comments on any backbone model.

Check a demo out at the [Project Site](https://process-smith.com/object-comment)



###Uses
---
Lets say you have a task object in your Backbone app and you want to add the ability to comment on that task. Object-Comment is the library for you. Simply set a few variables and your models can start taking comments.

###Requirements
---
jQuery, bootstrap, underscore.js, backbone.js, and [this advanced popover bootstrap fork](https://github.com/fasteddie31003/bootstrap)

Your app needs a backend that can save the comments.
Your app also needs some kind of user model and specify it in the settings object.
###Setup


Setup the settings object and create an ObjectComment instance.
---
 ```javascript
 var objectCommentSettings={
	PERSON_MODEL:'Person',
	PERSON_COLLECTION:'personCollection',
	PERSON_DISPLAY_NAME_FUNCTION:function(model){
		return model.get('first_name')+' '+model.get('last_name')
	},
	COMMENT_URL:'/',
	CURRENT_USER: currentUser,
	COMMENTS: tempCommentsCollection 
}

var objectComment= new ObjectComment(objectCommentSettings);
 ```

Use either the button style comment
```javascript
var commentButtonView= new objectComment.threadView(
	{el:$('#commentButton'),
	objectName: 'AnyObject',
	objectId: 1});
```

or the comment list style
```javascript
var commentButtonView= new objectComment.commentBoxView({el:$('#commentList'),
	objectName: 'AnyObject',
	objectId: 1});
```

