/*
 * ------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * bloodstones implementation : © Miles Whiticker <miles.whiticker@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */
 
const PROV_NONE = -1;
const PROV_START = 0;
const PROV_START_TRANS = 1;
const PROV_MOVE1 = 2;
const PROV_MOVE1_TRANS = 3;
const PROV_MOVE2 = 4;
const PROV_MOVE2_TRANS = 5;
const PROV_MOVE3 = 6;
const PROV_MOVE3_TRANS = 7;
const PROV_DANGER = 8;
const PROV_DANGER_TRANS = 9;
const PROV_SEA = 10;
const PROV_SEA_TRANS = 11;
const PROV_IMPASSABLE = 12;
const PROV_IMPASSABLE_TRANS = 13;
const PROV_QUEUED = 14;
const PROV_QUEUED_TRANS = 15;
const PROV_PLANNED = 16;
const PROV_PLANNED_TRANS = 17;
const PROV_BATTLE = 30;
const PROV_BATTLE_TRANS = 31;
const PROV_SELECT = 32;
const PROV_SELECT_TRANS = 33;

//flags to indicate buildable status, these are linked to a specific colour code
const PROV_BUILDABLE_NONE = 0;
const PROV_BUILDABLE_LAND = 18;
const PROV_BUILDABLE_LAND_TRANS = 19;
const PROV_BUILDABLE_LAND_EXP = 20;
const PROV_BUILDABLE_LAND_EXP_TRANS = 21;
const PROV_BUILDABLE_SEA = 22;
const PROV_BUILDABLE_SEA_TRANS = 23;

const BUILDABLE_HOVER_OFFSET = 6;

//these HOVER flags are linked to a buildable flag above, this is when the player mouses over the province 
const PROV_BUILDABLE_LAND_HOVER = 24;
const PROV_BUILDABLE_LAND_HOVER_TRANS = 25;
const PROV_BUILDABLE_SEA_HOVER = 26;
const PROV_BUILDABLE_SEA_HOVER_TRANS = 27;
const PROV_BUILDABLE_LAND_EXP_HOVER = 28;
const PROV_BUILDABLE_LAND_EXP_HOVER_TRANS = 29;

const PROV_INVALID = 34;
const PROV_INVALID_TRANS = 35;



define(
	[
		"dojo",
		"dojo/_base/declare"
	],
	function (dojo, declare){
		
		var instance = declare("_province_ui", null, {
			//put your functions here

			GetProvinceOverlayColour : function(overlay_type)
			{
				//see trello for the latest colour codes
				
				/*Overlay colours:

				Black: rgba(0, 0, 0, 0.500) hex(#000000) (impassable)

				Red: rgba(255, 0, 0, 0.500) hex(#ff0000) (dangerous)

				Yellow: rgba(248, 255, 82, 0.400) hex(#f8ff52) (move cost 2)

				Orange: rgba(248, 143, 93, 0.400) hex(#f88f5d) (move cost 3)

				White: rgba(255, 255, 255, 0.3) hex(#ffffff) (move cost 1)

				Blue rgba(35, 80, 255, 0.400) hex(#2350ff) (sea with friendly boat)
				*/
				
				var overlayColour = Colour(169,169,169,0.4);//"rgba(169, 169, 169, 0.4)";
				switch(overlay_type)
				{
					case PROV_NONE:
					{
						//invisible
						overlayColour = Colour(0,0,0,0);//"rgba(0, 0, 0, 0)";
						break;
					}
					case PROV_START:
					{
						//green
						overlayColour = Colour(0,127,0,1);//"rgba(0, 127, 0, 1)";
						
						//black
						//overlayColour = Colour(0,0,0,1);//"rgba(0, 0, 0, 1)";
						break;
					}
					case PROV_QUEUED:
					{
						//black
						overlayColour = Colour(100,100,100,1);//"rgba(0, 0, 0, 1)";
						break;
					}
					case PROV_MOVE1:
					{
						//white
						overlayColour = Colour(255,255,255,1);//"rgba(255, 255, 255, 1)";
						break;
					}
					case PROV_MOVE2:
					{
						//yellow
						overlayColour = Colour(248,255,82,1);//"rgba(248, 255, 82, 1)";
						break;
					}
					case PROV_MOVE3:
					{
						//orange
						overlayColour = Colour(248,143,93,1);//"rgba(248, 143, 93, 1)";
						break;
					}
					case PROV_DANGER:
					{
						//red
						overlayColour = Colour(255,0,0,1);//"rgba(255, 0, 0, 1)";
						break;
					}
					case PROV_SEA:
					{
						//blue
						overlayColour = Colour(35,80,255,1);//"rgba(35, 80, 255, 1)";
						break;
					}
					case PROV_IMPASSABLE:
					{
						//black
						overlayColour = Colour(0,0,0,1);//"rgba(0, 0, 0, 1)";
						break;
					}
					case PROV_START_TRANS:
					{
						//green
						overlayColour = Colour(0,127,0,0.4);//"rgba(0, 127, 0, 1)";
						
						//blue
						//overlayColour = Colour(0,127,255,0.4);//"rgba(0, 127, 0, 0.4)";
						break;
					}
					case PROV_QUEUED_TRANS:
					{
						overlayColour = Colour(100,100,100,0.3);//"rgba(0, 0, 0, 0.3)";
						break;
					}
					case PROV_MOVE1_TRANS:
					{
						overlayColour = Colour(255,255,255,0.3);//"rgba(255, 255, 255, 0.3)";
						break;
					}
					case PROV_MOVE2_TRANS:
					{
						overlayColour = Colour(248,255,82,0.4);//"rgba(248, 255, 82, 0.4)";
						break;
					}
					case PROV_MOVE3_TRANS:
					{
						overlayColour = Colour(248,143,93,0.4);//"rgba(248, 143, 93, 0.4)";
						break;
					}
					case PROV_DANGER_TRANS:
					{
						overlayColour = Colour(255,0,0,0.5);//"rgba(255, 0, 0, 0.5)";
						break;
					}
					case PROV_SEA_TRANS:
					{
						overlayColour = Colour(35,80,255,0.4);//"rgba(35, 80, 255, 0.400)";
						break;
					}
					case PROV_IMPASSABLE_TRANS:
					{
						overlayColour = Colour(0,0,0,0.5);//"rgba(0, 0, 0, 0.5)";			
						break;
					}
					case PROV_PLANNED:
					{
						//grey
						overlayColour = Colour(127,127,127,1);//"rgba(127, 127, 127, 1)";
						break;
					}
					case PROV_PLANNED_TRANS:
					{
						overlayColour = Colour(127,127,127,0.4);//"rgba(127, 127, 127, 0.4)";
						break;
					}
					case PROV_BUILDABLE_LAND:
					{
						overlayColour = Colour(255,255,255,1);//"rgba(255, 255, 255, 1)";
						break;
					}
					case PROV_BUILDABLE_LAND_TRANS:
					{
						overlayColour = Colour(255,255,255,0.3);//"rgba(255, 255, 255, 0.3)";
						break;
					}
					case PROV_BUILDABLE_LAND_HOVER:
					{
						overlayColour = Colour(211,211,211,1);//"rgba(211, 211, 211, 1)";
						break;
					}
					case PROV_BUILDABLE_LAND_HOVER_TRANS:
					{
						overlayColour = Colour(211,211,211,0.3);//"rgba(211, 211, 211, 0.3)";
						break;
					}
					case PROV_BUILDABLE_SEA:
					{
						overlayColour = Colour(35,80,255,1);//"rgba(35, 80, 255, 1.000)";
						break;
					}
					case PROV_BUILDABLE_SEA_TRANS:
					{
						overlayColour = Colour(35,80,255,0.4);//"rgba(35, 80, 255, 0.400)";
						break;
					}
					case PROV_BUILDABLE_SEA_HOVER:
					{
						overlayColour = Colour(0,0,139,1);//"rgba(0, 0, 139, 1.000)";
						break;
					}
					case PROV_BUILDABLE_SEA_HOVER_TRANS:
					{
						overlayColour = Colour(0,0,139,0.4);//"rgba(0, 0, 139, 0.400)";
						break;
					}
					case PROV_BUILDABLE_LAND_EXP:
					{
						overlayColour = Colour(248,255,82,1);//"rgba(255, 255, 255, 1)";
						break;
					}
					case PROV_BUILDABLE_LAND_EXP_TRANS:
					{
						overlayColour = Colour(248,255,82,0.4);//"rgba(255, 255, 255, 1)";
						break;
					}
					case PROV_BUILDABLE_LAND_EXP_HOVER:
					{
						overlayColour = Colour(248,255,82,1);//"rgba(255, 255, 255, 1)";
						break;
					}
					case PROV_BUILDABLE_LAND_EXP_HOVER_TRANS:
					{
						overlayColour = Colour(248,255,82,0.4);//"rgba(255, 255, 255, 1)";
						break;
					}
					case PROV_INVALID:
					{
						//pink
						overlayColour = Colour(255,100,200,1);//"rgba(255, 100, 200, 0.4)";
						break;
					}
					case PROV_INVALID_TRANS:
					{
						//pink
						overlayColour = Colour(255,100,200,0.4);//"rgba(255, 100, 200, 0.4)";
						break;
					}
					case PROV_BATTLE:
					{
						//orange
						overlayColour = Colour(255,165,0,1);
						break;
					}
					case PROV_BATTLE_TRANS:
					{
						//orange
						overlayColour = Colour(255,165,0,0.4);
						break;
					}
					case PROV_SELECT:
					{
						//cyan
						overlayColour = Colour(0,255,255,1);
						break;
					}
					case PROV_SELECT_TRANS:
					{
						//cyan
						overlayColour = Colour(0,255,255,0.4);
						break;
					}
					default:
					{
						console.log("WARNING: page::GetProvColour() passed in unknown overlay_type: " + overlay_type);
						return this.GetProvinceOverlayColour(PROV_INVALID);
					}
				}
				return overlayColour;
			},
			
			SetProvinceOverlay : function(province_info, overlay_type = PROV_NONE, label_type = LABEL_NONE, label_text = "")
			{
				var overlayColour = this.GetProvinceOverlayColour(overlay_type);
				var fillColour = this.GetProvinceOverlayColour(overlay_type + 1);	//i really hope this doesn't break when i forget to update it later
				this.SetProvinceOverlayColour(province_info, overlayColour, fillColour, label_type, label_text);
			},
			
			SetProvinceOverlayColour : function(province_info, overlayColour, fillColour, label_type = LABEL_NONE, label_text = "")
			{
				/*
				const PROV_NONE = -1;
				const PROV_MOVE1 = 0;
				const PROV_MOVE2 = 1;
				const PROV_MOVE3 = 2;
				const PROV_DANGER = 3;
				const PROV_SEA = 4;
				const PROV_IMPASSABLE = 5;

				const LABEL_NONE = -1;
				const LABEL_MOVECOST = 0;
				*/
				
				//console.log("page::SetProvinceOverlayColour()");
				//console.log(province_info);
				
				var canvas = dojo.byId("province_overlay_canvas");
				var context = canvas.getContext("2d");
				
				{
					//draw the polygon that will form the province overlay
					context.beginPath();
					
					//new method of doing province outlines
					var current_coords = {x:0,y:0};
					
					//calculate the scaling factor based on canvas dimensions
					var canvas = this.getProvinceOverlayCanvas();
					var box = dojo.marginBox(canvas);
					var scale_factor = this.svg_scale_factor;
					//var scale_factor = box.w / 2678;
					
					context.lineWidth = this.GetProvinceBorderWidth();
					context.strokeStyle = overlayColour.rgba();
					
					//iterate over the loaded path segments and draw them
					var last_control_point = {x:0,y:0};
					var was_last_control = false;
					for (let j in province_info.prov_path_segments)
					{
						var pathseg = province_info.prov_path_segments[j];
						//console.log(pathseg);
						
						var points_expected = this.GetSVGPathCommandPointsMax(pathseg.type)
						if(pathseg.points.length != points_expected)
						{
							//note: there seems to be some idiosyncracy with 'z' types here... i may need to debug this a bit more
							console.log("ERROR page::SetProvinceOverlayColour() attempting to draw nonstandard \'" + pathseg.type + "\' type path segment, expected " + points_expected + " points but found " + pathseg.points.length + " points");
							console.log(pathseg);
							console.log(province_info);
							continue;
						}
						
						switch(pathseg.type)
						{
							case 'm':
							{
								current_coords.x += pathseg.points[0].x * scale_factor;
								current_coords.y += pathseg.points[0].y * scale_factor;
								
								var current_coords_canvas = this.WorldToCanvasCoords(current_coords.x,current_coords.y);
								context.moveTo(current_coords_canvas.x, current_coords_canvas.y);
								break;
							}
							case 'M':
							{
								current_coords.x = pathseg.points[0].x * scale_factor;
								current_coords.y = pathseg.points[0].y * scale_factor;
								
								var current_coords_canvas = this.WorldToCanvasCoords(current_coords.x,current_coords.y);
								context.moveTo(current_coords_canvas.x, current_coords_canvas.y);
								break;
							}
							case 'c':
							{
								//console.log(pathseg.points);
								var control_point1 = {x:current_coords.x + pathseg.points[0].x * scale_factor, y:current_coords.y + pathseg.points[0].y * scale_factor};
								var control_point2 = {x:current_coords.x + pathseg.points[1].x * scale_factor, y:current_coords.y + pathseg.points[1].y * scale_factor};
								var end_point = {x:current_coords.x + pathseg.points[2].x * scale_factor, y:current_coords.y + pathseg.points[2].y * scale_factor};
								
								var control_point1_canvas = this.WorldToCanvasCoords(control_point1.x,control_point1.y);
								var control_point2_canvas = this.WorldToCanvasCoords(control_point2.x,control_point2.y);
								var end_point_canvas = this.WorldToCanvasCoords(end_point.x,end_point.y);
								
								context.bezierCurveTo(control_point1_canvas.x, control_point1_canvas.y, control_point2_canvas.x, control_point2_canvas.y, end_point_canvas.x, end_point_canvas.y);
								
								if(this.greatest_x < end_point_canvas.x)
								{
									this.greatest_x = end_point_canvas.x;
								}
								if(this.greatest_y < end_point_canvas.y)
								{
									this.greatest_y = end_point_canvas.y;
								}
								
								//update the current position of the draw cursor
								current_coords = end_point;
								was_last_control = true;
								last_control_point = control_point2;
								break;
							}
							case 'C':
							{
								var control_point1 = {x:pathseg.points[0].x * scale_factor, y:pathseg.points[0].y * scale_factor};
								var control_point2 = {x:pathseg.points[1].x * scale_factor, y:pathseg.points[1].y * scale_factor};
								var end_point = {x:pathseg.points[2].x * scale_factor, y:pathseg.points[2].y * scale_factor};
								
								var control_point1_canvas = this.WorldToCanvasCoords(control_point1.x,control_point1.y);
								var control_point2_canvas = this.WorldToCanvasCoords(control_point2.x,control_point2.y);
								var end_point_canvas = this.WorldToCanvasCoords(end_point.x,end_point.y);
								
								context.bezierCurveTo(control_point1_canvas.x, control_point1_canvas.y, control_point2_canvas.x, control_point2_canvas.y, end_point_canvas.x, end_point_canvas.y);
								
								//update the current position of the draw cursor
								current_coords = end_point;
								was_last_control = true;
								last_control_point = control_point2;
								break;
							}
							case 's':
							{
								//relative smooth curve (bezier with control point reflected from previous segment)
								//reflect the last control point and reuse it
								var control_point1 = current_coords;
								if(was_last_control)
								{
									this.ReflectPoint(last_control_point, current_coords);
								}
								var control_point2 = {x:current_coords.x + pathseg.points[0].x * scale_factor, y:current_coords.y + pathseg.points[0].y * scale_factor};
								var end_point = {x:current_coords.x + pathseg.points[1].x * scale_factor, y:current_coords.y + pathseg.points[1].y * scale_factor};
								
								var control_point1_canvas = this.WorldToCanvasCoords(control_point1.x,control_point1.y);
								var control_point2_canvas = this.WorldToCanvasCoords(control_point2.x,control_point2.y);
								var end_point_canvas = this.WorldToCanvasCoords(end_point.x,end_point.y);
								
								context.bezierCurveTo(control_point1_canvas.x, control_point1_canvas.y, control_point2_canvas.x, control_point2_canvas.y, end_point_canvas.x, end_point_canvas.y);
								
								current_coords = end_point;
								was_last_control = true;
								last_control_point = control_point2;
								break;
							}
							case 'S':
							{
								var control_point1 = current_coords;
								if(was_last_control)
								{
									this.ReflectPoint(last_control_point, current_coords);
								}
								var control_point2 = {x:pathseg.points[0].x * scale_factor, y:pathseg.points[0].y * scale_factor};
								var end_point = {x:pathseg.points[1].x * scale_factor, y:pathseg.points[1].y * scale_factor};
								
								var control_point1_canvas = this.WorldToCanvasCoords(control_point1.x,control_point1.y);
								var control_point2_canvas = this.WorldToCanvasCoords(control_point2.x,control_point2.y);
								var end_point_canvas = this.WorldToCanvasCoords(end_point.x,end_point.y);
								
								context.bezierCurveTo(control_point1_canvas.x, control_point1_canvas.y, control_point2_canvas.x, control_point2_canvas.y, end_point_canvas.x, end_point_canvas.y);
								
								current_coords = end_point;
								was_last_control = true;
								last_control_point = control_point2;
								break;
							}
						}
					}
					//this.greatest_x = 0;
					//this.greatest_y = 0;
					//context.closePath();
					context.stroke();
					
					//fill in the coloured province overlay
					//changing globalCompositeOperation here is a trick that makes the province outline draw on top of the province fill
					context.globalCompositeOperation = "destination-over";
					context.fillStyle = fillColour.rgba();
					context.fill();
					context.globalCompositeOperation = "source-over";
				}
				
				var label_node_id = "province_label_" + province_info.name;
				switch(label_type)
				{
					case LABEL_NONE:
					{
						//clear the old node if it exists
						dojo.destroy(label_node_id);
						break;
					}
					case LABEL_MOVECOST:
					{
						//clear the old node if it exists
						dojo.destroy(label_node_id);
						
						//place a new label node
						var label_node = dojo.place("<div class=\"province_move_cost\" id=\"" + label_node_id + "\">" + label_text + "</div>", "centrepanel");
						
						//adjust the position to the middle of the province
						var province_node = dojo.byId(province_info.name);
						
						//have the text be centered
						var label_x = Number(province_node.style.left.slice(0,-2));
						var label_y = Number(province_node.style.top.slice(0,-2));
						
						var label_position = dojo.position(label_node);
						
						label_x -= label_position.w/2;
						label_y -= label_position.h/2;
						
						label_node.style.left = label_x + "px";
						label_node.style.top = label_y  + "px";
						
						//console.log(label_position);
						break;
					}
					default:
					{
						console.log("WARNING: page::AddProvinceOverlay() passed in unknown label_type:" + label_type);
						break;
					}
				}
			},
			
			ReflectPoint : function(start_point, pivot_point)
			{
				//used for 's' type (smooth curveto) in svg path elements
				var diff = {x: pivot_point.x - start_point.x, y: pivot_point.y - start_point.y};
				var reflected = {x: start_point.x + diff.x, y: start_point.y + diff.y};
				
				return reflected;
			},
			
			GetAreaElementNameFromProv : function(province_info)
			{
				return "area_" + province_info.name;
			},
			
			GetProvNameFromAreaElement : function(area_element_name)
			{
				return area_element_name.substring(5);
			},
			
			GetProvZoneName : function(province_info)
			{
				return province_info.name + "_zone";
			},
			
			DebugDrawValidMoveLinks : function()
			{
				console.log("page::DebugDrawValidMoveLinks()");
				console.log(this.provinces);
				this.ClearCanvas();
				
				//loop over all provinces
				for(var cur_prov_id = 0; cur_prov_id < this.provinces.length; cur_prov_id++)
				{
					//loop over all connected provinces
					var cur_prov_info = this.provinces[cur_prov_id];
					
					//note: this will do a lot of redundant render calls but it's ok because this is a debug function
					for(var move_link_index = 0; move_link_index < cur_prov_info.movelinks.length; move_link_index++)
					{
						var move_link = cur_prov_info.movelinks[move_link_index];
						this.AddProvinceMoveLinkPath(move_link.path_segments, PROV_MOVE1);
					}
				}
			},
			
			DebugDrawProvinceConnections : function()
			{
				console.log("page::DebugDrawAllMovelinks()");
				console.log(this.provinces);
				this.ClearCanvas();
				
				const canvas = document.getElementById("province_overlay_canvas");
				const context = canvas.getContext("2d");

				//draw the movelinks that are sent to us from the server
				for(var prov_id in this.provinces)
				{
					var cur_prov_info = this.provinces[prov_id];
					for(var linked_prov_index in cur_prov_info.linked_prov_ids)
					{
						var linked_prov_id = cur_prov_info.linked_prov_ids[linked_prov_index];
						var other_prov_info = this.provinces[linked_prov_id];
						
						//draw a debug line between these two provinces
						context.beginPath();
						context.lineWidth = 2;
						context.strokeStyle = "red";
						
						var scale_factor = this.svg_scale_factor;
						var cur_centre = this.WorldToCanvasCoords(cur_prov_info.centre.x * scale_factor, cur_prov_info.centre.y * scale_factor);
						var other_centre = this.WorldToCanvasCoords(other_prov_info.centre.x * scale_factor, other_prov_info.centre.y * scale_factor);
						
						context.moveTo(cur_centre.x, cur_centre.y);
						context.lineTo(other_centre.x, other_centre.y);
						context.stroke();
						
						//console.log("drawing line " + cur_prov_info.name + " -> " + other_prov_info.name + " : " + cur_prov_info.centre.ToString() + " to " + other_prov_info.centre.ToString());
					}
				}
			},
			
			DebugDrawAllProvinceOutlines : function()
			{
				console.log("page::DebugDrawAllProvinceOutlines()");
				console.log(this.provinces);
				this.ClearCanvas();
				
				const canvas = document.getElementById("province_overlay_canvas");
				const context = canvas.getContext("2d");
				
				//var box = dojo.marginBox(canvas);
				//console.log(box);
				
				//draw the province outlines we loaded from svg
				this.greatest_x = 0;
				this.greatest_y = 0;
				for(var prov_id in this.provinces)
				{
					var cur_prov_info = this.provinces[prov_id];
					
					var overlayColour = this.GetProvinceOverlayColour(PROV_MOVE1);
					var fillColour = this.GetProvinceOverlayColour(PROV_MOVE1 + 1);
					this.SetProvinceOverlayColour(cur_prov_info, overlayColour, fillColour);
				}
				//console.log("greatest_x:" + this.greatest_x + " | greatest_y:" + this.greatest_y);
			},
			
			GetProvinceBorderWidth : function()
			{
				return (this.province_border_width * this.map_view_scale) / this.map_view_scale;
			},
		});
			
		return instance;
	}
);
