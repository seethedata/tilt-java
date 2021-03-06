var panels = [];
    var servers = [];
    zero_counter = 0;
    min_ts = 0; 

    $(document).ready(function() {
        $.ajaxSetup({ cache: false });
        });

    function create_server(server_port) {
        var server_template = '<button id="server_' + server_port + '" class="btn btn-primary" style="margin: 5px">' + 'Server ' + server_port + ': <span id="server_' + server_port + '_val" ' + 'class="badge">0</span></button>';
        $("#server_info").append(server_template)
        servers.push(server_port)
        return
    }

    function destroy_server(server_port) {
        $('#server_' + server_port).remove();
        servers.splice($.inArray(server_port,servers), 1);
        return
    }

    function create_panel(dev_id,os){
        // Grab a list of output panel divs
        var root_element = $('#outputpanels');
        var new_pane = 0;
    
        var panel_template =  '<div class="col-md-4 ' + dev_id +'">' +
                              '<div class="panel panel-default">' +
                              '<div class="panel-heading clearfix">' +
                              '<h4 class="panel-title pull-left"> Device ID: ' + dev_id +'</h4>' +
                              '<div class="panel-title pull-right">' + os + '</div></div>' +
                              '<div class="panel-body">' +
                              '<p>Left/Right Tilt: <span id="' + dev_id +'_TiltLR"></span></p>' +
                              '<p>Front/Back Tilt: <span id="' + dev_id +'_TiltFB"></span></p>' +
                              '<p>Direction: <span id="' + dev_id +'_Direction"></span></p>' +
                              '</div>' +
                              '</div>' + 
                              '</div>'

        // Create the panel in the identified pane
        root_element.append(panel_template);
        panels.push(dev_id);
        return;
    }

    function destroy_panel(dev_id){
        // Super easy with jQuery
        var element = $('.'+dev_id);
        element.empty();
        element.remove();

        // Remove from our list of panels
        panels.splice($.inArray(dev_id,panels), 1);
    }

    function scale_app(new_instances){
        $.ajax({
              type: "POST",
              url: "/scale",
              data: { instances: new_instances }});
    }

    function load_data() {
       $.getJSON('/safe_dump', { min_score: min_ts}, function(pos_data) {
           console.log(pos_data.timestamp);
           min_ts = pos_data.timestamp; 
           dev_ids_found = [];
           entries = pos_data.data
           if (entries.length > 0) {
               zero_counter = 0;
               // Split the entries into an array
               // We want to display just the latest entry from each device id we know
               dev_ids_found = [];
               for (var i=0; i<entries.length; i++) {
                   dev_data = JSON.parse(entries[i])
                   if ($.inArray(dev_data.devid,dev_ids_found) == -1) {   // Entry not already found
                       dev_ids_found.push(dev_data.devid);
                       if ($.inArray(dev_data.devid,panels) == -1) {      // If we don't have a panel, create one
                           create_panel(dev_data.devid,dev_data.OS);
                       } 
                       $("#"+dev_data.devid+"_TiltLR").text(dev_data.TiltLR);
                       $("#"+dev_data.devid+"_TiltFB").text(dev_data.TiltFB);
                       $("#"+dev_data.devid+"_Direction").text(dev_data.Direction);
                   }
               } 
           
               // Cross check our panels list and remove any that do not exist anymore
               for (var i=0; i<panels.length; i++) {
                   if ($.inArray(panels[i], dev_ids_found) == -1) {
                       destroy_panel(panels[i])
                   }
               }
           } else {
               zero_counter++;
               if (zero_counter > 5) {
                   for (var i=0; i<panels.length; i++) {
                       if ($.inArray(panels[i], dev_ids_found) == -1) {
                           destroy_panel(panels[i])
                       }
                   }
                   zero_counter=0;
               }
           }

           entries = pos_data.instance;
           servers_found = [];
           if (entries.length > 0) {
               servers_found = [];
               for (var i=0; i < entries.length; i++) {
                   server_data = entries[i].split(":");
                   server_data.shift();

                   // If we don't know this server, add it
                   if ($.inArray(server_data[0],servers) == -1) {
                       create_server(server_data[0]);
                   }
                   servers_found.push(server_data[0])
                   $("#server_"+server_data[0]+"_val").text(server_data[1]);
               }
               for (var i=0; i < servers.length; i++) {
                   if ($.inArray(servers[i], servers_found) == -1) {
                       destroy_server(servers[i]);
                   }
               }
           }
        
       });
    } 
   /* load_data();
    setInterval(function(){
        load_data();
    }, 500);*/

