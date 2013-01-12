var app = app || {}

app.COVER_PHOTO_CREATE_URL = "/cover_photos"
app.COVER_PHOTO_SET_URL = "http://www.facebook.com/profile.php?preview_cover="

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

  // TODO: Set it to image if there is (via server)
  // Otherwise clear it

  /*
  // Temporary Canvas
  app.tmp_canvas = document.createElement('canvas');
  app.tmp_context = app.tmp_canvas.getContext("2d");

  console.log("app.context");
  console.log(app.context);
  console.log("app.tmp_context");
  console.log(app.tmp_context);

  // Set up the Temp Canvas
  app.tmp_canvas.id = "tmp-canvas";
  app.tmp_canvas.classList.add("canvas-layer");
  app.tmp_canvas.width = app.canvas.width;
  app.tmp_canvas.height = app.canvas.height;

  // Set up the Temp Context
  app.tmp_context.lineWidth = app.default_brush_settings["lineWidth"];
  app.tmp_context.lineJoin = app.default_brush_settings["lineJoin"];
  app.tmp_context.lineCap = app.default_brush_settings["lineCap"];
  app.tmp_context.strokeStyle = app.default_brush_settings["strokeStyle"];
  app.tmp_context.fillStyle = app.default_brush_settings["fillStyle"];
  */

  // Add the Temp Canvas on There
  //$("#cover-photo-wrapper").append(app.tmp_canvas);

  // Mouse
  app.mouse = {x:0, y:0};
  app.last_mouse = {x:0, y:0};

  // Pencil Points
  app.ppts = [];

  // Mouse Event Handlers
  app.initialize_handlers();

  // Initialize Color Picker
  $("#color-picker").spectrum({
    flat: true,
    change: app.color_change_handler,
    move: app.color_change_handler
  });
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
  // Merge the layers to one picture
  app.merge_to_one_image();

  try {
    var img = app.bottom_canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
  } catch(e) {
    var img = app.bottom_canvas.toDataURL().split(',')[1];
  }

  console.log("img");
  console.log(img);

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
    console.log("SUCCESS");
    console.log(data);

    // Upload to rails backend
    image_url = data['upload']['links']['original'];
    access_token = FB.getAccessToken();

    post_params = {
      access_token : access_token,
      image_url : image_url,
      user_id : app.user["id"]
    }

    $.post(app.COVER_PHOTO_CREATE_URL, post_params, function(response) {
      console.log(response);

      // Check success
      if (response.errors) {
        alert("An error occured... Make sure you have Facebook permissions enabled! :(");
      } else {
        // if the person that drew on the image owns the cover,
        // request them to upload it to facebook
        if (app.user.id == app.drawer.id) {
          fb_id = response.facebook_identifier
          console.log(app.COVER_PHOTO_SET_URL + fb_id);
          alert("WOOT");
        }
      }
    }).error(function() {
      alert("An error occurred :(");
    });



  }).error(function() {
    console.log("ERROR");
    alert('Could not reach api.imgur.com. Sorry :(');
  });



}

$(document).ready(function() {
  // only run this if we are on the app page
  if ($("#cover-photo").length > 0) {
    app.initialize();
  }
});
