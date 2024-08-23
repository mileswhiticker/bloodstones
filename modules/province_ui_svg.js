/*
 * ------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * bloodstones implementation : © Miles Whiticker <miles.whiticker@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */
 
define(
	[
		"dojo",
		"dojo/_base/declare",
		"dojo/request/xhr"
	],
	function (dojo, declare, xhr){
		
		var instance = declare("_province_ui_svg", null, {
			//put your functions here
			
			LoadProvinceSVGs : function()
			{
				//this is only used once when importing svg files to make up the province outlines
				//aka it's mostly unused but kept here for future support and help with map implementing
				this.test_provinces = this.provinces;
				//this.provinces = [];
				
				const gamemap = dojo.byId("gamemap");
				//hidden container to hold our loaded svg files
				const svg_container = dojo.place("<div style=\"display: none;\"></div>",gamemap);
				
				var mapname = "map-1";
				var loaded_provinces = [];
				this.provinces_limit = 3;
				for(var i=1; i<=this.provinces_limit; i++)
				{
					var provname = "province-" + i;
					var file_path = g_gamethemeurl + "img/" + mapname + "-" + provname + ".svg";
					/*
					let prov_svg = await fetch(file_path);
					let myText = await myObject.text();
					console.log(myText);
					*/
					
					//load the svg containing the province outline
					xhr(file_path, {
					}).then(
					function(data){
						//the data here is a document fragment consisting of an entire svg-xml document
						//we have to  place it then sort through to get the specific node we want
						var node = dojo.place(data, svg_container);
						
						//we only want this child node, it has the interesting stuff in it
						var svg_node = svg_container.childNodes[2];
						//console.log(svg_node);
						
						//remove all these unneeded nodes from the html DOM
						while (svg_container.hasChildNodes())
						{
							svg_container.removeChild(svg_container.firstChild);
						}
						
						//get to the path data
						var svg_path_data = svg_node.childNodes[1].childNodes[1].getAttribute("d");
						//console.log(svg_path_data);
						
						//create this province
						var new_prov = {
							name: provname,
							type:"Plains",
							movement_links: [],
							vertices: [],
							collision_radius: 200,
							centre: {x:100,y:100},
							offset: {x:0,y:0},
							zone:null
						};
						
						//random province type for testing
						var prov_type_index = Math.floor(Math.random() * gameui.all_province_types.length);
						new_prov.type = gameui.all_province_types[prov_type_index];
						
						//todo: how are we doing movement links?
						//
						
						//parse the svg data to get our province outline
						//this is the same semantics for both svg path and html canvas path, which is convenient
						var canvas = dojo.byId("province_overlay_canvas");
						var context = canvas.getContext("2d");
						new_prov.prov_path_segments = gameui.ParseSVGPath(svg_path_data,context,new_prov.offset);
						//console.log(new_prov.prov_path_segments);
						
						//we are now finished with this newly loaded province
						loaded_provinces.push(new_prov);
					}, 
					function(err)
					{
						// Handle the error condition
						console.log(err);
					},
					function(evt)
					{
						// Handle a progress event from the request if the
						// browser supports XHR2
						//console.log(evt);
					});
				}
			},
			
			ParseSVGPath : function(svg_path_string, draw_context, coord_offset)
			{
				//this is unused, moved to svg export script
				//console.log("page::ParseSVGPath()");
				//console.log(coord_offset);
				//for a good reference see https://css-tricks.com/svg-path-syntax-illustrated-guide/
				//for a good visualiser see https://svg-path-visualizer.netlify.app/
				//applet to test and experiment with regex https://regexr.com/
				
				//in this function, I reinvent the wheel because apparently the svg object handling in js has been deprecated for about 8 years and not replaced yet
				//this is a script parser of the minified svg path d attribute
				//it should be safe because each svg used for province layout is static and will go through a lot of QA testing to identify any issues
				
				//console.log("page::DrawSVGPath() svg_path_string: " + svg_path_string);
				//console.log("page::DrawSVGPath()");
				
				//cant use string split() because of the different rules for splitting
				//test_element_array = svg_path_string.split(/[a-z]/);
				
				//loop over the string and extract all the elements of the svg path
				path_terms = [];
				
				//loop over each char individually
				var currentPathSeg = {points: [], type: "", absolute: false};
				var allPathSegs = [];
				
				var current_type = "M";
				
				//var working_string = "";
				var current_coord = "";
				for(var c in svg_path_string)
				{
					var current_char = svg_path_string[c];
					
					//first, check if we need to export 
					
					//first, check if we need to export the current command
					var export_coord = false;
					var export_pathSeg = false;
					if(current_char.search(/[a-zA-Z]/) != -1)
					{
						current_type = current_char;
						current_char = "";
						
						if(currentPathSeg.type != "")
						{
							export_pathSeg = true;
							export_coord = true;
						}
						else
						{
							currentPathSeg.type = current_type;
						}
					}
					else if(currentPathSeg.points.length >= this.GetSVGPathCommandPointsMax(current_type) && currentPathSeg.points[currentPathSeg.points.length - 1].y != "")
					{
						export_pathSeg = true;
					}
					else if(current_char.search(/[,]/) != -1)
					{
						export_coord = true;
						current_char = "";
					}
					else if(current_char.search(/[-]/) != -1)
					{
						export_coord = true;
					}
					else if(c == svg_path_string.length - 1)
					{
						export_coord = true;
						export_pathSeg = true;
					}
					else if(current_char == "." && current_coord.search(/[.]/) != -1)
					{
						export_coord = true;
					}
					
					if(export_coord)
					{
						if(current_coord[0] == ".")
						{
							current_coord = "0" + current_coord
						}
						else if(current_coord.substring(0,2) == "-.")
						{
							current_coord = current_coord.slice(1);
							current_coord = "-0" + current_coord;
						}
						
						if(currentPathSeg.points.length == 0)
						{
							var val = Number(current_coord);
							currentPathSeg.points.push({x:val,y:""});
						}
						else
						{
							lastPoint = currentPathSeg.points[currentPathSeg.points.length - 1];
							if(lastPoint.x == "")
							{
								//console.log("CHECK1");
								var val = Number(current_coord);// + Number(coord_offset.x);
								lastPoint.x = val;
							}
							else if(lastPoint.y == "")
							{
								//console.log("CHECK2");
								var val = Number(current_coord);// + Number(coord_offset.y)
								lastPoint.y = val;
							}
							else
							{
								//console.log("CHECK3");
								var val = Number(current_coord);// + Number(coord_offset.x)
								currentPathSeg.points.push({x:val,y:""});
							}
						}
						current_coord = "";
					}
					if(export_pathSeg)
					{
						//does this segment use absolute or relative coordinates?
						if(currentPathSeg.type.search(/[a-z]/) != -1)
						{
							currentPathSeg.absolute = false;
						}
						else if(currentPathSeg.type.search(/[A-Z]/) != -1)
						{
							currentPathSeg.absolute = true;
						}
						else
						{
							//sanity check
							console.log("WARNING: page::DrawSVGPath() unable to determine relative or absolute coords for pathseg with current_type: " + current_type);
						}
						
						allPathSegs.push(currentPathSeg);
						currentPathSeg = {points: [], type: current_type, absolute: false};
					}
					
					current_coord += current_char;
				}
				
				//console.log(allPathSegs);
				return allPathSegs;
			},
			
			GetSVGPathCommandPointsMax : function(command)
			{
				if(command.search(/[lL]/) != -1)
				{
					return 2;
				}
				if(command.search(/[mM]/) != -1)
				{
					return 1;
				}
				if(command.search(/[zZ]/) != -1)
				{
					return 1;
				}
				if(command.search(/[cC]/) != -1)
				{
					return 3;
				}
				if(command.search(/[sS]/) != -1)
				{
					return 2;
				}
				
				console.log("ERROR: page::GetSVGPathCommandPointsMax() unknown command: " + command);
				return -1;
			},
			
		});
			
		return instance;
	}
);
