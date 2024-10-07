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
				var do_debug = false;
				for (let i in this.provinces)
				{
					//grab the next province object
					let province = this.provinces[i];
					
					//create the DOM element for holding buildings and armies etc in the province
					let province_div = document.createElement("div");
					province_div.id = province.name;
					gamemap.appendChild(province_div);
					
					//now create the mouse interaction area of this province
					let area_element = document.createElement("area");
					area_element.id = this.GetAreaElementNameFromProv(province);
					area_element.shape = "poly";
					area_element.style.position = "absolute";
					area_element.dataset.province_id = province_div.id;
					//dojo.style(area_element, 'z-index', this.GameLayerProvinceInteract());
					
					provinceclickareas.appendChild(area_element,true);
					
					//mouse interaction callback
					dojo.connect(area_element, "click", dojo.hitch(this, this.onClickProvince));
					area_element.ondragenter = window.gameui.onDragEnterProvince;
					area_element.ondragleave = window.gameui.onDragLeaveProvince;
					area_element.ondragover = window.gameui.onDragOverProvince;
					area_element.ondrop = window.gameui.onDropProvince;
					
					area_element.draggable = true;
					area_element.ondragstart = window.gameui.MapDragStart;
					area_element.ondrag = window.gameui.MapDrag;
					
					//console.log(province.name + ": " + province_div.style.cssText);
					
					//create a div to hold the zone which will hold all the armies in this province
					let zone_div = document.createElement("div");
					zone_div.id = this.GetProvZoneName(province);
					//dojo.style(zone_div, 'position', "absolute");
					//console.log("setting " + zone_div.id + " z index to -20");
					//dojo.style(zone_div, 'z-index', this.GameLayerDefault());
					//zone_div.style.zIndex = this.GameLayerDefault();
					province_div.appendChild(zone_div);
					
					//create an ebg/zone to hold all the armies
					var newZone = new modules.ArmyZone();
					newZone.create(this, zone_div, this.army_tile_scale * this.zone_item_width_base, this.army_tile_scale * this.zone_item_height_base);
					newZone.setPattern("ellipticalfit");
					province.zone = newZone;
					this.all_army_zones.push(newZone);
					
					//this function will create the outline and make sure it's properly scaled for the current user zoom level
					this.RegenerateProvinceUI(province, context, area_element, do_debug);
					
					//to add or remove an element from this zone, use:
					//zone.placeInZone( <object_id>, <weight> );
					//zone.removeFromZone( <object_id>, <destroy?>, <to> );
					
					do_debug = false;
				}
			},
			
			RegenerateProvinceUI : function(province, context, area_element = null, do_debug = false)
			{
				if(do_debug)
				{
					console.log("page::RegenerateProvinceUI()");
					//console.log(province);
					//console.log(this.provinces);
				}
				var scale_factor = this.svg_scale_factor;
				
				this.RegenerateProvincePolygon(province, context, do_debug);
				var area_element_name = this.GetAreaElementNameFromProv(province);
				if(!area_element)
				{
					area_element = dojo.byId(area_element_name);
				}
				if(do_debug)
				{
					//console.log(area_element_name);
					console.log(area_element);
					console.log(province);
				}
				area_element.coords = province.drag_area_poly;
				
				let province_div = dojo.byId(province.name);
				var province_centre_canvas = this.WorldToCanvasCoords(province.centre.x * scale_factor, province.centre.y * scale_factor);
				province_div.setAttribute("style","width:1px;height:1px;position:absolute;" + 
					"left:" + province_centre_canvas.x + "px;top:" + province_centre_canvas.y + "px;");
				
				let zone_div = dojo.byId(this.GetProvZoneName(province));
				var adjusted_zone_radius = this.map_province_radius * this.map_view_scale;
				zone_div.setAttribute("style","width:" + (2 * adjusted_zone_radius) + "px;height:" + (2 * adjusted_zone_radius) + "px;" + 
					"left:" + (-adjusted_zone_radius) + "px;top:" + (-adjusted_zone_radius) + "px;position:absolute;");
				/*zone_div.setAttribute("style","width:" + 0 + "px;height:" + 0 + "px;" + 
					"left:" + 0 + "px;top:" + 0 + "px;position:absolute;");*/
			},
			
			RegenerateProvincePolygon : function(province, context, debug_draw = false)
			{
				if(debug_draw)
				{
					console.log("page::RegenerateProvincePolygon(" + debug_draw + ")");
					console.log(province);
				}
				//new way of doing province outlines using shiny svg path data
				
				//for debug drawing
				//var canvas = dojo.byId("province_overlay_canvas");
				//var context = canvas.getContext("2d");
				if(debug_draw)
				{
					context.beginPath();
					//context.moveTo(0,0);
					context.lineWidth = this.GetProvinceBorderWidth();
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
