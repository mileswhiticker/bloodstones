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
		"dojo/_base/declare"
	],
	function (dojo, declare){
		
		var instance = declare("_province_ui_setup", null, {
			//put your functions here
			
			SetupProvinceUI : function(canvas)
			{
				//console.log("page::SetupProvinceUI(" + canvas + ", [" + this.provinces.length + "])");
				var context = canvas.getContext("2d");
				var provinceclickareas = dojo.byId("provinceclickareas");
				for (let i in this.provinces)
				{
					//grab the next province object
					let province = this.provinces[i];
					
					//create the DOM element for holding buildings and armies etc in the province
					let province_div = document.createElement("div");
					province_div.id = province.name;
					gamemap.appendChild(province_div);
					
					//now create the droppable area element
					let area_element = document.createElement("area");
					area_element.id = this.GetAreaElementNameFromProv(province);
					//console.log("area_element.id: " + area_element.id);
					area_element.shape = "poly";
					area_element.style.position = "absolute";
					area_element.dataset.province_id = province_div.id;
					provinceclickareas.appendChild(area_element,true);
					dojo.style(area_element, 'zIndex', this.GameLayerProvinceInteract());
					
					//add event listeners so the drop area can be dropped onto
					/*
					area_element.addEventListener("dragenter", dragenter_handler);
					area_element.addEventListener("dragover", dragover_handler);
					area_element.addEventListener("dragleave", dragleave_handler);
					area_element.addEventListener("drop", onNodeDrop);
					*/
					dojo.connect(area_element, "click", dojo.hitch(this, this.onClickProvince));
					
					area_element.ondragenter = gameui.onDragEnterProvince;
					area_element.ondragleave = gameui.onDragLeaveProvince;
					area_element.ondragover = gameui.onDragOverProvince;
					area_element.ondrop = gameui.onDropProvince;
					
					//console.log(province.name + ": " + province_div.style.cssText);
					
					//create a div to hold the zone which will hold all the armies in this province
					let zone_div = document.createElement("div");
					zone_div.id = province.name + '_zone';
					province_div.appendChild(zone_div);
					
					//create an ebg/zone to hold all the armies
					var newZone = new modules.ArmyZone();
					newZone.create(this, zone_div, 50, 50);
					newZone.setPattern("ellipticalfit");
					province.zone = newZone;
					
					//to add or remove an element from this zone, use:
					//zone.placeInZone( <object_id>, <weight> );
					//zone.removeFromZone( <object_id>, <destroy?>, <to> );
					
					this.RegenerateProvinceUI(province, context);
				}
				
				this.GenerateProvinceLinks();
				
				//this.PHPProvinceExport();
			},
			
			RegenerateProvinceUI : function(province, context)
			{
				//console.log("page::RegenerateProvinceUI()");
				//console.log(province);
				var scale_factor = this.svg_scale_factor;
				
				this.RegenerateProvincePolygon(province, context);
				var area_element_name = this.GetAreaElementNameFromProv(province);
				//console.log("area_element_name: " + area_element_name);
				let area_element = dojo.byId(area_element_name);
				area_element.coords = province.drag_area_poly;
				
				let province_div = dojo.byId(province.name);
				var province_centre_canvas = this.WorldToCanvasCoords(province.centre.x * scale_factor, province.centre.y * scale_factor);
				province_div.setAttribute("style","width:1px;height:1px;position:absolute;" + 
					"left:" + province_centre_canvas.x + "px;top:" + province_centre_canvas.y + "px;");
				
				let zone_div = dojo.byId(province.name + "_zone");
				var adjusted_zone_radius = province.collision_radius * this.map_view_scale;
				zone_div.setAttribute("style","width:" + (2 * adjusted_zone_radius) + "px;height:" + (2 * adjusted_zone_radius) + "px;" + 
					"left:" + (-adjusted_zone_radius) + "px;top:" + (-adjusted_zone_radius) + "px;position:absolute;");
				/*zone_div.setAttribute("style","width:" + 0 + "px;height:" + 0 + "px;" + 
					"left:" + 0 + "px;top:" + 0 + "px;position:absolute;");*/
			},
			
			RegenerateProvincePolygon : function(province, context, debug_draw = false)
			{
				//broken provinces: 17, 55, 74
				if(province.name != "prov55")
				{
					//debug_draw = false;
				}
				if(debug_draw)
				{
					//console.log("page::RegenerateProvincePolygon(" + debug_draw + ")");
					//console.log(province);
				}
				//new way of doing province outlines using shiny svg path data
				
				//for debug drawing
				//var canvas = dojo.byId("province_overlay_canvas");
				//var context = canvas.getContext("2d");
				if(debug_draw)
				{
					context.beginPath();
					//context.moveTo(0,0);
					context.lineWidth = this.province_border_width * this.map_view_scale;
					//console.log(context.lineWidth);
					var debug_colour = this.getProvinceDebugColour(province);
					//console.log(debug_colour);
					context.strokeStyle = debug_colour.rgba();
					//console.log(context.strokeStyle);
				}
				
				var current_coords = {x:0,y:0};
				var scale_factor = this.svg_scale_factor;
				province.drag_area_poly = "";
				for (let j in province.prov_path_segments)
				{
					var pathseg = province.prov_path_segments[j];
					var points_expected = this.GetSVGPathCommandPointsMax(pathseg.type)
					if(pathseg.points.length != points_expected)
					{
						//note: there seems to be some idiosyncracy with 'z' types here... i may need to debug this a bit more
						console.log("ERROR page::RegenerateProvincePolygon() attempting to draw nonstandard \'" + pathseg.type + "\' type path segment, expected " + points_expected + " points but found " + pathseg.points.length + " points");
						console.log(pathseg);
						console.log(province);
						continue;
					}
					
					//see https://www.w3schools.com/graphics/svg_path.asp for more info
					//todo: handle 's' type smooth curves
					//it's low priority but it might need fixing for some weird bugs
					switch(pathseg.type)
					{
						case 'm':
						{
							//relative moveto
							current_coords.x += pathseg.points[0].x * scale_factor;
							current_coords.y += pathseg.points[0].y * scale_factor;
							break;
						}
						case 'M':
						{
							//absolute moveto
							current_coords.x = pathseg.points[0].x * scale_factor;
							current_coords.y = pathseg.points[0].y * scale_factor;
							break;
						}
						case 'z':
						{
							//relative close path, treat it the same as 'm'
							current_coords.x += pathseg.points[0].x * scale_factor;
							current_coords.y += pathseg.points[0].y * scale_factor;
							break;
						}
						case 'Z':
						{
							//absolute close path, treat it the same as 'M'
							current_coords.x = pathseg.points[0].x * scale_factor;
							current_coords.y = pathseg.points[0].y * scale_factor;
							break;
						}
						case 'c':
						{
							//relative curveto (cubic bezier)
							var control_point1 = {x:current_coords.x + pathseg.points[0].x * scale_factor, y:current_coords.y + pathseg.points[0].y * scale_factor};
							var control_point2 = {x:current_coords.x + pathseg.points[1].x * scale_factor, y:current_coords.y + pathseg.points[1].y * scale_factor};
							var end_point = {x:current_coords.x + pathseg.points[2].x * scale_factor, y:current_coords.y + pathseg.points[2].y * scale_factor};
							
							current_coords = end_point;
							break;
						}
						case 'C':
						{
							//absolute curveto (cubic bezier)
							var control_point1 = {x:pathseg.points[0].x * scale_factor, y:pathseg.points[0].y * scale_factor};
							var control_point2 = {x:pathseg.points[1].x * scale_factor, y:pathseg.points[1].y * scale_factor};
							var end_point = {x:pathseg.points[2].x * scale_factor, y:pathseg.points[2].y * scale_factor};
							
							current_coords = end_point;
							break;
						}
						case 's':
						{
							//relative smooth curve (bezier with control point reflected from previous segment)
							//reflect the last control point and reuse it
							var control_point1 = current_coords;
							var control_point2 = {x:current_coords.x + pathseg.points[0].x * scale_factor, y:current_coords.y + pathseg.points[0].y * scale_factor};
							var end_point = {x:current_coords.x + pathseg.points[1].x * scale_factor, y:current_coords.y + pathseg.points[1].y * scale_factor};
							
							current_coords = end_point;
							break;
						}
						case 'S':
						{
							//absolute smooth curve (bezier with control point reflected from previous segment)
							//reflect the last control point and reuse it
							var control_point1 = current_coords;
							var control_point2 = {x:pathseg.points[0].x * scale_factor, y:pathseg.points[0].y * scale_factor};
							var end_point = {x:pathseg.points[1].x * scale_factor, y:pathseg.points[1].y * scale_factor};
							
							current_coords = end_point;
							break;
						}
					}
					
					//now put this vertex into the drag area
					//unfortunately this one can only go polygons, no nice curves here 
					//todo: check this... polygons are probably sufficient though as long as the drawn curves arent too big
					if(province.drag_area_poly.length > 0)
					{
						province.drag_area_poly += ",";
					}
					var poly_vertex_canvas = this.WorldToCanvasCoords(current_coords.x, current_coords.y);
					province.drag_area_poly += (poly_vertex_canvas.x) + "," + (poly_vertex_canvas.y);
					if(debug_draw)
					{
						context.lineTo(poly_vertex_canvas.x, poly_vertex_canvas.y);
						//console.log(poly_vertex_canvas);
					}
				}
				
				if(debug_draw)
				{
					context.stroke();
					debug_colour.a = 127;
					context.globalCompositeOperation = "destination-over";
					context.fillStyle = debug_colour.rgba();
					context.fill();
					context.globalCompositeOperation = "source-over";
				}
				//console.log("province.drag_area_poly: " + province.drag_area_poly);
			},
			
			GenerateProvinceLinks : function()
			{
				//console.log("page::GenerateProvinceLinks()");
				//loop over move links and try to link them to a province
				//use a simple distance check
				var debug_move_link = false;
				
				for(var prov_id in this.provinces)
				{
					var cur_prov = this.provinces[prov_id];
					cur_prov.movement_link_paths = [];
					if(debug_move_link)	console.log("checking province " + prov_id);
					if(debug_move_link)	console.log("cur_prov:");
					if(debug_move_link)	console.log(cur_prov);
					var server_prov_info = this.gamedatas.all_provinces[prov_id];
					if(debug_move_link)	console.log("server_prov_info:");
					if(debug_move_link)	console.log(server_prov_info);
					for(var linked_prov_index in server_prov_info.movement_links)
					{
						//i was getting really frustrated at this point, the debug logging was unreadably dense
						
						var linked_prov_id = server_prov_info.movement_links[linked_prov_index];
						var linked_prov = this.provinces[linked_prov_id];
						if(!linked_prov.movement_link_paths)
						{
							linked_prov.movement_link_paths = [];
						}
						
						if(debug_move_link)	console.log("linked_prov_index:" + linked_prov_index);
						if(debug_move_link)	console.log("linked_prov_id:" + linked_prov_id);
						if(debug_move_link)	console.log("linked_prov:");
						if(debug_move_link)	console.log(linked_prov);
						
						
						
						//var new_move_link = {linked_provinces: [linked_prov, cur_prov], path_segments: []};
						
						
						
						//does it already contain this link?
						var this_move_link = {target_prov: linked_prov, path_segments: []};
						//cur_prov.movement_link_paths.push(this_move_link);
						if(!cur_prov.movement_link_paths.includes(linked_prov.name))
						{
							cur_prov.movement_link_paths[linked_prov.name] = this_move_link;
						}
						
						//does it already contain this link?
						var other_move_link = {target_prov: cur_prov, path_segments: []};
						//linked_prov.movement_link_paths.push(other_move_link);
						if(!linked_prov.movement_link_paths.includes(cur_prov.name))
						{
							linked_prov.movement_link_paths[cur_prov.name] = other_move_link;
						}
						
						//if(debug_move_link)	console.log("new_move_link:");
						//if(debug_move_link)	console.log(new_move_link);
						
						//find if this one has a SVG defined move path
						
					}
					debug_move_link = false;
				}
				
				//rather than recalculate the move link here based on distance, we will simply copy them from the php to reduce redundancy 
				//however we still need to find the svg paths
				//this.move_links is a mega array saved in javascript with a bunch of points
				debug_move_link = false;
				var links_success = 0;
				var links_partial = 0;
				var links_fail = 0;
				var links_manual = 0;
				for(var i in this.move_links)
				{
					var move_link = this.move_links[i];
					if(debug_move_link)	console.log("checking link " + i);
					
					//loop over all provinces to find the closest one
					var working_vertex = {x: 0, y: 0};
					for(var k in move_link.path_segments)
					{
						//var current_vertex = {x: 0, y: 0};
						var pathseg = move_link.path_segments[k];
						switch(pathseg.type)
						{
							case 'm':
							{
								//relative moveto
								working_vertex.x += pathseg.points[0].x;
								working_vertex.y += pathseg.points[0].y;
								break;
							}
							case 'M':
							{
								//absolute moveto
								working_vertex.x = pathseg.points[0].x;
								working_vertex.y = pathseg.points[0].y;
								break;
							}
							case 'c':
							{
								//relative curveto (bezier cubic)
								working_vertex.x += pathseg.points[2].x;
								working_vertex.y += pathseg.points[2].y;
								break;
							}
							case 'C':
							{
								//absolute curveto (bezier cubic)
								working_vertex.x = pathseg.points[2].x;
								working_vertex.y = pathseg.points[2].y;
								break;
							}
							default:
							{
								console.log("WARNING page::GenerateProvinceLinks() unknown pathseg.type (" + pathseg.type + ")");
								break;
							}
						}
						
						//if this is the first or last vertex, we want to try and link to a province
						var found_province = null;
						var found_dist_sqrd = 99999999999999;
						if(k == 0 || k == (move_link.path_segments.length - 1))
						{
							if(debug_move_link)	console.log("checking k:" + k);
							for(var j in this.provinces)
							{
								var check_prov = this.provinces[j];
								var check_dist_sqrd = (working_vertex.x - check_prov.centre.x)**2 + (working_vertex.y - check_prov.centre.y)**2;
								if(!found_province || check_dist_sqrd < found_dist_sqrd)
								{
									found_province = check_prov;
									found_dist_sqrd = check_dist_sqrd;
								}
							}
							move_link.linked_provinces.push(found_province);
							if(found_province.name == "prov8")
							{
								//debug_move_link = true;
							}
							if(debug_move_link)	console.log("linked to province:");
							if(debug_move_link)	console.log(found_province);
						}
					}
					if(debug_move_link)	console.log("move_link:");
					if(debug_move_link)	console.log(move_link);
					
					//finally, check the province links sent by the server and try to connect to this movement path
					
					if(debug_move_link)	console.log("now connecting path to move links");
					
					var provs_successfully_linked = 0;
					
					var cur_prov = move_link.linked_provinces[0];
					var other_prov = move_link.linked_provinces[1];
					
					var success = false;
					for(var check_prov_name in cur_prov.movement_link_paths)
					{
						if(check_prov_name == other_prov.name)
						{
							success = true;
							break;
						}
					}
					//if(cur_prov.movement_link_paths.includes(other_prov.name))
					if(success)
					{
						provs_successfully_linked++;
					}
					else
					{
						if(debug_move_link)	console.log("manually linking " + cur_prov.name + " and " + other_prov.name + "(1st)");
						var cur_move_link = {target_prov: other_prov, path_segments: []};
						cur_prov.movement_link_paths[other_prov.name] = cur_move_link;
						links_manual++;
					}
					cur_prov.movement_link_paths[other_prov.name].path_segments = move_link.path_segments;
					//if(other_prov.movement_link_paths.includes(cur_prov.name))
					success = false;
					for(var check_prov_name in other_prov.movement_link_paths)
					{
						if(check_prov_name == cur_prov.name)
						{
							success = true;
							break;
						}
					}
					if(success)
					{
						provs_successfully_linked++;
					}
					else
					{
						if(debug_move_link)	console.log("manually linking " + other_prov.name + " and " + cur_prov.name + " (2nd)");
						var other_move_link = {target_prov: cur_prov, path_segments: []};
						other_prov.movement_link_paths[cur_prov.name] = other_move_link;
						links_manual++;
					}
					other_prov.movement_link_paths[cur_prov.name].path_segments = move_link.path_segments;
					
					if(debug_move_link)	console.log(cur_prov);
					if(debug_move_link)	console.log(other_prov);
					
					/*
					for(j in move_link.linked_provinces)
					{
						var cur_prov = move_link.linked_provinces[j];
						if(debug_move_link)	console.log("j:");
						if(debug_move_link)	console.log(j);
						if(debug_move_link)	console.log("cur_prov:");
						if(debug_move_link)	console.log(cur_prov);
						var success = false;
						for(var movement_link_start_prov_name in cur_prov.movement_link_paths)
						{
							var movement_link_path = cur_prov.movement_link_paths[movement_link_start_prov_name];
							if(debug_move_link)	console.log("movement_link_start_prov_name:");
							if(debug_move_link)	console.log(movement_link_start_prov_name);
							//if(debug_move_link)	console.log("movement_link_path:");
							//if(debug_move_link)	console.log(movement_link_path);
							if(move_link.linked_provinces.includes(movement_link_start_prov_name))                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
							{
								movement_link_path.path_segments = move_link.path_segments;
								success = true;
								provs_successfully_linked++;
								break;
							}
						}
						if(!success)
						{
							if(debug_move_link)	console.log("WARNING: we calculated " + check_prov.name + " was connected to move_link" + i + " at position " + j + " but it's not in their list of move links from the server");
						}
					}
					*/
					if(provs_successfully_linked == 2)
					{
						links_success++;
					}
					/*else if(provs_successfully_linked == 1)
					{
						links_partial++;
					}
					else
					{
						links_fail++;
					}*/
					
					debug_move_link = false;
				}
				//console.log("FINISHED. links_success: " + links_success + ", links_partial:" + links_partial + ", links_fail: " + links_fail + ", links_manual: " + links_manual);
			},
			
			PHPProvinceExport : function()
			{
				//this function will export the needed province and movelink info in php format as a string
				//that way i can manually copy it over to the php
				console.log("page::PHPProvinceExport()");
				console.log(this.provinces);
				console.log(this.move_links_filtered);
				
				var php_provinces_export = "$all_provinces = [";
				var first_element = true;
				var do_debug = false;
				for(var prov_id in this.provinces)
				{
					/*if(prov_id == 0 || prov_id == 7)
					{
						do_debug = true;
					}
					else
					{
						do_debug = false;
					}*/
					
					//special handling to properly add , after each element except the last
					if(first_element)
					{
						first_element = false;
					}
					else
					{
						php_provinces_export += ",";
					}
					
					//grab the first province
					var cur_province = this.provinces[prov_id];
					if(do_debug) console.log("entering new province...");
					if(do_debug) console.log(cur_province);
					
					//first part of the province info
					php_provinces_export += "[\"id\"=>" + prov_id + "," + "\"type\" => \"" + cur_province.type + "\",\"movement_links\" => [";
					
					//find the movement links
					var first_linked_element = true;

					for(var i in cur_province.movement_link_paths)
					{
						var move_link = cur_province.movement_link_paths[i];
						for(var k in move_link.linked_provinces)
						{
							var check_prov = move_link.linked_provinces[k];
							if(check_prov.name != cur_province.name)
							{
								if(do_debug) console.log("linking...");
								if(do_debug) console.log(check_prov);
								//once again add a , after each element except the last
								if(first_linked_element)
								{
									first_linked_element = false;
								}
								else
								{
									php_provinces_export += ",";
								}
								
								//get the id of this province and add it to the php list
								var linked_prov_id = this.GetProvinceIdFromName(check_prov.name);
								if(do_debug) console.log("linked_prov_id: " + linked_prov_id);
								php_provinces_export += linked_prov_id;
							}
						}
					}
					php_provinces_export += "]]";
				}
				php_provinces_export += "];";
				
				//copy the inner text of this node from the page
				//it's slightly easier this way for a massive block of text than copying from the debug console
				dojo.place("<div id=\"provinces_php_export\" style=\"display:hidden\">" + php_provinces_export + "</div>", "gamewindow");
			},
		});
		
		return instance;
	}
);
