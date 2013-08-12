$(function() {

	Pusher.log = function( msg ) {
		if( console && console.log ) {
			console.log( msg );
		}
	};
	
	
     var MobileServiceClient = WindowsAzure.MobileServiceClient,
     client = new MobileServiceClient('https://bitpusher.azure-mobile.net/', 'NymXlaJMowWRhtHMDsJfraeJntSLAy92'),
     todoItemTable = client.getTable('BitpusherItems');

	 var pusher = new Pusher('7a3940d63ec54490260a'),
	 channel = pusher.subscribe('todo');

	 channel.bind( 'insert', insertItem );
	 channel.bind( 'update', updateItem );
	 channel.bind( 'delete', deleteItem );

	 function initTodoItems() {
		 var query = todoItemTable;
		 query.read().then(function(todoItems) {
			 listItems = $.map(todoItems, createItem);
			 $('#todo-items').empty().append(listItems).toggle(listItems.length > 0);
			 updateItemsCount();
		 });
	 }

	 function updateItemsCount() {
		 var count = $('#todo-items li').size();
		 $('#summary').html('<strong>' + count + '</strong> item(s)');
	 }

	 function createItem(item) {
		 var li = $('<li>')
				  .attr('data-todoitem-id', item.id)
				  .append($('<button class="item-delete">Delete</button>'))
				  .append($('<input type="checkbox" class="item-complete">').prop('checked', item.complete))
				  .append($('<div>').append($('<input class="item-text">').val(item.text)));

		 if( item.complete ) {
			 li.addClass( 'complete' );
		 }

		 return li;
	 }

	 function insertItem(item) {
		 var li = createItem( item );
		 $('#todo-items').append( li );
		 updateItemsCount();
	 }

	 function updateItem(item) {
		 var li = $('#todo-items').find( 'li[data-todoitem-id="' + item.id + '"]' );
		 if( item.text !== undefined) {
			 li.find( '.item-text' ).val( item.text );
		 }

		 if( item.complete === true ) {
			 li.addClass( 'complete' );
			 li.find( '.item-complete' ).prop( 'checked', true );
		 }
		 else if (item.complete === false ) {
			 li.removeClass( 'complete' );
			 li.find( '.item-complete' ).prop( 'checked', false );
		 }
	 }

	 function deleteItem(item) {
		 var li = $('#todo-items').find( 'li[data-todoitem-id="' + item.id + '"]' );
		 li.slideUp( function() {
			 li.remove();
			 updateItemsCount();
		 } );
	 }

	 function getTodoItemId(formElement) {
		 return Number($(formElement).closest('li').attr('data-todoitem-id'));
	 }

	// Handle inserts.
	 $('#add-item').submit(function(evt) {
		 var textbox = $('#new-item-text'),
		 itemText = textbox.val();
		 if (itemText !== '') {
			 todoItemTable.insert({
					text: itemText,
					complete: false
			 });
		 }
		 textbox.val('').focus();
		 evt.preventDefault();
	 });

	// Handle updates.

	 $(document.body).on('change', '.item-text', function() {
		 var newText = $(this).val();
		 todoItemTable.update({
				id: getTodoItemId(this),
				text: newText
		 });
	 });

	 $(document.body).on('change', '.item-complete', function() {
		 var isComplete = $(this).prop('checked');
		 todoItemTable.update({
				id: getTodoItemId(this),
				complete: isComplete
		 });
	 });

	// Handle deletes.

	 $(document.body).on('click', '.item-delete', function() {
		 todoItemTable.del({
				id: getTodoItemId(this)
		 });
	 });

	 
	
	 function refreshAuthDisplay() {
		 var isLoggedIn = client.currentUser !== null;
		 $("#logged-in").toggle(isLoggedIn);
		 $("#logged-out").toggle(!isLoggedIn);

		 if (isLoggedIn) {
			 $("#login-name").text(client.currentUser.userId);
			 initTodoItems();
		 }
	 }


	 function logIn() {
		 client.login("facebook").then(refreshAuthDisplay, function(error){
			 alert(error);
		 });
	 }


	 function logOut() {
		 client.logout();
		 refreshAuthDisplay();
		 $('#summary').html('<strong>You must login to access data.</strong>');
	 }


	 // On page init, fetch the data and set up event handlers
	 refreshAuthDisplay();
	 $('#summary').html('<strong>You must login to access data.</strong>');          
	 $("#logged-out button").click(logIn);
	 $("#logged-in button").click(logOut);
	 // If the user is logged in, start by fetching the current data
	 if (client.currentUser !== null) {
		 initTodoItems();
	 }
	 
});