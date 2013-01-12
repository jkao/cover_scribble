var app = app || {}

app.COVER_PHOTO_CREATE_URL = "/cover_photos"
app.COVER_PHOTO_SET_URL = "http://www.facebook.com/profile.php?preview_cover="

app.COVER_PHOTO_QUERY = "/cover_photos.json"

app.BASE_64_DATE_PREFIX = "data:image/png;base64,"

app.default_brush_settings = {
	lineWidth : 5,
	lineJoin : 'round',
	lineCap : 'round',
	strokeStyle : 'black',
	fillStyle : 'black'
}

app.initialize_handlers = function() {
  console.log("Initialize handlers");

  // Mouse down
  app.canvas.addEventListener('mousedown', function(e) {
      app.context.beginPath();
      app.context.moveTo(app.mouse.x, app.mouse.y);
   
      app.canvas.addEventListener('mousemove', onPaint, false);
  }, false);

  // Mouse up
  app.canvas.addEventListener('mouseup', function() {
    app.canvas.removeEventListener('mousemove', onPaint, false);
  }, false);

  // Mouse move
  app.canvas.addEventListener('mousemove', function(e) {
		app.mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		app.mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
  }, false);

  // Mouse move while clicked
  var onPaint = function(e) {
    app.context.lineTo(app.mouse.x, app.mouse.y);
    app.context.stroke();

	};

}

app.initialize_tool_prefs = function() {
  // Canvas Clear Button
  $("#clear-canvas").click(function(e) {
    confirm_msg = "Are you sure you want to clear the canvas?";

    if (confirm(confirm_msg)) {
      app.context.clearRect(
        0, 0, app.canvas.width, app.canvas.height
      );

      app.bottom_context.strokeStyle = "#ffffff";
      app.bottom_context.fillStyle = "#ffffff";
      app.bottom_context.fillRect(
        0, 0, app.bottom_canvas.width, app.bottom_canvas.height
      );
    }
  });

  // Save Button
  $("#save").click(function(e) {
    e.preventDefault();
    app.upload();
  });

  // Size Toggle
  $("#size-picker").slider({
    range : "max",
    min : 3,
    max : 50,
    value: 5,
    slide : function(event, ui) {
      console.log("ui.value");
      console.log(ui.value);
      $("#size").text("Size: " + ui.value);

      // Change the context stroke size
      app.context.lineWidth = ui.value;
    }
  });
}

app.initialize = function() {

  // Set up the user and drawer
  app.user = {
    uid : $("#user-info").data("uid"),
    name : $("#user-info").data("name"),
    id : $("#user-info").data("id")
  };
  app.drawer = {
    uid : $("#drawer-info").data("uid"),
    name : $("#drawer-info").data("name"),
    id : $("#drawer-info").data("id")
  };

  // Canvas
  app.canvas = document.getElementById("cover-photo");
  app.context = app.canvas.getContext("2d");

  // Set up the Context
  app.context.lineWidth = app.default_brush_settings["lineWidth"];
  app.context.lineJoin = app.default_brush_settings["lineJoin"];
  app.context.lineCap = app.default_brush_settings["lineCap"];
  app.context.strokeStyle = app.default_brush_settings["strokeStyle"];
  app.context.fillStyle = app.default_brush_settings["fillStyle"];

  // Set up the bottom canvas
  app.bottom_canvas = document.getElementById("bottom-canvas");
  app.bottom_context = app.bottom_canvas.getContext("2d");

  app.bottom_context.strokeStyle = "#ffffff";

  app.bottom_context.fillStyle = "#ffffff";
  app.bottom_context.fillRect(
    0, 0, app.bottom_canvas.width, app.bottom_canvas.height
  );

  // Set it to image if there is (via server)
  // Otherwise clear it
  if ($("#initial-cover").data("code")) {
    var img = new Image;
    img.src = app.BASE_64_DATE_PREFIX + $("#initial-cover").data("code");

    $.blockUI();

    // Set event handler when image loads
    img.onload = function() {
      app.bottom_context.drawImage(img, 0, 0);
      $.unblockUI();
    };
  } else {
    // No previous image, leave it cleared
  }

  // Mouse
  app.mouse = {x:0, y:0};
  app.last_mouse = {x:0, y:0};

  // Pencil Points
  app.ppts = [];

  // Mouse Event Handlers
  app.initialize_handlers();

  // Initialize Color Picker
  $("#color-picker").spectrum({
    flat: false,
    clickoutFiresChange: true,
    change: app.color_change_handler,
    move: app.color_change_handler
  });

  // Initialize Tool Preference Setters
  app.initialize_tool_prefs();

  // Initialize FB Dialog
  app.initialize_facebook_friends_dialog();

}

// Initialize friends dialog
app.initialize_facebook_friends_dialog = function() {
  $("#profile-photo-link").fSelector({
    max: 1,
    lang: {
      buttonSubmit: "Select"
    },
    closeOnSubmit: true,
    onSubmit: function(response){
      if (response.length > 0) {
        var selected_friend = response[0];
        var params = {
          "user_uid" : selected_friend
        }

        // Do a GET on that user's canvas photos
        $.get(app.COVER_PHOTO_QUERY, params,
              function(response) {
                window.location.href = "/cover_photos?user_uid=" + selected_friend;
                //app.setup_user_canvas(response);
              }).error(function() { 
                // Offer an invite if they don't have the app
                if (confirm("Looks like your friend hasn't added the app yet. Invite them?")) {
                   FB.ui({
                       method: 'apprequests',
                       message: 'Hey! Join in on the fun with Canvas Scribble!'
                   });
                }
              });
      }
    }
  });
}

app.setup_user_canvas = function(json_response) {
  // TODO: Just do a redirect -_-
  console.log("json_response");
  console.log(json_response);
}

app.color_change_handler = function(color_obj) {
  console.log("color");
  console.log(color_obj);
  console.log(color_obj.toHexString());

  app.context.strokeStyle = color_obj.toHexString();
  app.context.fillStyle = color_obj.toHexString();
}

// Merge the drawing layer to the original image
app.merge_to_one_image = function() {
  app.bottom_context.drawImage(app.canvas, 0, 0);
}

app.upload = function() {
  $.blockUI();

  // Merge the layers to one picture
  app.merge_to_one_image();

  try {
    var img = app.bottom_canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
  } catch(e) {
    var img = app.bottom_canvas.toDataURL().split(',')[1];
  }

  // open the popup in the click handler so it will not be blocked

  $.ajax({
    url: 'http://api.imgur.com/2/upload.json',
    type: 'POST',
    data: {
      type: 'base64',
      // get your key here, quick and fast http://imgur.com/register/api_anon
      key: 'ff452555b200c9d20c3def79ada1e64f',
      name: app.user.uid + '-cs.jpg',
      title: 'Cover Scribble',
      caption: '',
      image: img
    },
    dataType: 'json'
  }).success(function(data) {
    // Upload to rails backend
    var image_url = data['upload']['links']['original'];
    var access_token = FB.getAccessToken();

    var post_params = {
      access_token : access_token,
      image_url : image_url,
      image_code : img,
      user_id : app.user["id"]
    }

    $.post(app.COVER_PHOTO_CREATE_URL, post_params, function(response) {
      $.unblockUI();

      // Check success
      if (response.errors) {
        alert("An error occured... Make sure you have Facebook permissions enabled! :(");
      } else {
        // if the person that drew on the image owns the cover,
        // request them to upload it to facebook
        if (app.user.id == app.drawer.id) {
          var fb_id = response.facebook_identifier
          var fb_url = app.COVER_PHOTO_SET_URL + fb_id;

          console.log(fb_url);

          // Display the modal to synch on Facebook
          $("#use-on-facebook").attr("href", fb_url);
          $("#upload-dialog").modal('show');
        }
      }
    }).error(function() {
      $.unblockUI();
      alert("An error occurred :(");
    });



  }).error(function() {
    $.unblockUI();
    alert('Could not reach api.imgur.com. Sorry :(');
  });


}

$(document).ready(function() {
  // only run this if we are on the app page
  if ($("#cover-photo").length > 0) {
    app.initialize();
  }
});
