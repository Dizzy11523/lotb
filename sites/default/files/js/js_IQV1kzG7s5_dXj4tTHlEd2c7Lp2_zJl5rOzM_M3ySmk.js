/*
 * jQuery autoResize (textarea auto-resizer)
 * @copyright James Padolsey http://james.padolsey.com
 * @version 1.04
 */

(function($){
    
    $.fn.autoResize = function(options) {
        
        // Just some abstracted details,
        // to make plugin users happy:
        var settings = $.extend({
            onResize : function(){},
            animate : true,
            animateDuration : 150,
            animateCallback : function(){},
            extraSpace : 20,
            limit: 1000
        }, options);
        
        // Only textarea's auto-resize:
        this.filter('textarea').each(function(){
            
                // Get rid of scrollbars and disable WebKit resizing:
            var textarea = $(this).css({resize:'none','overflow-y':'hidden'}),
            
                // Cache original height, for use later:
                origHeight = textarea.height(),
                
                // Need clone of textarea, hidden off screen:
                clone = (function(){
                    
                    // Properties which may effect space taken up by chracters:
                    var props = ['height','width','lineHeight','textDecoration','letterSpacing'],
                        propOb = {};
                        
                    // Create object of styles to apply:
                    $.each(props, function(i, prop){
                        propOb[prop] = textarea.css(prop);
                    });
                    
                    // Clone the actual textarea removing unique properties
                    // and insert before original textarea:
                    return textarea.clone().removeAttr('id').removeAttr('name').css({
                        position: 'absolute',
                        top: 0,
                        left: -9999
                    }).css(propOb).attr('tabIndex','-1').insertBefore(textarea);
          
                })(),
                lastScrollTop = null,
                updateSize = function() {
          
                    // Prepare the clone:
                    clone.height(0).val($(this).val()).scrollTop(10000);
          
                    // Find the height of text:
                    var scrollTop = Math.max(clone.scrollTop(), origHeight) + settings.extraSpace,
                        toChange = $(this).add(clone);
            
                    // Don't do anything if scrollTip hasen't changed:
                    if (lastScrollTop === scrollTop) { return; }
                    lastScrollTop = scrollTop;
          
                    // Check for limit:
                    if ( scrollTop >= settings.limit ) {
                        $(this).css('overflow-y','');
                        return;
                    }
                    // Fire off callback:
                    settings.onResize.call(this);
          
                    // Either animate or directly apply height:
                    settings.animate && textarea.css('display') === 'block' ?
                        toChange.stop().animate({height:scrollTop}, settings.animateDuration, settings.animateCallback)
                        : toChange.height(scrollTop);
                };
            
            // Bind namespaced handlers to appropriate events:
            textarea
                .unbind('.dynSiz')
                .bind('keyup.dynSiz', updateSize)
                .bind('keydown.dynSiz', updateSize)
                .bind('change.dynSiz', updateSize);
            
        });
        
        // Chain:
        return this;
        
    };
    
    
    
})(jQuery);;
(function($) {

  /**
   * Heartbeat comments object
   */
  Drupal.heartbeat = Drupal.heartbeat || {};
  Drupal.heartbeat.comments = Drupal.heartbeat.comments || {};
  Drupal.heartbeat.comments.button = null;
  Drupal.heartbeat.comments.autoGrowArea = null;
  
  /**
   * Attach behaviours to the message streams
   */
  Drupal.behaviors.heartbeatComments = {
    attach: function (context, settings) {

      // Hook into submit button for comments.      
      Drupal.heartbeatCommentButton(context);

      // Allow the comment textarea's to grow with the comment length.
      $('.heartbeat-comments .autoGrow', context).once('textarea', function () {
        
        $(this).autoResize({
          // On resize:
          onResize : function() {
            $(this).css({opacity:0.8});
          },
          // After resize:
          animateCallback : function() {
            $(this).css({opacity:1});
          },
          // Quite slow animation:
          animateDuration : 300,
          // More extra space:
          extraSpace : 0
        });
        
      });
      
    }
  };
  
  /**
   * Toggle the comment box.
   */
  Drupal.heartbeat.comments.toggleComments = function (element, uaid) {
    $(element).closest('.heartbeat-activity').find('#heartbeat-comments-wrapper-' + uaid).toggle('fast');
  };
  
  /**
   * Ajax method to load comments for an activity message (and its node).
   */
  Drupal.heartbeat.comments.load = function (uaid, node_comment, nid) {
    var url = Drupal.settings.basePath + 'heartbeat/comments/load/js';
    $.post(url, 
      {uaid: uaid, node_comment: node_comment, nid: nid}, 
      Drupal.heartbeat.comments.loaded, 
      'json');
  };
  
  /**
   * After ajax-load comments function.
   */
  Drupal.heartbeat.comments.loaded = function(data) {
  
    if (data.data != undefined) {
      $('#heartbeat-comments-wrapper-' + data.uaid).html(data.data);
    }
    
  };
  
  /**
   * Class heartbeatCommentButton
   * 
   * Heartbeat comment buttons for the page.
   */
  Drupal.heartbeatCommentButton = function(context) {

    /**
     * Submit handler for a comment for a heartbeat message or its node.
     */
    function commentSubmit() {
      
      var element = this;

      // If the button is set to disabled, don't do anything or if 
      // the field is blank, don't do anything.
      Drupal.heartbeat.comments.field = $(element).parents('form').find('.heartbeat-message-comment');
      if ($(element).attr("disabled") || Drupal.heartbeat.comments.field.val() == ''){
        return false;
      }

      // Throw in the throbber
      Drupal.heartbeat.comments.button = $(element);
      Drupal.heartbeat.wait(Drupal.heartbeat.comments.button, '.heartbeat-comments-wrapper');
      Drupal.heartbeat.comments.button.attr("disabled", "disabled");
      
      var formElement = $(element).parents('form');
      
      // Disable form element, uncomment the line below
      formElement.find('.heartbeat-message-comment').attr('disabled', 'disabled');
      
      var url = Drupal.settings.basePath + 'heartbeat/comment/post';
      var nid = formElement.find('.heartbeat-message-nid').val();
      var node_comment = formElement.find('.heartbeat-message-node-comment').val();
      var arr_list = $('#heartbeat-comments-list-' + formElement.find('.heartbeat-message-uaid').val());

      var args = {
        message: formElement.find('.heartbeat-message-comment').val(), 
        uaid: formElement.find('.heartbeat-message-uaid').val(), 
        nid: (nid == undefined ? 0 : nid), 
        node_comment: (node_comment == undefined ? 0 : node_comment),
        path: location.href,
        first_comment: !(arr_list.length)
      };

      // Send POST request
      $.ajax({
        type: 'POST',
        url: url, //element.href,
        data: args,
        dataType: 'json',
        success: commentSubmitted,
        error: function (xmlhttp) {
          alert('An HTTP error '+ xmlhttp.status +' occurred.\n'+ url);
          Drupal.heartbeat.doneWaiting();
          Drupal.heartbeat.comments.button.removeAttr("disabled");
        }
      });
      
      return false;

    }
    
    /**
     * Function callback after comment has been submitted.
     */
    function commentSubmitted(data) {
    
      if (data.id != undefined) {
        
        var oldest_first = Drupal.settings.heartbeat_comments_order == 'oldest_on_top';
        var list_first = Drupal.settings.heartbeat_comments_position == 'up';
        var arr_list = $('#heartbeat-comments-list-' + data.id);
        
        // If no comments have been posted yet for this activity.
        if (!(arr_list.length)) {
          
          // The created ul or div wrapper is created in PHP.
          if (list_first) {
            var new_comment = $('#heartbeat-comments-wrapper-' + data.id + ' .heartbeat-comments').prepend(data.data);
          }
          else {
            var new_comment = $('#heartbeat-comments-wrapper-' + data.id + ' .heartbeat-comments').append(data.data);
          }
          
        }
        // Add the comment to the rest.
        else {
          
          if (oldest_first) {
            // Here there is a change the "heartbeat-comment-more" is present.
            if ($('#heartbeat-comments-list-' + data.id + ' .heartbeat-comment-more').length > 0) {
              var new_comment = $('#heartbeat-comments-list-' + data.id + ' .heartbeat-comment-more').before(data.data);
            }
            else {
              var new_comment = $('#heartbeat-comments-list-' + data.id).append(data.data);
            }
          }
          else {
            var new_comment = $('#heartbeat-comments-list-' + data.id).prepend(data.data);
            
          }
          
        }
        
        $('#heartbeat-comments-wrapper-' + data.id + ' .heartbeat-comments textarea').each(function(){
          $(this).val('');
        });
        
        // Update the count of the comments.
        var button = $(data.newButton);
        $('.heartbeat-attachment-button',  $('.heartbeat-activity-' + data.id)).after(button).remove();
        
        // Reattach the behaviors for the newly added content (or list).
        Drupal.attachBehaviors(new_comment);
        Drupal.attachBehaviors(button);
        
        Drupal.heartbeat.doneWaiting();
        Drupal.heartbeat.comments.button.removeAttr("disabled");
        
        $('#heartbeat-comments-list-' + data.id).parent().parent().find('.heartbeat-message-comment').removeAttr("disabled");
        
      }
    };

    $('input.heartbeat-comment-submit:not(.heartbeat-processed)', context)
      .addClass('heartbeat-processed')
      .click(commentSubmit);
    
  };
  
})(jQuery);;
(function ($) {

  Drupal.behaviors.context_accordion = {
    attach: function (context, settings) {
      $('#edit-reactions-plugins-block-selector').accordion({ header: '.form-type-checkboxes > label', autoHeight: false});
    }
  };
}(jQuery));


;
